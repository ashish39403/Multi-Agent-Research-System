# app/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Multi-Agent Research System"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # OpenAI Settings
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str
    OPENAI_MODEL: str = "deepseek/deepseek-v4-flash"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    
    # Research Settings
    REQUEST_TIMEOUT: int = 120
    MAX_RETRIES: int = 3
    
    # File Settings
    SAVE_INTERMEDIATE: bool = True
    OUTPUT_DIR: str = "outputs"
    LOG_DIR: str = "logs"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()


os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.LOG_DIR, exist_ok=True)