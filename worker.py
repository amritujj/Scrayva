import os
import tempfile

# Use a cross-platform temp directory (works on both Windows and Linux/Render)
if os.name == "nt":
    # Windows: use a local tmp folder to avoid system temp permission issues
    _SAFE_TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tmp")
else:
    # Linux/Render: use the standard system temp directory
    _SAFE_TMP = tempfile.gettempdir()

os.makedirs(_SAFE_TMP, exist_ok=True)
os.environ["TMP"]    = _SAFE_TMP
os.environ["TEMP"]   = _SAFE_TMP
os.environ["TMPDIR"] = _SAFE_TMP
tempfile.tempdir     = _SAFE_TMP

# ── FIX: Force Playwright to look inside the virtual environment for browsers ──
# Render securely bundles the virtualenv to production but deletes the global .cache folder.
# By setting this to 0, Playwright installs and checks for browsers inside site-packages
# ensuring they survive the transit from the Build container to the Runtime container.
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "0"


import sys
import json
import logging
import traceback
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from browser_use import Agent

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# ── Load .env file ──────────────────────────────────────────────────────────────
# Must run BEFORE any os.environ reads so .env values are available.
# override=False means real OS / Render env vars always win over .env values.
try:
    from dotenv import load_dotenv
    load_dotenv(override=False)
except ImportError:
    pass  # python-dotenv not installed — fall back to OS env vars only

# ── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scrayva.worker")

if sys.platform == "win32":
    # Required for Playwright to spawn subprocesses on Windows asyncio.
    # However, Uvicorn in --reload mode forces the SelectorEventLoop anyway, causing NotImplementedError.
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    # ── Monkey-patch Windows Event Loop for browser-use ─────────────────────────
    # browser-use tries to register SIGINT/SIGTERM handlers which throws
    # NotImplementedError natively on Windows. We safely bypass it here.
    import asyncio.windows_events
    def dummy_add_signal_handler(*args, **kwargs):
        pass
    def dummy_remove_signal_handler(*args, **kwargs):
        return True
    
    asyncio.windows_events.ProactorEventLoop.add_signal_handler = dummy_add_signal_handler
    asyncio.windows_events.ProactorEventLoop.remove_signal_handler = dummy_remove_signal_handler

    if "reload" in os.environ.get("UVICORN_RELOAD", "").lower() or any("--reload" in arg for arg in sys.argv):
        logger.warning(
            "⚠ Windows Uvicorn --reload detected. Playwright async launch will likely crash "
            "with NotImplementedError due to event loop conflicts. Run without --reload to fix."
        )

# ── Startup env-var validation ───────────────────────────────────────────────────
# Core vars required for agent task execution
REQUIRED_VARS: dict[str, str] = {
    "GEMINI_API_KEY": "Google Gemini API access",
    "SUPABASE_URL": "Supabase project URL",
    "SUPABASE_SERVICE_ROLE_KEY": "Supabase service-role key",
}

# Optional vars — only needed for Voice features, not core agent tasks
OPTIONAL_VARS: dict[str, str] = {
    "SARVAM_API_KEY": "Sarvam AI access for Voice features",
}

IS_HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"



def _check_env() -> list[str]:
    """Log presence/absence of each required var (values are never printed)."""
    missing = []
    for var, purpose in REQUIRED_VARS.items():
        present = bool(os.environ.get(var))
        status = "✓ present" if present else "✗ MISSING"
        logger.info("  %-35s %s  (%s)", var, status, purpose)
        if not present:
            missing.append(var)
    return missing

logger.info("=" * 60)
logger.info("Scrayva Worker — environment variable check")
logger.info("=" * 60)
_missing_at_startup = _check_env()
if _missing_at_startup:
    logger.warning(
        "Worker started with missing env vars: %s. "
        "Set them in your .env file (local) or Render dashboard (production).",
        ", ".join(_missing_at_startup),
    )
else:
    logger.info("All required env vars are present. Worker is ready.")

# ── Runtime dependency diagnostics ──────────────────────────────────────────────
# Checked once at startup. Results are stored in RUNTIME and exposed via
# GET /runtime-check so issues are diagnosable without reading server logs.
#
# Root cause of "DLL load failed while importing _greenlet" on Windows:
#   Often caused by missing Microsoft Visual C++ Redistributable dependencies.
# Fix sequence:
#   1. Install/repair Microsoft Visual C++ Redistributable
#   2. Reboot Windows
#   3. Reinstall greenlet, playwright, browser-use
#   4. Reinstall Chromium

RUNTIME: dict = {
    "greenlet": {"ok": False, "version": None, "error": None},
    "playwright": {"ok": False, "version": None, "chromium_path": None, "error": None},
    "browser_use": {"ok": False, "version": None, "error": None},
}

# 1. greenlet — must load successfully before playwright can import
try:
    import greenlet as _gl
    RUNTIME["greenlet"]["ok"] = True
    RUNTIME["greenlet"]["version"] = getattr(_gl, "__version__", "unknown")
    logger.info("✓ greenlet %s loaded successfully", RUNTIME["greenlet"]["version"])
except Exception as _e:
    RUNTIME["greenlet"]["error"] = str(_e)
    _err_str = str(_e)
    if "DLL load failed while importing _greenlet" in _err_str:
        logger.error(
            "✗ greenlet import FAILED with DLL load error: %s\n"
            "  This is likely a Windows Visual C++ Redistributable issue.\n"
            "  Check the /runtime-check endpoint for the recommended fix sequence.",
            _e,
        )
    else:
        logger.error(
            "✗ greenlet import FAILED: %s\n"
            "  Fix: pip install greenlet --force-reinstall\n"
            "  Or: pip install greenlet>=3.0.3 --force-reinstall",
            _e,
        )

