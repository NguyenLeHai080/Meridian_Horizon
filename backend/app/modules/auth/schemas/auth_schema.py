from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập duy nhất")
    password: str = Field(..., min_length=8, description="Mật khẩu tối thiểu 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt")
    full_name: str = Field(..., min_length=2, max_length=100, description="Họ và tên người dùng")

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu tài khoản")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh Token hợp lệ")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user_id: int
    email: str
    role: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    credit_balance: int
    created_at: datetime

    class Config:
        from_attributes = True
