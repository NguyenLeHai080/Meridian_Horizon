from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.response import APIResponse
from app.core.security import decode_token
from app.modules.auth.schemas.auth_schema import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserProfileResponse,
)
from app.modules.auth.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

async def get_current_user(
    authorization: str = Header(..., description="Bearer token"),
    session: AsyncSession = Depends(get_db)
) -> UserProfileResponse:
    """Dependency trích xuất và thẩm định người dùng từ JWT Token"""
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException(message="Định dạng Authorization Header phải là 'Bearer <token>'.")

    token = authorization.split(" ")[1]
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise UnauthorizedException(message="Token này không phải là access token hợp lệ.")

    user_id = int(payload.get("sub"))
    return await AuthService.get_user_by_id(session, user_id)

@router.post("/register", response_model=APIResponse[UserProfileResponse], status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, session: AsyncSession = Depends(get_db)):
    """Đăng ký tài khoản mới với chính sách mật khẩu bảo vệ đa tầng"""
    user = await AuthService.register(session, request)
    return APIResponse.ok(data=user, message="Đăng ký tài khoản thành công!", status_code=201)

@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(request: LoginRequest, session: AsyncSession = Depends(get_db)):
    """Đăng nhập hệ thống, cấp phát cặp JWT Access Token và Refresh Token"""
    token_data = await AuthService.login(session, request)
    return APIResponse.ok(data=token_data, message="Đăng nhập thành công.")

@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(request: RefreshTokenRequest, session: AsyncSession = Depends(get_db)):
    """Làm mới Access Token khi hết hạn (Token Rotation an toàn)"""
    tokens = await AuthService.refresh_token(session, request)
    return APIResponse.ok(data=tokens, message="Làm mới token thành công.")

@router.post("/logout", response_model=APIResponse[None])
async def logout(authorization: str = Header(...)):
    """Đăng xuất và đưa access token vào danh sách đen (Blacklist Revocation)"""
    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        await AuthService.logout(token)
    return APIResponse.ok(data=None, message="Đăng xuất thành công và vô hiệu hóa phiên làm việc.")

@router.get("/me", response_model=APIResponse[UserProfileResponse])
async def get_profile(current_user: UserProfileResponse = Depends(get_current_user)):
    """Lấy thông tin tài khoản hiện tại kèm số dư credit"""
    return APIResponse.ok(data=current_user, message="Lấy thông tin tài khoản thành công.")