# 2. playwright — only attempt if greenlet loaded
if RUNTIME["greenlet"]["ok"]:
    try:
        import playwright as _pw
        try:
            from importlib.metadata import version as _get_version
            RUNTIME["playwright"]["version"] = _get_version("playwright")
        except Exception:
            RUNTIME["playwright"]["version"] = getattr(_pw, "__version__", "unknown")
            
        # Defer Chromium executable and launch checks to avoid asyncio loop collisions
        RUNTIME["playwright"]["ok"] = False
        RUNTIME["playwright"]["error"] = "Pending async validation"
        logger.info(
            "✓ Playwright %s imported (async launch validation pending)",
            RUNTIME["playwright"]["version"],
        )
    except Exception as _e:
        RUNTIME["playwright"]["error"] = f"{type(_e).__name__}: {str(_e)}"
        logger.error(
            "✗ Playwright import FAILED: %s\n"
            "  Fix: pip install playwright",
            _e,
        )
else:
    RUNTIME["playwright"]["error"] = "Skipped — greenlet failed to load"
    logger.warning("  (playwright check skipped — greenlet not available)")

# 3. browser-use — only attempt if playwright was imported
if RUNTIME["playwright"]["version"] is not None:
    try:
        import browser_use as _bu
        RUNTIME["browser_use"]["version"] = getattr(_bu, "__version__", "unknown")
        RUNTIME["browser_use"]["ok"] = True
        logger.info("✓ browser-use %s imported successfully", RUNTIME["browser_use"]["version"])
    except Exception as _e:
        RUNTIME["browser_use"]["error"] = str(_e)
        logger.error("✗ browser-use import FAILED: %s", _e)
else:
    RUNTIME["browser_use"]["error"] = "Skipped — playwright not available"
    logger.warning("  (browser-use check skipped — playwright not available)")

if all(v["ok"] for v in RUNTIME.values()):
    logger.info("✓ All static runtime dependencies verified. Awaiting async verification.")
else:
    failed = [k for k, v in RUNTIME.items() if not v["ok"] and v["error"] != "Pending async validation"]
    if failed:
        logger.warning("⚠ Runtime issues detected with: %s. /run-agent will fail until fixed.", failed)


