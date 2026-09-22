from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class AdminStatsResponse(BaseModel):
    total_users: int
    active_licenses: int
    total_credits_allocated: int
    total_rendered_videos: int
    gpu_cluster_status: str
    active_dubbing_tasks: int

class UserAdminDTO(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    credit_balance: int
    created_at: datetime

    class Config:
        from_attributes = True

class UpdateUserCreditsRequest(BaseModel):
    amount: int = Field(..., description="Số credit muốn cộng thêm hoặc trừ bớt (ví dụ: +5000 hoặc -1000)")
    reason: Optional[str] = Field(default="Cấp phát credit định kỳ từ Admin")

class ToggleUserStatusRequest(BaseModel):
    is_active: bool = Field(..., description="Trạng thái kích hoạt tài khoản")

class CreateLicenseRequest(BaseModel):
    user_email: str = Field(..., description="Email người dùng nhận bản quyền tool")
    days: int = Field(default=30, ge=1, le=365, description="Số ngày bản quyền")
    machine_id: Optional[str] = Field(default=None, description="Khóa phần cứng (HWID) máy tính khách hàng")

class ToolLicenseDTO(BaseModel):
    id: int
    license_key: str
    user_email: str
    machine_id: str
    days_remaining: int
    max_concurrency: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
