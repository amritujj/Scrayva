import os
import json
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from browser_use import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


def get_supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")

    return create_client(supabase_url, supabase_key)


class AgentRequest(BaseModel):
    prompt: str
    task_id: str


@app.post("/run-agent")
async def run_agent(request: AgentRequest):
    task_id = request.task_id
    prompt = request.prompt

    if not os.environ.get("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY environment variable is missing")

    try:
        supabase = get_supabase_client()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        supabase.table("tasks").update({
            "status": "running"
        }).eq("id", task_id).execute()

        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        agent = Agent(task=prompt, llm=llm)

        result = await agent.run()
        final_result_str = result.final_result()

        try:
            result_json = json.loads(final_result_str) if final_result_str else {}
        except (json.JSONDecodeError, TypeError):
            result_json = {"output": final_result_str}

        supabase.table("tasks").update({
            "status": "completed",
            "result": result_json
        }).eq("id", task_id).execute()

        return {
            "status": "completed",
            "task_id": task_id,
            "result": result_json
        }

    except Exception as e:
        logger.error(f"Error running agent for task {task_id}: {e}", exc_info=True)

        try:
            supabase.table("tasks").update({
                "status": "failed",
                "result": {"error": str(e)}
            }).eq("id", task_id).execute()
        except Exception as update_err:
            logger.error(f"Failed to update task {task_id} to failed: {update_err}")

        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}
