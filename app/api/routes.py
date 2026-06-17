# app/api/routes.py
from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime
import uuid
import sys
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import your agent function
from app.core.agents import run_multi_agent_system

router = APIRouter()

# Store jobs
jobs = {}
executor = ThreadPoolExecutor(max_workers=2)

# Create directories if not exists
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "generated_reports")
LOGS_DIR = os.path.join(BASE_DIR, "logs")
SEARCH_OUTPUT_DIR = os.path.join(BASE_DIR, "search_outputs")
READER_OUTPUT_DIR = os.path.join(BASE_DIR, "reader_outputs")
FINAL_REPORTS_DIR = os.path.join(BASE_DIR, "final_reports")

# Create all directories
for dir_path in [REPORTS_DIR, LOGS_DIR, SEARCH_OUTPUT_DIR, READER_OUTPUT_DIR, FINAL_REPORTS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

@router.post("/research")
async def start_research(request_data: dict, background_tasks: BackgroundTasks):
    """Start a new research task"""
    
    query = request_data.get("query", "").strip()
    
    if not query:
        return JSONResponse(
            content={"error": "Query is required"}, 
            status_code=400
        )
    
    research_id = str(uuid.uuid4())[:8]
    
    # Store job
    jobs[research_id] = {
        "id": research_id,
        "query": query,
        "status": "processing",
        "final_report": None,
        "report_file": None,
        "error": None,
        "created_at": datetime.now().isoformat(),
        "completed_at": None
    }
    
    # Run in background thread
    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, process_research_task, research_id, query)
    
    return JSONResponse(content={
        "id": research_id,
        "status": "processing",
        "message": "Research started"
    })

@router.get("/research/{research_id}")
async def get_research_status(research_id: str):
    """Get research status"""
    
    if research_id not in jobs:
        return JSONResponse(
            content={"error": "Research not found"}, 
            status_code=404
        )
    
    job = jobs[research_id]
    
    response = {
        "id": job["id"],
        "query": job["query"],
        "status": job["status"],
        "error": job.get("error"),
        "created_at": job["created_at"],
        "completed_at": job["completed_at"]
    }
    
    if job["status"] == "completed" and job.get("final_report"):
        response["final_report"] = job["final_report"]
        response["report_file"] = job.get("report_file")
    
    return JSONResponse(content=response)

@router.get("/download/{research_id}")
async def download_report(research_id: str):
    """Download report as file"""
    
    if research_id not in jobs:
        return JSONResponse(
            content={"error": "Research not found"}, 
            status_code=404
        )
    
    job = jobs[research_id]
    
    if job["status"] != "completed":
        return JSONResponse(
            content={"error": "Report not ready yet"}, 
            status_code=400
        )
    
    report_file = job.get("report_file")
    if not report_file or not os.path.exists(report_file):
        return JSONResponse(
            content={"error": "Report file not found"}, 
            status_code=404
        )
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=report_file,
        filename=f"research_report_{research_id}.md",
        media_type="text/markdown"
    )

@router.get("/health")
async def health_check():
    return JSONResponse(content={
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

def process_research_task(research_id: str, query: str):
    """Background task - runs in separate thread"""
    
    try:
        print(f"\n[BACKGROUND] Starting research {research_id}")
        print(f"[BACKGROUND] Query: {query[:100]}...")
        
        # ✅ Call the existing function (not the new one)
        final_report = run_multi_agent_system(query)
        
        # Save report to file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{REPORTS_DIR}/report_{research_id}_{timestamp}.md"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(final_report)
        
        print(f"[BACKGROUND] 💾 Report saved to: {filename}")
        print(f"[BACKGROUND] 📄 Report size: {len(final_report)} characters")
        
        # Update job
        jobs[research_id]["status"] = "completed"
        jobs[research_id]["final_report"] = final_report
        jobs[research_id]["report_file"] = filename
        jobs[research_id]["completed_at"] = datetime.now().isoformat()
        
        print(f"[BACKGROUND] ✅ Research {research_id} completed!")
        
    except Exception as e:
        print(f"[BACKGROUND] ❌ Error in {research_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        jobs[research_id]["status"] = "failed"
        jobs[research_id]["error"] = str(e)
        jobs[research_id]["completed_at"] = datetime.now().isoformat()