# ── App Lifespan (Startup) ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Run async validation checks (like testing Headless Chrome via Playwright)
    safely *after* the FastAPI event loop has officially started.
    """
    if RUNTIME["playwright"]["version"] is not None and not RUNTIME["playwright"]["ok"]:
        logger.info("Starting async Playwright launch validation...")
        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as _p:
                chromium_path = _p.chromium.executable_path
                RUNTIME["playwright"]["chromium_path"] = chromium_path
                
                # Check if we can actually launch it
                browser = await _p.chromium.launch(headless=IS_HEADLESS)
                await browser.close()
                logger.info("✓ Playwright async logic verified — Chromium at %s launched successfully", chromium_path)
                
                RUNTIME["playwright"]["ok"] = True
                RUNTIME["playwright"]["error"] = ""
        except Exception as _e:
            err_msg = f"{type(_e).__name__}: {str(_e)}"
            RUNTIME["playwright"]["ok"] = False
            RUNTIME["playwright"]["error"] = f"Check failed: {err_msg}"
            
            if "Executable doesn't exist" in err_msg or "executablePath" in err_msg:
                logger.warning("Chromium executable missing. Auto-installing asynchronously (non-blocking)...")
                try:
                    # MUST use asyncio subprocess — blocking subprocess.run() freezes the
                    # event loop for the full download duration (~3 min) and Render's HTTP
                    # health checker gets no response → Render kills the service.
                    import subprocess as _sp
                    _install_proc = await asyncio.create_subprocess_exec(
                        "python", "-m", "playwright", "install", "chromium-headless-shell",
                        stdout=_sp.PIPE,
                        stderr=_sp.STDOUT,
                    )
                    _install_stdout, _ = await _install_proc.communicate()
                    if _install_proc.returncode != 0:
                        raise RuntimeError(f"playwright install exited {_install_proc.returncode}: {(_install_stdout or b'').decode()[-500:]}")
                    logger.info("Auto-installation complete. Retrying launch verification...")
                    from playwright.async_api import async_playwright
                    async with async_playwright() as _p_retry:
                        browser = await _p_retry.chromium.launch(headless=IS_HEADLESS)
                        await browser.close()
                        RUNTIME["playwright"]["chromium_path"] = _p_retry.chromium.executable_path
                        RUNTIME["playwright"]["ok"] = True
                        RUNTIME["playwright"]["error"] = ""
                        logger.info("✓ Playwright async logic verified successfully after auto-install")
                except Exception as retry_err:
                    err_msg = f"Auto-install failed: {type(retry_err).__name__}: {str(retry_err)}"
                    RUNTIME["playwright"]["error"] = err_msg
                    logger.error("✗ Playwright auto-install and retry FAILED: %s", err_msg)
            elif "NotImplementedError" in err_msg and sys.platform == "win32":
                logger.error(
                    "✗ Playwright async check FAILED: NotImplementedError\n"
                    "  Cause: Uvicorn's --reload mode breaks Playwright subprocess event loops on Windows.\n"
                    "  Fix: Stop the server and restart without --reload.",
                )
            else:
                logger.error("✗ Playwright async check FAILED (browser launch error): %s", err_msg)
    
    if all(v["ok"] for v in RUNTIME.values()):
        logger.info("✓ All runtime dependencies fully verified. Worker is completely ready.")

    # ── Startup recovery: fix tasks orphaned by a previous Render restart ─────────
    # When Render redeploys (on a git push), it sends SIGTERM to the running process.
    # Any task in "running" state at that moment gets stuck forever because the new
    # worker instance has no memory of it. On every boot we reset those tasks.
    try:
        _recovery_sb = get_supabase_client()
        _orphaned = (
            _recovery_sb.table("tasks")
            .update({
                "status": "failed",
                "error": "Worker restarted during execution (Render redeploy). Please retry your task.",
            })
            .eq("status", "running")
            .execute()
        )
        _count = len(_orphaned.data) if _orphaned.data else 0
        if _count:
            logger.warning("⚠ Startup recovery: reset %d orphaned 'running' task(s) to 'failed'.", _count)
        else:
            logger.info("✓ Startup recovery: no orphaned tasks found.")
    except Exception as _rec_err:
        logger.error("Startup recovery failed (non-fatal): %s", _rec_err)

    yield  # Normal app traffic executes while yielding

    # ── Graceful shutdown: mark any still-active tasks as failed ──────────────────
    if ACTIVE_TASKS:
        logger.warning("Shutdown: %d active task(s) will be interrupted.", len(ACTIVE_TASKS))
        try:
            _shutdown_sb = get_supabase_client()
            for _tid in list(ACTIVE_TASKS.keys()):
                _shutdown_sb.table("tasks").update({
                    "status": "failed",
                    "error": "Worker shut down during task execution. Please retry.",
                }).eq("id", _tid).execute()
                logger.info("[task:%s] Marked as failed due to worker shutdown.", _tid)
        except Exception as _sd_err:
            logger.error("Shutdown task cleanup failed: %s", _sd_err)




# ── App ──────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Scrayva Worker", lifespan=lifespan)

# ── CORS ─────────────────────────────────────────────────────────────────────────
# Default allows local Next.js dev server on both localhost aliases.
# In production, set ALLOWED_ORIGINS=https://yourdomain.com (comma-separated).
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
logger.info("CORS allowed origins: %s", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Supabase helpers ──────────────────────────────────────────────────────────────
def get_supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    return create_client(supabase_url, supabase_key)


def _set_task_status(
    supabase: Client,
    task_id: str,
    status: str,
    result: dict | None = None,
):
    """Update task row; swallows its own errors so they never mask the real error."""
    try:
        payload: dict = {"status": status}
        if result is not None:
            payload["result"] = result
        supabase.table("tasks").update(payload).eq("id", task_id).execute()
        logger.info("[task:%s] Status → %s", task_id, status)
    except Exception as exc:
        logger.error("[task:%s] Failed to set status=%s: %s", task_id, status, exc)


# ── Schema ────────────────────────────────────────────────────────────────────────
class AgentRequest(BaseModel):
    prompt: str
    task_id: str
    tier: str = "Free"       # passed from Next.js API — used to set queue delay
    priority: int = 0        # 0=Free, 1=Pro, 2=Ultimate — for logging

class DebugAgentRequest(BaseModel):
    task_id: str


# ── Tier configuration ────────────────────────────────────────────────────────────
# queue_delay_s : seconds to sleep before starting the agent run.
#   Free tier tasks sleep while Pro/Ultimate tasks that arrive during this window
#   will be picked up by the worker first (natural priority queue).
# max_steps     : how many browser steps the agent is allowed to take.
TIER_CONFIG = {
    "Free":     {"queue_delay_s": 30,  "max_steps": 15},
    "Pro":      {"queue_delay_s": 0,   "max_steps": 15},
    "Ultimate": {"queue_delay_s": 0,   "max_steps": 20},
    "None":     {"queue_delay_s": 30,  "max_steps": 15},  # unactivated account = Free
}


# ── Global Task State ─────────────────────────────────────────────────────────────
ACTIVE_TASKS: dict[str, asyncio.Task] = {}

# ── Gemini API key rotation ────────────────────────────────────────────────────────
# Rotates round-robin across all comma-separated keys in GEMINI_API_KEY.
# Different keys belong to different Google AI Studio projects — each has its own quota.
_KEY_INDEX: int = 0

def _get_next_api_key() -> str:
    global _KEY_INDEX
    raw = os.environ.get("GEMINI_API_KEY", "")
    keys = [k.strip() for k in raw.split(",") if k.strip()]
    if not keys:
        return ""
    key = keys[_KEY_INDEX % len(keys)]
    _KEY_INDEX = (_KEY_INDEX + 1) % len(keys)
    logger.info("Using Gemini API key #%d of %d", (_KEY_INDEX), len(keys))
    return key

import base64

async def _screenshot_loop(browser, supabase: Client, task_id: str):
    """Periodically captures screenshots of the browser and drops them as a base64 string into the DB."""
    timeout_extended = False
    first_iteration = True
    while True:
        try:
            pw_browser = await browser.get_playwright_browser()
            if pw_browser and pw_browser.contexts:
                context = pw_browser.contexts[0]

                # Fix Playwright's 30s default nav timeout — Render's network needs more breathing room.
                # We set this once on the first available context. Subsequent Page.goto calls will use 90s.
                if not timeout_extended:
                    try:
                        context.set_default_navigation_timeout(45_000)  # 45s — 3 failures × 45s = 135s, under 240s total
                        context.set_default_timeout(45_000)
                        timeout_extended = True
                        logger.info("[task:%s] ✓ Extended Playwright navigation timeout to 45s", task_id)
                    except Exception as te:
                        logger.warning("[task:%s] Could not extend nav timeout: %s", task_id, te)

                if context.pages:
                    page = context.pages[0]
                    # Take a quick, low-quality JPEG to preserve DB bandwidth on Render
                    screenshot_bytes = await page.screenshot(type="jpeg", quality=40)
                    b64 = base64.b64encode(screenshot_bytes).decode("utf-8")
                    data_uri = f"data:image/jpeg;base64,{b64}"
                    
                    # Update exclusively the screenshot field
                    try:
                        supabase.table("tasks").update({"screenshot": data_uri}).eq("id", task_id).execute()
                    except Exception as exc:
                        logger.warning("[task:%s] Screenshot update failing (missing column?): %s", task_id, exc)
                    finally:
                        # Explicitly free memory to prevent Render OOM
                        del screenshot_bytes
                        del b64
                        del data_uri

        except asyncio.CancelledError:
            break
        except Exception as e:
            pass # Transient issues like page closed while shooting

        # First tick at 1s so we set the timeout ASAP; then settle to 3s cadence.
        await asyncio.sleep(1 if first_iteration else 3)
        first_iteration = False


async def _background_run_agent(task_id: str, prompt: str, tier: str, priority: int, queue_delay: int, max_steps: int):
    # Init Supabase
    logger.info("[task:%s] Step 0.5 — Initializing Supabase client", task_id)
    try:
        supabase = get_supabase_client()
        logger.info("[task:%s] Supabase client initialised successfully", task_id)
    except ValueError as exc:
        logger.error("[task:%s] Supabase init failed: %s", task_id, exc)
        return

    # ── Tier-based queue delay ────────────────────────────────────────────────────
    if queue_delay > 0:
        logger.info(
            "[task:%s] ⏳ Tier=%s — applying %ds queue delay before execution starts. "
            "Pro/Ultimate tasks will be picked up ahead of this one during the wait.",
            task_id, tier, queue_delay,
        )
        await asyncio.sleep(queue_delay)
        logger.info("[task:%s] ⏰ Queue delay elapsed. Starting execution now.", task_id)

    # Mark running — task will never be stuck at "queued" after this
    _set_task_status(supabase, task_id, "running")

    # ── Agent execution ───────────────────────────────────────────────────────────
    try:
        final_result_str = None
        # max_attempts = number of available API keys.
        # Each attempt calls _get_next_api_key() which advances _KEY_INDEX by 1.
        # So if task uses keys 1→2→3, _KEY_INDEX lands on 4 and the next task starts there.
        _available_keys = [k.strip() for k in os.environ.get("GEMINI_API_KEY", "").split(",") if k.strip()]
        max_attempts = max(1, len(_available_keys))  # at most one attempt per API key
        agent_failure_data = None
        
        for attempt in range(1, max_attempts + 1):
            browser_instance = None
            try:
                logger.info("[task:%s] Executing Agent run attempt %d / %d...", task_id, attempt, max_attempts)
                
                # ── Step 1: Launch browser FIRST (before any gRPC/LLM init) ──────────────
                # CRITICAL ordering: Playwright forks a Chrome subprocess using fork().
                # If gRPC (used by Gemini SDK) has active threads when fork() runs,
                # gRPC skips its fork-handlers → Chrome inherits broken network FDs
                # → ALL page.goto() calls timeout. Always fork Chrome before gRPC connects.
                from browser_use import Browser
                from browser_use.browser.browser import BrowserConfig
                _CHROMIUM_ARGS = [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-blink-features=AutomationControlled",
                    "--no-zygote",                           # skip zygote process to avoid double-fork gRPC clash
                    "--disable-features=VizDisplayCompositor,site-per-process", # site-per-process disables out-of-process iframes saving massive RAM
                    "--mute-audio",
                    "--window-size=1280,720",
                    "--disable-extensions",                  # Save RAM by not loading extensions
                    "--disable-software-rasterizer",         # Save RAM by disabling CPU rasterizer
                    "--disable-default-apps",
                    "--js-flags=--max-old-space-size=256"    # Limit V8 engine memory
                ]
                browser_instance = Browser(
                    config=BrowserConfig(
                        headless=IS_HEADLESS,
                        disable_security=True,
                        extra_chromium_args=_CHROMIUM_ARGS,
                    )
                )
                logger.info("[task:%s] Step 1/5 — Browser launched (before gRPC init)", task_id)

                # ── Step 2: Init Gemini LLM ──────────────────────────────────────────────────
                # - Model: gemini-1.5-flash → 1500 RPD free tier (vs 2.5-flash's 20 RPD)
                # - transport="rest" → forces HTTP instead of gRPC; eliminates ALL gRPC fork() 
                #   conflicts permanently, even when multiple tasks run back-to-back.
                # - Key rotation: round-robin so each task uses a different API key from the
                #   comma-separated GEMINI_API_KEY list (each Google project = separate quota).
                logger.info("[task:%s] Step 2/5 — Initialising Google Gemini LLM", task_id)
                from langchain_google_genai import ChatGoogleGenerativeAI

                _model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
                _primary_key = _get_next_api_key()

                llm = ChatGoogleGenerativeAI(
                    model=_model,
                    temperature=0.0,
                    google_api_key=_primary_key,
                    max_retries=0, # Disable LangChain's internal 60s retry block so we can instantly rotate to the next key on a 429 quota failure
                    # Note: do NOT set transport="rest" — REST returns sync GenerateContentResponse
                    # which langchain's async _achat_with_retry cannot await, breaking every call.
                )
                logger.info("[task:%s] Step 2/5 — Gemini LLM ready (model=%s)", task_id, _model)
                
                # Wrap the user prompt with explicit browser-use instructions.
                wrapped_prompt = (
                    f"{prompt}\n\n"
                    "IMPORTANT INSTRUCTIONS:\n"
                    "1. You MUST use your browser tools to navigate to relevant websites and extract the requested information.\n"
                    "2. Do NOT answer from memory — always browse the web to get fresh, accurate data.\n"
                    "3. When you have collected all the requested information, call the 'done' action with a clear, complete summary of your findings.\n"
                    "4. Format your final answer as structured text or JSON so it is easy to read."
                )

                agent = Agent(
                    task=wrapped_prompt,
                    llm=llm,
                    browser=browser_instance,
                    max_failures=3,   # 3 failures max — with 45s nav timeout that's 3×45=135s, safely under 240s
                    use_vision=False,
                )
                logger.info("[task:%s] Step 2/5 — Agent created", task_id)

                logger.info("[task:%s] Step 3/5 — agent.run() started (max_steps=%d, timeout=240s)", task_id, max_steps)
                screenshot_task = asyncio.create_task(_screenshot_loop(browser_instance, supabase, task_id))

                # Wrap in a named task so we can force-cancel it even if browser-use
                # exception handlers swallow asyncio.CancelledError internally.
                agent_task = asyncio.create_task(agent.run(max_steps=max_steps))
                try:
                    result = await asyncio.wait_for(asyncio.shield(agent_task), timeout=240.0)
                except asyncio.TimeoutError:
                    logger.error("[task:%s] ✗ Hard 240s timeout reached — force-cancelling agent task.", task_id)
                    agent_task.cancel()
                    try:
                        await asyncio.wait_for(agent_task, timeout=10.0)
                    except (asyncio.CancelledError, asyncio.TimeoutError):
                        pass
                    raise  # re-raise so the outer TimeoutError handler marks the task failed
                finally:
                    screenshot_task.cancel()
                    try:
                        await asyncio.wait_for(screenshot_task, timeout=5.0)
                    except (asyncio.CancelledError, asyncio.TimeoutError):
                        pass
                
                final_result_str = result.final_result()
                
                if not final_result_str or final_result_str.strip() == "":
                    logger.warning("[task:%s] Attempt %d: final_result() is empty.", task_id, attempt)

                    # ── STEP A: Detect quota failure FIRST ───────────────────────────────────
                    # Must run before fallback extraction — otherwise junk agent history text
                    # gets returned as "fallback", masking the 429 and preventing key rotation.
                    _history_text = ""
                    try:
                        _h = result.history if hasattr(result, "history") else []
                        for _step in _h:
                            for _ar in (getattr(_step, "result", None) or []):
                                _history_text += str(getattr(_ar, "error", "") or "") + " "
                    except Exception:
                        pass
                    _is_quota_failure = (
                        "429" in _history_text
                        or "TooManyRequests" in _history_text
                        or "ResourceExhausted" in _history_text
                        or "quota" in _history_text.lower()
                    )

                    if _is_quota_failure and attempt < max_attempts:
                        logger.warning(
                            "[task:%s] Attempt %d/%d: API key quota exhausted (429). "
                            "Rotating to next API key.",
                            task_id, attempt, max_attempts,
                        )
                        continue  # _get_next_api_key() will be called at the top of the next attempt

                    if _is_quota_failure and attempt >= max_attempts:
                        logger.error(
                            "[task:%s] All %d API keys exhausted due to quota. Task failed.",
                            task_id, max_attempts,
                        )
                        agent_failure_data = {
                            "error": "All API keys have exceeded their daily quota (429). Please retry tomorrow or add more Gemini API keys.",
                            "exception_type": "QuotaExhausted",
                        }
                        break

                    # ── STEP B: Try fallback extraction (only if not a quota failure) ────────
                    logger.warning("[task:%s] Attempting multi-stage fallback extraction.", task_id)
                    fallback_text = None

                    try:
                        history_list = result if isinstance(result, list) else getattr(result, "history", [])
                        
                        if history_list:
                            for step in reversed(history_list):
                                if hasattr(step, "result") and step.result:
                                    for ar in reversed(step.result):
                                        if hasattr(ar, "extracted_content") and ar.extracted_content:
                                            fallback_text = str(ar.extracted_content).strip()
                                            break
                                        if hasattr(ar, "output") and ar.output and "error" not in str(ar.output).lower():
                                            fallback_text = str(ar.output).strip()
                                            break
                                    if fallback_text: break
                                        
                            if not fallback_text:
                                for step in reversed(history_list):
                                    if hasattr(step, "model_output") and step.model_output:
                                        candidate = getattr(step.model_output, "text", None) or getattr(step.model_output, "content", None)
                                        if candidate and str(candidate).strip():
                                            fallback_text = str(candidate).strip()
                                            break

                            if not fallback_text:
                                last_step = history_list[-1]
                                dump_str = str(last_step.model_dump() if hasattr(last_step, "model_dump") else last_step)
                                fallback_text = dump_str[:4000]

                    except Exception as fallback_err:
                        logger.warning("[task:%s] Unified fallback failed: %s", task_id, fallback_err)

                    if fallback_text:
                        logger.info("[task:%s] Fallback extraction succeeded. Marking task completed.", task_id)
                        fallback_result = {
                            "note": "Agent returned empty final_result. Fallback text used.",
                            "fallback_text": fallback_text,
                        }
                        _set_task_status(supabase, task_id, "completed", fallback_result)
                        return

                    if attempt < max_attempts:
                        logger.info("[task:%s] No fallback text found. Retrying with next key...", task_id)
                        continue
                    
                    urls = result.urls() if hasattr(result, "urls") else []
                    history_errors = result.errors() if hasattr(result, "errors") else []
                    agent_failure_data = {
                        "error": "Agent completed without extracted final content",
                        "urls": urls,
                        "history_errors": [str(e) for e in history_errors],
                        "exception_type": "EmptyResultError",
                        "exception_repr": "Agent run completed without returning string payload or fallback text",
                        "traceback": "No system traceback. Agent finished early without calling final_result.",
                        "raw_result": "No fallback text found in last history step either.",
                        "current_url": urls[-1] if urls else None
                    }
                    break
                
                logger.info("[task:%s] Step 3/5 — agent.run() finished successfully on attempt %d", task_id, attempt)
                break
                
            except asyncio.TimeoutError as exc:
                if attempt < max_attempts:
                    logger.warning("[task:%s] Attempt %d timed out. Retrying...", task_id, attempt)
                    continue
                agent_failure_data = {
                    "error": "Agent execution timed out strictly after multiple attempts.",
                    "exception_type": type(exc).__name__,
                    "exception_repr": repr(exc),
                    "traceback": traceback.format_exc(),
                    "raw_result": "Timeout - No result achieved."
                }
                break
            except NotImplementedError as exc:
                agent_failure_data = {
                    "error": "Windows signal-handler incompatibility in browser-use",
                    "exception_type": type(exc).__name__,
                    "exception_repr": repr(exc),
                    "traceback": traceback.format_exc(),
                    "raw_result": "Crashed - NotImplementedError raised directly during agent.run()"
                }
                break
            except Exception as exc:
                tb_str = traceback.format_exc()
                if "QueueShutDown" in tb_str or "bubus" in tb_str:
                    agent_failure_data = {
                        "error": "browser-use event bus shut down unexpectedly",
                        "exception_type": "QueueShutDown",
                        "exception_repr": repr(exc),
                        "traceback": tb_str,
                        "raw_result": "Crashed - Event bus QueueShutDown occurred during agent.run()"
                    }
                    break
                if "NotImplementedError" in tb_str or "add_signal_handler" in tb_str:
                    agent_failure_data = {
                        "error": "Windows signal-handler incompatibility in browser-use",
                        "exception_type": type(exc).__name__,
                        "exception_repr": repr(exc),
                        "traceback": tb_str,
                        "raw_result": "Crashed - Implicit NotImplementedError string found in Traceback"
                    }
                    break
                
                if attempt < max_attempts:
                    logger.warning("[task:%s] Attempt %d crashed: %s. Retrying...", task_id, attempt, exc)
                    continue
                    
                agent_failure_data = {
                    "error": f"Agent run failed absolutely: {str(exc)}",
                    "exception_type": type(exc).__name__,
                    "exception_repr": repr(exc),
                    "traceback": tb_str,
                    "raw_result": "Crashed - No result achieved."
                }
                break
            finally:
                if browser_instance is not None:
                    try:
                        logger.info("[task:%s] Cleaning up browser execution instance natively.", task_id)
                        await browser_instance.close()
                    except Exception as b_exc:
                        logger.warning("[task:%s] Could not cleanly close browser loop: %s", task_id, b_exc)
                
                # Force Python to clean up Playwright/LangChain memory structures eagerly
                import gc
                gc.collect()

        if agent_failure_data:
            logger.error("[task:%s] ✗ Final Agent failure diagnostics:\n%s", task_id, agent_failure_data)
            _set_task_status(supabase, task_id, "failed", agent_failure_data)
            return

        logger.info("[task:%s] Step 4/5 — Extracting final_result()", task_id)
        logger.info(
            "[task:%s] Step 4/5 — final_result length=%s. Raw text:\n%s",
            task_id,
            len(final_result_str) if final_result_str else 0,
            final_result_str or "<empty>"
        )

        logger.info("[task:%s] Step 5/5 — Parsing result", task_id)
            
        try:
            result_json = json.loads(final_result_str)
            # json.loads("null") returns Python None — treat it as plain text
            if result_json is None:
                result_json = {"output": final_result_str or "Agent completed but returned no content."}
                logger.warning("[task:%s] Step 5/5 — json.loads returned None (agent said 'null'), wrapping as plain text", task_id)
            else:
                logger.info("[task:%s] Step 5/5 — Result parsed as JSON", task_id)
        except (json.JSONDecodeError, TypeError):
            result_json = {"output": final_result_str}
            logger.info(
                "[task:%s] Step 5/5 — Result is plain text (not JSON), wrapped in {output}",
                task_id,
            )

        if result_json and isinstance(result_json, dict) and "error" in result_json and len(result_json.keys()) == 1:
            err_msg = f"Agent completed but reported internal failure: {result_json['error']}"
            diagnostic_data = {
                 "error": err_msg,
                 "exception_type": "AgentInternalError",
                 "exception_repr": "Target Agent JSON string wrapper explicitly requested failure via payload schema.",
                 "traceback": "No system traceback available. Error returned intentionally via Agent.",
                 "raw_result": final_result_str
            }
            logger.error("[task:%s] ✗ Agent returned error JSON:\n%s", task_id, diagnostic_data)
            _set_task_status(supabase, task_id, "failed", diagnostic_data)
            return

        _set_task_status(supabase, task_id, "completed", result_json)
        logger.info("[task:%s] ✓ Task completed successfully", task_id)
        return

    except Exception as exc:
        full_tb = traceback.format_exc()
        error_msg = str(exc)
        
        if "on_BrowserStartEvent timed out" in error_msg:
            logger.error("[task:%s] ✗ Browser-Use internal startup timeout detected.", task_id)
            error_msg = f"Browser startup timeout: {error_msg}. Try the /test-playwright endpoint to verify core Chromium."
            
        logger.error("[task:%s] ✗ Agent failed:\n%s", task_id, full_tb)
        _set_task_status(supabase, task_id, "failed", {
            "error": error_msg,
            "traceback": full_tb,
        })
        return

@app.post("/run-agent")
async def run_agent(request: AgentRequest):
    task_id = request.task_id
    prompt = request.prompt.strip()

    logger.info(
        "[task:%s] POST /run-agent received | tier=%s priority=%d prompt_len=%d",
        task_id, request.tier, request.priority, len(prompt),
    )

    if not prompt:
        return JSONResponse(status_code=422, content={"detail": "Prompt must not be empty."})

    missing = [v for v in REQUIRED_VARS if not os.environ.get(v)]
    if missing:
        detail = (
            f"Missing required environment variables: {', '.join(missing)}. "
            f"Add them to your .env file (local dev) or Render dashboard (production)."
        )
        logger.error("[task:%s] %s", task_id, detail)
        return JSONResponse(status_code=500, content={"detail": detail})

    tier = request.tier if request.tier in TIER_CONFIG else "Free"
    cfg = TIER_CONFIG[tier]
    queue_delay = cfg["queue_delay_s"]
    max_steps   = cfg["max_steps"]

    # Execute inside standard asyncio loop so we can hold a reference to cancel it
    task = asyncio.create_task(_background_run_agent(task_id, prompt, tier, request.priority, queue_delay, max_steps))
    ACTIVE_TASKS[task_id] = task
    
    # Automatically drop from active map when completed (either success, error, or cancelled)
    task.add_done_callback(lambda t: ACTIVE_TASKS.pop(task_id, None))

    logger.info("[task:%s] Task accepted and sent to background queue.", task_id)
    return JSONResponse(status_code=202, content={"status": "queued", "task_id": task_id})

@app.post("/cancel-agent/{task_id}")
async def cancel_agent(task_id: str):
    logger.info("[task:%s] Cancel request received.", task_id)
    task = ACTIVE_TASKS.get(task_id)
    
    # Update Supabase: mark as cancelled with error message in the dedicated error column
    try:
        supabase = get_supabase_client()
        supabase.table("tasks").update({
            "status": "cancelled",
            "error": "Cancelled by user."
        }).eq("id", task_id).execute()
        logger.info("[task:%s] DB updated to cancelled.", task_id)
    except Exception as e:
        logger.error("[task:%s] Failed to update supabase on cancel: %s", task_id, e)

    if not task:
        logger.warning("[task:%s] No active asyncio task found — task may have already finished.", task_id)
        return JSONResponse(status_code=200, content={"status": "cancelled", "task_id": task_id, "note": "DB updated; no running process found."})
    
    # Send the native asyncio abort signal
    task.cancel()
    ACTIVE_TASKS.pop(task_id, None)
        
    logger.info("[task:%s] asyncio task cancelled successfully.", task_id)
    return JSONResponse(status_code=200, content={"status": "cancelled", "task_id": task_id})


# ── Test endpoint (bypasses browser-use to verify the pipeline) ──────────────────
@app.post("/test-agent")
async def test_agent(request: AgentRequest):
    """
    Runs the full task pipeline (Supabase read/write + env checks) WITHOUT
    launching a real browser. Use this to confirm the worker infrastructure
    is working before debugging browser-use issues.
    """
    task_id = request.task_id
    prompt = request.prompt.strip()

    logger.info("[test-agent:%s] POST /test-agent received", task_id)

    if not prompt:
        raise HTTPException(status_code=422, detail="Prompt must not be empty.")

    missing = [v for v in REQUIRED_VARS if not os.environ.get(v)]
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing env vars: {', '.join(missing)}",
        )

    try:
        supabase = get_supabase_client()
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    _set_task_status(supabase, task_id, "running")

    # Simulate a 0-latency successful result
    prompt_str = str(prompt)
    fake_result = {
        "output": f"[TEST MODE] Worker pipeline is working. Prompt was: {prompt_str[:80]}",
        "test_mode": True,
    }

    _set_task_status(supabase, task_id, "completed", fake_result)
    logger.info("[test-agent:%s] ✓ Test completed (no browser launched)", task_id)

    return {"status": "completed", "task_id": task_id, "result": fake_result}


# ── Runtime check endpoint ────────────────────────────────────────────────────────
@app.get("/runtime-check")
def runtime_check():
    """
    Returns the full runtime dependency status as JSON.
    Diagnosable from the browser — no need to read server logs.
    Also shows env var presence (never values).
    """
    env_status = {
        var: "present" if os.environ.get(var) else "missing"
        for var in REQUIRED_VARS
    }
    all_runtime_ok = all(v["ok"] for v in RUNTIME.values())
    all_env_ok = all(v == "present" for v in env_status.values())

    logger.info("GET /runtime-check → runtime_ok=%s env_ok=%s", all_runtime_ok, all_env_ok)
    
    response: dict = {
        "runtime_ok": all_runtime_ok,
        "env_ok": all_env_ok,
        "ready": all_runtime_ok and all_env_ok,
        "env": env_status,
        "runtime": RUNTIME,
    }

    if not all_runtime_ok:
        greenlet_error = RUNTIME.get("greenlet", {}).get("error") or ""
        if "DLL load failed while importing _greenlet" in str(greenlet_error):
            response["issue"] = "Likely Windows native dependency/runtime issue missing Microsoft Visual C++ Redistributable."
            response["recommended_fix_sequence"] = [
                "install or repair Microsoft Visual C++ Redistributable",
                "reboot Windows",
                "reinstall greenlet, playwright, browser-use",
                "reinstall Chromium"
            ]
        elif sys.platform == "win32" and "NotImplementedError" in str(RUNTIME.get("playwright", {}).get("error", "")):
            response["issue"] = "Windows Uvicorn Event Loop Conflict (NotImplementedError in Playwright)"
            response["recommended_fix_sequence"] = [
                "Stop the Uvicorn server.",
                "Restart the server WITHOUT the --reload flag.",
                "Uvicorn's --reload mode forces a SelectorEventLoop on Windows which breaks Playwright subprocesses.",
            ]
        else:
            response["fix_instructions"] = {
                "greenlet": "pip install greenlet>=3.0.3 --force-reinstall",
                "playwright": "python -m playwright install chromium",
                "browser_use": "pip install browser-use --force-reinstall",
            }
    else:
        response["fix_instructions"] = None

    return response


# ── Direct Smoke Tests ────────────────────────────────────────────────────────────
@app.get("/test-playwright")
async def test_playwright():
    """
    Direct Playwright smoke-test. Bypasses Browser-Use entirely to test if the
    local OS can natively launch Chromium and reach the internet.
    """
    logger.info("GET /test-playwright — Starting bare Playwright test")
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            logger.info("  Launching Chromium...")
            browser = await p.chromium.launch(headless=IS_HEADLESS)
            logger.info("  Opening new page...")
            page = await browser.new_page()
            logger.info("  Navigating to example.com...")
            await page.goto("https://example.com", timeout=30000)
            title = await page.title()
            logger.info("  ✓ Success! Page title: %s", title)
            await browser.close()
            return JSONResponse(status_code=200, content={"status": "ok", "title": title})
    except Exception as exc:
        err = f"{type(exc).__name__}: {str(exc)}"
        logger.error("✗ Playwright smoke test crashed: %s", err)
        return JSONResponse(status_code=500, content={"status": "error", "detail": err})


@app.post("/debug-agent")
async def debug_agent(request: DebugAgentRequest):
    """
    Debug agent with a hardcoded simple prompt, limited to 3 max_steps,
    verbose explicit logging, and strict error wrapping.
    """
    task_id = request.task_id
    prompt = "Go to https://example.com and tell me the exact main heading text on the page."
    
    logger.info("[debug-agent:%s] POST /debug-agent received", task_id)
    
    try:
        supabase = get_supabase_client()
        _set_task_status(supabase, task_id, "running")
    except Exception as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    try:
        logger.info("[debug-agent:%s] Init Google Gemini LLM", task_id)
        from langchain_google_genai import ChatGoogleGenerativeAI
        _debug_raw_keys = os.environ.get("GEMINI_API_KEY", "")
        _debug_initial_key = [k.strip() for k in _debug_raw_keys.split(",") if k.strip()][0] if _debug_raw_keys else ""
        
        llm = ChatGoogleGenerativeAI(
            model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"), 
            temperature=0.0,
            google_api_key=_debug_initial_key
        )

        logger.info("[debug-agent:%s] Init Browser explicitly", task_id)
        browser_instance = None
        try:
            from browser_use import Browser
            from browser_use.browser.browser import BrowserConfig
            browser_instance = Browser(config=BrowserConfig(
                headless=IS_HEADLESS,
                disable_security=True,
                extra_chromium_args=[
                    "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
                    "--disable-gpu", "--disable-blink-features=AutomationControlled",
                    "--mute-audio", "--window-size=1280,720",
                ],
            ))
            logger.info("[debug-agent:%s] Used direct Browser constructor explicitly.", task_id)
        except Exception as b_exc:
            logger.warning("[debug-agent:%s] Could not instantiate Browser explicitly: %s", task_id, b_exc)
        
        logger.info("[debug-agent:%s] Creating Agent", task_id)
        agent = Agent(task=prompt, llm=llm, browser=browser_instance)
        
        logger.info("[debug-agent:%s] Running agent.run(max_steps=3)", task_id)
        # Using wait_for to cap execution time and gracefully trap infinite hangs
        result = await asyncio.wait_for(agent.run(max_steps=3), timeout=120.0)
        
        final_result_str = result.final_result()
        if not final_result_str:
            final_result_str = "No final result parsed."
            
        logger.info("[debug-agent:%s] ✓ Agent completed successfully", task_id)
        _set_task_status(supabase, task_id, "completed", {"output": final_result_str, "debug": True})
        return JSONResponse(status_code=200, content={"status": "completed", "task_id": task_id, "result": {"output": final_result_str}})
        
    except asyncio.TimeoutError:
        error_msg = "Agent execution forced to timeout locally by debug endpoint after 120s."
        logger.error("[debug-agent:%s] ✗ Timeout error: %s", task_id, error_msg)
        _set_task_status(supabase, task_id, "failed", {"error": error_msg})
        return JSONResponse(status_code=500, content={"detail": error_msg})

    except Exception as exc:
        error_msg = str(exc)
        if "BrowserSession.on_BrowserStartEvent timed out" in error_msg:
            error_msg = f"Browser-Use start timeout: {error_msg} (Check /test-playwright)"
        logger.error("[debug-agent:%s] ✗ Debug Agent failed:\n%s", task_id, traceback.format_exc())
        _set_task_status(supabase, task_id, "failed", {"error": error_msg})
        return JSONResponse(status_code=500, content={"detail": error_msg})


# ── Health endpoint ───────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    """Always returns 200 — even when env vars are missing or browser not installed."""
    env_status = {
        var: "present" if os.environ.get(var) else "missing"
        for var in REQUIRED_VARS
    }
    runtime_ok = all(v["ok"] for v in RUNTIME.values())
    logger.info("GET /health → ok | runtime_ok=%s env=%s", runtime_ok, env_status)
    return {"status": "ok", "runtime_ok": runtime_ok, "env": env_status}

if __name__ == "__main__":
    import uvicorn
    # IMPORTANT: Do not use --reload on Windows with browser-use as Playwright uses ProactorEventLoop
    # which conflicts with Uvicorn's reload mechanism.
    uvicorn.run("worker:app", host="0.0.0.0", port=8000, reload=False)
