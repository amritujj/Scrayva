import os
import tempfile

_SAFE_TMP = r"E:\scrayva.web\tmp"
os.makedirs(_SAFE_TMP, exist_ok=True)
os.environ["TMP"]    = _SAFE_TMP
os.environ["TEMP"]   = _SAFE_TMP
os.environ["TMPDIR"] = _SAFE_TMP
tempfile.tempdir     = _SAFE_TMP

import sys
import json
import logging
import traceback
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
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
REQUIRED_VARS: dict[str, str] = {
    "GOOGLE_API_KEY": "Gemini LLM access",
    "SUPABASE_URL": "Supabase project URL",
    "SUPABASE_SERVICE_ROLE_KEY": "Supabase service-role key",
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
                logger.warning("Chromium executable missing. Auto-installing Playwright browsers...")
                try:
                    import subprocess
                    subprocess.run(["python", "-m", "playwright", "install", "chromium"], check=True)
                    logger.info("Auto-installation complete. Retrying launch verification...")
                    from playwright.async_api import async_playwright
                    async with async_playwright() as _p_retry:
                        browser = await _p_retry.chromium.launch(headless=IS_HEADLESS)
                        await browser.close()
                        RUNTIME["playwright"]["chromium_path"] = _p_retry.chromium.executable_path
                        RUNTIME["playwright"]["ok"] = True
                        RUNTIME["playwright"]["error"] = ""
                        logger.info("✓ Playwright async logic verified successfully after auto-install")
                        return
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
        
    yield  # Normal app traffic executes while yielding
    
    # Optional shutdown logic goes here


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


# ── Main endpoint ─────────────────────────────────────────────────────────────────
@app.post("/run-agent")
async def run_agent(request: AgentRequest):
    task_id = request.task_id
    prompt = request.prompt.strip()

    logger.info(
        "[task:%s] POST /run-agent received | tier=%s priority=%d prompt_len=%d",
        task_id, request.tier, request.priority, len(prompt),
    )

    # Validate prompt is not empty
    if not prompt:
        return JSONResponse(status_code=422, content={"detail": "Prompt must not be empty."})

    # Pre-flight: check all required env vars
    logger.info("[task:%s] Step 0 — Running environment pre-flight checks", task_id)
    missing = [v for v in REQUIRED_VARS if not os.environ.get(v)]
    if missing:
        detail = (
            f"Missing required environment variables: {', '.join(missing)}. "
            f"Add them to your .env file (local dev) or Render dashboard (production)."
        )
        logger.error("[task:%s] %s", task_id, detail)
        return JSONResponse(status_code=500, content={"detail": detail})

    # Init Supabase
    logger.info("[task:%s] Step 0.5 — Initializing Supabase client", task_id)
    try:
        supabase = get_supabase_client()
        logger.info("[task:%s] Supabase client initialised successfully", task_id)
    except ValueError as exc:
        logger.error("[task:%s] Supabase init failed: %s", task_id, exc)
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    # ── Tier-based queue delay ────────────────────────────────────────────────────
    # Free tier tasks wait in queue to let Pro/Ultimate tasks skip ahead naturally.
    tier = request.tier if request.tier in TIER_CONFIG else "Free"
    cfg = TIER_CONFIG[tier]
    queue_delay = cfg["queue_delay_s"]
    max_steps   = cfg["max_steps"]

    if queue_delay > 0:
        logger.info(
            "[task:%s] ⏳ Tier=%s — applying %ds queue delay before execution starts. "
            "Pro/Ultimate tasks will be picked up ahead of this one during the wait.",
            task_id, tier, queue_delay,
        )
        # Keep task in 'queued' state during the wait window
        await asyncio.sleep(queue_delay)
        logger.info("[task:%s] ⏰ Queue delay elapsed. Starting execution now.", task_id)

    # Mark running — task will never be stuck at "queued" after this
    _set_task_status(supabase, task_id, "running")

    # ── Agent execution ───────────────────────────────────────────────────────────
    try:
        final_result_str = None
        max_attempts = 1  # No outer retries — each failed attempt burns Gemini quota
        agent_failure_data = None
        
        for attempt in range(1, max_attempts + 1):
            browser_instance = None
            try:
                logger.info("[task:%s] Executing Agent run attempt %d / %d...", task_id, attempt, max_attempts)
                
                # Step 1: Init Gemini LLM (FRESH INSTANCE PER ATTEMPT)
                logger.info("[task:%s] Step 1/5 — Initialising LLM", task_id)
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"), temperature=0.0)

                # Step 2: Create browser-use Browser (FRESH INSTANCE PER ATTEMPT)
                from browser_use import Browser
                from browser_use.browser.browser import BrowserConfig
                # Memory-optimized Chromium args to stay under Render's 512MB limit.
                _CHROMIUM_MEMORY_ARGS = [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",       # Use /tmp instead of /dev/shm
                    "--disable-gpu",                  # GPU process uses extra RAM
                    "--disable-extensions",
                    "--disable-background-networking",
                    "--disable-default-apps",
                    "--disable-sync",
                    "--disable-translate",
                    "--disable-background-timer-throttling",
                    "--disable-renderer-backgrounding",
                    "--disable-device-discovery-notifications",
                    "--disable-blink-features=AutomationControlled",
                    "--no-first-run",
                    "--mute-audio",
                    "--hide-scrollbars",
                    "--metrics-recording-only",
                    "--safebrowsing-disable-auto-update",
                    "--single-process",               # Biggest RAM saver: no separate renderer process
                    "--js-flags=--max-old-space-size=256",  # Cap V8 heap at 256MB
                    "--window-size=1280,720",
                ]
                browser_instance = Browser(
                    config=BrowserConfig(
                        headless=IS_HEADLESS,
                        disable_security=True,
                        extra_chromium_args=_CHROMIUM_MEMORY_ARGS,
                    )
                )
                logger.info("[task:%s] Step 2/5.1 — Custom local Browser explicitly instantiated", task_id)
                
                # Wrap the user prompt with explicit browser-use instructions.
                # Without this, Gemini sometimes answers from memory without browsing.
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
                    max_failures=3,     # Allow up to 3 bad-format responses before giving up
                    use_vision=False,   # Disable screenshot captures to save token usage
                )
                logger.info("[task:%s] Step 2/5 — Agent created (max_failures=3, use_vision=False)", task_id)

                # Hard step cap — tier-dependent
                logger.info("[task:%s] Step 3/5 — agent.run() started (max_steps=%d, timeout=300s)", task_id, max_steps)
                result = await asyncio.wait_for(agent.run(max_steps=max_steps), timeout=300.0)
                
                final_result_str = result.final_result()
                
                # Check if it silently failed before returning
                if not final_result_str or final_result_str.strip() == "":
                    logger.warning("[task:%s] Attempt %d: final_result() is empty — trying multi-stage fallback.", task_id, attempt)

                    fallback_text = None

                    # ── Stage 1: browser-use built-in extracted_content() ──────────
                    # Collects output from all extract_content actions during the run.
                    try:
                        if hasattr(result, "extracted_content"):
                            extracted = result.extracted_content()
                            if extracted:
                                combined = "\n\n".join(str(e) for e in extracted if e)
                                if combined.strip():
                                    fallback_text = combined.strip()
                                    logger.info("[task:%s] Fallback Stage 1: extracted_content() gave %d chars", task_id, len(fallback_text))
                    except Exception as _e:
                        logger.warning("[task:%s] Fallback Stage 1 failed: %s", task_id, _e)

                    # ── Stage 2: action_results() — scan all action results ─────────
                    if not fallback_text:
                        try:
                            if hasattr(result, "action_results"):
                                action_results = result.action_results()
                                # Collect non-empty text content from all results
                                texts = []
                                for ar in (action_results or []):
                                    for attr in ("extracted_content", "content", "output", "text"):
                                        val = getattr(ar, attr, None)
                                        if val and str(val).strip():
                                            texts.append(str(val).strip())
                                            break
                                if texts:
                                    fallback_text = "\n\n".join(texts)
                                    logger.info("[task:%s] Fallback Stage 2: action_results() gave %d chars across %d results", task_id, len(fallback_text), len(texts))
                        except Exception as _e:
                            logger.warning("[task:%s] Fallback Stage 2 failed: %s", task_id, _e)

                    # ── Stage 3: scan all history steps (not just last) ─────────────
                    if not fallback_text:
                        try:
                            if hasattr(result, "history") and result.history:
                                texts = []
                                for step in reversed(result.history):  # newest first
                                    for attr in ("model_output", "output", "text", "content"):
                                        candidate = getattr(step, attr, None)
                                        if candidate and str(candidate).strip():
                                            texts.append(str(candidate).strip())
                                            break
                                    if len(texts) >= 3:
                                        break  # take last 3 steps worth
                                if texts:
                                    fallback_text = "\n\n".join(reversed(texts))
                                    logger.info("[task:%s] Fallback Stage 3: history scan gave %d chars", task_id, len(fallback_text))
                        except Exception as _e:
                            logger.warning("[task:%s] Fallback Stage 3 failed: %s", task_id, _e)

                    # ── Stage 4: last-resort model_dump ────────────────────────────
                    if not fallback_text:
                        try:
                            if hasattr(result, "history") and result.history:
                                last_event = result.history[-1]
                                dump_str = str(last_event.model_dump() if hasattr(last_event, "model_dump") else last_event)
                                fallback_text = dump_str[:4000]
                                logger.info("[task:%s] Fallback Stage 4: model_dump gave %d chars", task_id, len(fallback_text))
                        except Exception:
                            fallback_text = None

                    if fallback_text:
                        # Treat as a soft success — save to Supabase as completed with a note
                        logger.info("[task:%s] Fallback extraction succeeded. Marking task completed with note.", task_id)
                        fallback_result = {
                            "note": "Agent returned empty final_result. Fallback text used.",
                            "fallback_text": fallback_text,
                        }
                        _set_task_status(supabase, task_id, "completed", fallback_result)
                        return JSONResponse(status_code=200, content={"status": "completed", "task_id": task_id, "result": fallback_result})

                    # No fallback found either — treat as a genuine failure
                    if attempt < max_attempts:
                        logger.info("[task:%s] No fallback text found. Retrying agent execution...", task_id)
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
                    break  # exit loop — will be reported below as failure
                
                # If we get here, we have non-empty result, so break the retry loop
                logger.info("[task:%s] Step 3/5 — agent.run() finished successfully on attempt %d", task_id, attempt)
                break
                
            except asyncio.TimeoutError as exc:
                if attempt < max_attempts:
                    logger.warning("[task:%s] Attempt %d timed out after 5 mins. Retrying...", task_id, attempt)
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
                # Catches Windows signal handler crash if Monkey-Patch is overridden (e.g. by uvicorn's event loop)
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
                
                # Explicit check for bubus QueueShutDown
                if "QueueShutDown" in tb_str or "bubus" in tb_str:
                    agent_failure_data = {
                        "error": "browser-use event bus shut down unexpectedly",
                        "exception_type": "QueueShutDown",
                        "exception_repr": repr(exc),
                        "traceback": tb_str,
                        "raw_result": "Crashed - Event bus QueueShutDown occurred during agent.run()"
                    }
                    break
                
                # browser-use often swallows and re-wraps NotImplementedError as a generic Exception. 
                # This explicitly detects it by scanning the stack trace for the native failure string.
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
                # Defensively, securely, natively teardown Browser Session specifically avoiding overlap
                if browser_instance is not None:
                    try:
                        logger.info("[task:%s] Cleaning up browser execution instance natively.", task_id)
                        await browser_instance.close()
                    except Exception as b_exc:
                        logger.warning("[task:%s] Could not cleanly close browser loop: %s", task_id, b_exc)

        # If loop naturally triggered a terminal exception, raise to outter block immediately
        if agent_failure_data:
            # We bypass the standard wrapper below and natively dump this structured error context
            logger.error("[task:%s] ✗ Final Agent failure diagnostics:\n%s", task_id, agent_failure_data)
            _set_task_status(supabase, task_id, "failed", agent_failure_data)
            return JSONResponse(status_code=500, content={"detail": agent_failure_data})

        logger.info("[task:%s] Step 4/5 — Extracting final_result()", task_id)
        logger.info(
            "[task:%s] Step 4/5 — final_result length=%s. Raw text:\n%s",
            task_id,
            len(final_result_str) if final_result_str else 0,
            final_result_str or "<empty>"
        )

        # Step 5: Parse result — gracefully handle plain text
        logger.info("[task:%s] Step 5/5 — Parsing result", task_id)
            
        try:
            result_json = json.loads(final_result_str)
            logger.info("[task:%s] Step 5/5 — Result parsed as JSON", task_id)
        except (json.JSONDecodeError, TypeError):
            result_json = {"output": final_result_str}
            logger.info(
                "[task:%s] Step 5/5 — Result is plain text (not JSON), wrapped in {output}",
                task_id,
            )

        # Enforce Native Error Trapping
        if "error" in result_json and len(result_json.keys()) == 1:
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
            return JSONResponse(status_code=500, content={"detail": diagnostic_data})

        # Persist completed status
        _set_task_status(supabase, task_id, "completed", result_json)
        logger.info("[task:%s] ✓ Task completed successfully", task_id)

        return JSONResponse(status_code=200, content={"status": "completed", "task_id": task_id, "result": result_json})

    except Exception as exc:
        # Capture the full traceback and save it to Supabase so it appears in the dashboard
        full_tb = traceback.format_exc()
        error_msg = str(exc)
        
        # Clearly bubble up the known browser-use timeout state
        if "on_BrowserStartEvent timed out" in error_msg:
            logger.error("[task:%s] ✗ Browser-Use internal startup timeout detected.", task_id)
            error_msg = f"Browser startup timeout: {error_msg}. Try the /test-playwright endpoint to verify core Chromium."
            
        logger.error("[task:%s] ✗ Agent failed:\n%s", task_id, full_tb)
        _set_task_status(supabase, task_id, "failed", {
            "error": error_msg,
            "traceback": full_tb,   # includes every frame so you can see exactly where it broke
        })
        return JSONResponse(
            status_code=500,
            content={"detail": f"Agent execution failed: {error_msg}"},
        )


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
        logger.info("[debug-agent:%s] Init LLM", task_id)
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"), temperature=0.0)

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
                    "--disable-gpu", "--disable-extensions", "--disable-background-networking",
                    "--disable-default-apps", "--disable-sync", "--disable-translate",
                    "--no-first-run", "--mute-audio", "--hide-scrollbars",
                    "--single-process", "--js-flags=--max-old-space-size=256",
                    "--window-size=1280,720",
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

