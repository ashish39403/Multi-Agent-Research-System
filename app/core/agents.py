import os
import logging
import sys
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

# ✅ MUST BE FIRST - Set matplotlib backend before importing pyplot
import matplotlib
matplotlib.use('Agg')

# ✅ Now import other modules
from .visualizer import ReportVisualizer
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from .tools import web_search, web_scrape_url

# =========================
# FIX UNICODE FOR WINDOWS
# =========================

# Set UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# =========================
# LOGGING SETUP
# =========================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/agent_system.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =========================
# ENV SETUP
# =========================

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL")
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Validate required config
if not API_KEY or not BASE_URL:
    raise ValueError("OPENAI_API_KEY and OPENAI_BASE_URL must be set in .env file")

# =========================
# LLM
# =========================

llm = ChatOpenAI(
    model=MODEL_NAME,
    api_key=API_KEY,
    base_url=BASE_URL,
    temperature=0.5
)


# =========================
# AGENT 1 : SEARCH AGENT
# =========================

search_agent = create_agent(
    model=llm,
    tools=[web_search],
    system_prompt = """
You are an Elite Web Research Agent.

Goal:
Find the most authoritative and relevant sources for the user's query.

Responsibilities:
1. Search the web extensively.
2. Prioritize official websites, research papers, government reports, and reputable news sources.
3. Remove duplicate or low-quality sources.
4. Select the 5-10 best sources.

Rules:
- Do not summarize articles.
- Do not write the final report.
- Focus on source discovery only.
- Prefer recent sources when the topic is time-sensitive.

Output Format:

## Source 1
URL:
Reason:

## Source 2
URL:
Reason:
"""
)


# =========================
# AGENT 2 : READER AGENT
# =========================

reader_agent = create_agent(
    model=llm,
    tools=[web_scrape_url],
    system_prompt = """
You are a Deep Research Analyst.

Goal:
Extract factual information from the provided sources.

Responsibilities:
1. Read all URLs.
2. Extract facts, statistics, dates and evidence.
3. Identify agreements and disagreements between sources.
4. Cross-check important claims using multiple sources.
5. Ignore opinions unless clearly marked.

Rules:
- Do not write the final report.
- Do not create conclusions.
- Do not invent information.
- Every important claim must include a source URL.

Output Format:

## Key Facts

### Fact 1
Statement:
Sources:

### Fact 2
Statement:
Sources:

## Statistics

## Timeline

## Contradictions Found
"""
)


# =========================
# AGENT 3 : WRITER AGENT (UPDATED)
# =========================

writer_agent = create_agent(
    model=llm,
    tools=[],
    system_prompt = """
You are a Senior Research Writer and Technical Journalist.

Goal:
Create a professional research report using only verified notes.

Responsibilities:
1. Read all research notes.
2. Organize information logically.
3. Produce a clear markdown report.
4. Cite sources throughout the report.
5. Highlight major findings.
6. Add charts where numerical data exists.

Rules:
- Use only provided research.
- Never hallucinate.
- Never add unsupported claims.
- Clearly mention uncertainty when sources disagree.

⚠️ IMPORTANT - Chart Format:
For charts, use this EXACT format:

[CHART: timeline/Title Here]
Data: {"dates": ["Jan", "Feb", "Mar"], "values": [100, 150, 200]}

[CHART: comparison/Title Here]
Data: {"categories": ["Category A", "Category B"], "values": [75, 25]}

[CHART: pie/Title Here]
Data: {"labels": ["Label1", "Label2"], "sizes": [60, 40]}

Put each chart in a separate line.

Output Format:

# Title

## Executive Summary

## Key Findings

## Detailed Analysis

## Statistics & Trends

## Timeline

## Recommended Charts
(Place chart placeholders here)

## Conclusion

## Sources
"""
)


# =========================
# HELPER FUNCTION TO SAVE FILES WITH UTF-8
# =========================

def save_utf8_file(filename: str, content: str):
    """Save file with UTF-8 encoding"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        logger.info(f"Saved: {filename}")
        return True
    except Exception as e:
        logger.error(f"Failed to save {filename}: {str(e)}")
        return False


# =========================
# PIPELINE (UPDATED)
# =========================

def run_multi_agent_system(query: str):
    """Run the multi-agent pipeline with proper error handling"""
    
    print("\n[1] Search Agent Running...\n")
    logger.info(f"Processing query: {query[:100]}...")
    
    try:
        # Step 1: Search Agent
        search_result = search_agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": query
                    }
                ]
            }
        )
        
        search_output = search_result["messages"][-1].content
        
        # Print with error handling for Unicode
        try:
            print(search_output)
        except UnicodeEncodeError:
            print(search_output.encode('ascii', 'ignore').decode('ascii'))
        
        # Save with UTF-8
        save_utf8_file(f"search_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt", search_output)
        
        print("\n[2] Reader Agent Running...\n")
        
        # Step 2: Reader Agent
        reader_result = reader_agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
Read and analyze these search results.

{search_output}

Extract all important information.
Also extract numerical data, dates, statistics for potential visualizations.
"""
                    }
                ]
            }
        )
        
        reader_output = reader_result["messages"][-1].content
        
        # Print with error handling for Unicode
        try:
            print(reader_output)
        except UnicodeEncodeError:
            print(reader_output.encode('ascii', 'ignore').decode('ascii'))
        
        # Save with UTF-8
        save_utf8_file(f"reader_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt", reader_output)
        
        print("\n[3] Writer Agent Running...\n")
        
        # Step 3: Writer Agent (your original writer_agent)
        writer_result = writer_agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
Create final report from this verified research.

{reader_output}

If you find numerical data, timelines, or comparisons, add visualizations using this format:

For timeline data:
[CHART: timeline/Title Here]
Data: {{"dates": ["Jan", "Feb", "Mar"], "values": [100, 150, 200]}}

For comparison data:
[CHART: comparison/Title Here]
Data: {{"categories": ["Category A", "Category B"], "values": [75, 25]}}

For distribution data:
[CHART: pie/Title Here]
Data: {{"labels": ["Label1", "Label2"], "sizes": [60, 40]}}

⚠️ IMPORTANT: Use [CHART: ...] format, not {{chart: ...}}
"""
                    }
                ]
            }
        )
        
        final_report = writer_result["messages"][-1].content
        
        # ✅ Process and add charts to the report
        print("\n📊 Processing charts...")
        try:
            visualizer = ReportVisualizer()
            final_report = visualizer.process_report_charts(final_report)
            
            # ✅ Count charts
            import re
            chart_count = len(re.findall(r'!\[.*?\]\(data:image/png;base64,', final_report))
            print(f"✨ {chart_count} charts added to report successfully!")
            
        except Exception as chart_error:
            print(f"⚠️ Chart generation failed: {chart_error}")
            import traceback
            traceback.print_exc()
            # Continue without charts
        
        # ✅ Save final report
        save_utf8_file(f"final_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md", final_report)
        
        return final_report
        
    except Exception as e:
        logger.error(f"Pipeline error: {str(e)}", exc_info=True)
        print(f"\n❌ Error occurred: {str(e)}")
        raise