from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class CreateProjectRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200, description="Tên dự án lồng tiếng")
    video_filename: Optional[str] = Field(default="demo_episode_23.mp4")
    source_lang: str = Field(default="Tiếng Trung")
    target_lang: str = Field(default="Tiếng Việt")
    provider_type: str = Field(default="DeepSeek API")
    genre: str = Field(default="Xuyên không / Trọng sinh")
    custom_prompt: Optional[str] = Field(default="Dịch sát nghĩa theo phong cách tiên hiệp huyền huyễn cổ trang.")

class ExecuteStepRequest(BaseModel):
    step: int = Field(..., ge=1, le=5, description="Bước xử lý từ 1 đến 5")
    action: Optional[str] = Field(default="start", description="start, pause, complete")

class DubbingProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    video_filename: str
    source_lang: str
    target_lang: str
    provider_type: str
    genre: str
    custom_prompt: Optional[str]
    current_step: int
    status: str
    progress: int
    credits_used: int
    subtitles_preview: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProviderInfo(BaseModel):
    id: str
    name: str
    mode: str # Online (Cloud) / Offline (Local)
    description: str
    credit_rate: str
    is_available: bool = True
