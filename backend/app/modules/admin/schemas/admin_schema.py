from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class AdminStatsResponse(BaseModel):
    total_users: int
    active_licenses: int
    expired_or_locked: int
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
    amount: int = Field(..., description="Số credit muốn cộng thêm hoặc trừ bớt")
    reason: Optional[str] = Field(default="Cấp phát credit định kỳ từ Admin")

class ToggleUserStatusRequest(BaseModel):
    is_active: bool = Field(..., description="Trạng thái kích hoạt tài khoản")

class CreateLicenseRequest(BaseModel):
    customer_name: str = Field(..., description="Tên khách hàng hoặc tên máy")
    user_email: str = Field(..., description="Email người dùng nhận bản quyền tool")
    package_type: str = Field(default="AI Pro", description="Gói bản quyền: AI Pro hoặc Lifetime VIP")
    daily_limit: str = Field(default="100/d", description="Giới hạn lượt dùng/ngày")
    days: int = Field(default=30, ge=1, le=3650, description="Số ngày bản quyền (hoặc chọn vĩnh viễn)")
    is_lifetime: bool = Field(default=False, description="Bản quyền vĩnh viễn")
    machine_id: Optional[str] = Field(default=None, description="Khóa phần cứng (HWID)")

class RenewLicenseRequest(BaseModel):
    add_days: int = Field(default=30, description="Số ngày gia hạn thêm (+30, +90, +365)")
    is_lifetime: bool = Field(default=False, description="Chuyển thành bản quyền vĩnh viễn")

class UpdateLicenseRequest(BaseModel):
    customer_name: Optional[str] = None
    user_email: Optional[str] = None
    package_type: Optional[str] = None
    daily_limit: Optional[str] = None
    machine_id: Optional[str] = None

class VerifyLicenseRequest(BaseModel):
    license_key: str = Field(..., description="Mã bản quyền cần kích hoạt")
    machine_id: str = Field(..., description="Mã phần cứng (HWID) của máy")

class VerifyLicenseResponse(BaseModel):
    is_valid: bool
    message: str
    customer_name: Optional[str] = None
    package_type: Optional[str] = None
    days_remaining: Optional[int] = None
    is_lifetime: Optional[bool] = None
    expires_at: Optional[datetime] = None

class ToolLicenseDTO(BaseModel):
    id: int
    license_key: str
    customer_name: str
    user_email: str
    machine_id: str
    package_type: str
    daily_limit: str
    days_remaining: int
    is_lifetime: bool
    is_active: bool
    is_locked: bool
    is_online: bool
    last_ip: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
