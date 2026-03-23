import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser
from browser_use.browser.browser import BrowserConfig
import logging

logging.basicConfig(level=logging.INFO)

async def test():
    print("Init LLM...")
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
        temperature=0.0
    )
    
    print("Init Browser...")
    browser = Browser(config=BrowserConfig(
        headless=False,
        disable_security=True,
    ))
    
    print("Init Agent...")
    agent = Agent(
        task="Go to https://example.com and tell me the heading",
        llm=llm,
        browser=browser
    )
    
    try:
        print("Running Agent...")
        result = await agent.run(max_steps=3)
        print("Agent result:", result.final_result())
    except Exception as e:
        print("CRASHED:", e)
    finally:
        await browser.close()

if __name__ == "__main__":
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(test())
