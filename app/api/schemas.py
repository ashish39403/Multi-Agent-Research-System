# app/api/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json

class AgentStatus(str, Enum):
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentProgress(BaseModel):
    agent_name: str
    status: AgentStatus = AgentStatus.IDLE
    progress: int = Field(0, ge=0, le=100)
    output: Optional[str] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Research query")
    model: Optional[str] = Field(None, description="Model to use (overrides default)")
    save_intermediate: Optional[bool] = Field(True, description="Save intermediate results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Latest developments in AI video generation",
                "save_intermediate": True
            }
        }

class ResearchResponse(BaseModel):
    id: str
    query: str
    status: str
    final_report: Optional[str] = None
    agents: List[AgentProgress] = []
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class HealthResponse(BaseModel):
    status: str
    version: str
    model: str
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# app/api/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Make sure ResearchRequest is defined
class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    save_intermediate: Optional[bool] = Field(True)
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is artificial intelligence?",
                "save_intermediate": True
            }
        }