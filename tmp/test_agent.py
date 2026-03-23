import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser
from browser_use.browser.browser import BrowserConfig
import logging

logging.basicConfig(level=logging.INFO)

async def test():
    print("Init LLM...")
    llm = ChatGoogleGenerativeAI(
        model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
        temperature=0.0
    )
    
    print("Init Browser...")
    browser = Browser(config=BrowserConfig(headless=False))
    
    print("Init Agent...")
    agent = Agent(
        task="Go to https://example.com and tell me the heading",
        llm=llm,
        browser=browser
    )
    
    print("Running Agent...")
    result = await agent.run(max_steps=3)
    print("Agent result:", result.final_result())
    
    await browser.close()

if __name__ == "__main__":
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(test())
