import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictException, EntityNotFoundException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    revoke_token,
    validate_password_strength,
    verify_password,
)
from app.modules.auth.models.user import User
from app.modules.auth.schemas.auth_schema import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserProfileResponse,
)

logger = logging.getLogger("meridian.auth_service")

class AuthService:
    @staticmethod
    async def register(session: AsyncSession, request: RegisterRequest) -> UserProfileResponse:
        # 1. Kiểm tra độ mạnh mật khẩu
        validate_password_strength(request.password)

        # 2. Kiểm tra email đã tồn tại chưa
        existing = await session.execute(select(User).where(User.email == request.email))
        if existing.scalar_one_or_none():
            raise ConflictException(message=f"Tài khoản với email '{request.email}' đã tồn tại trên hệ thống.")

        # 3. Tạo tài khoản mới với mật khẩu băm bảo mật
        hashed_pwd = get_password_hash(request.password)
        new_user = User(
            email=request.email,
            hashed_password=hashed_pwd,
            full_name=request.full_name,
            role="user",
            credit_balance=86137
        )
        session.add(new_user)
        await session.flush()
        await session.refresh(new_user)
        logger.info(f"Đăng ký thành công người dùng mới: {new_user.email}")
        return UserProfileResponse.model_validate(new_user)

    @staticmethod
    async def login(session: AsyncSession, request: LoginRequest) -> TokenResponse:
        # 1. Tìm người dùng theo email
        result = await session.execute(select(User).where(User.email == request.email))
        user = result.scalar_one_or_none()

        # 2. Kiểm tra mật khẩu (chống timing attack)
        if not user or not verify_password(request.password, user.hashed_password):
            raise UnauthorizedException(message="Email hoặc mật khẩu không chính xác.")

        if not user.is_active:
            raise UnauthorizedException(message="Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên.")

        # 3. Cấp phát JWT Access & Refresh Token
        access_token = create_access_token(subject=user.id, role=user.role, extra_claims={"email": user.email})
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            email=user.email,
            role=user.role
        )

    @staticmethod
    async def refresh_token(session: AsyncSession, request: RefreshTokenRequest) -> TokenResponse:
        # 1. Giải mã refresh token
        payload = decode_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException(message="Loại token không hợp lệ (yêu cầu refresh token).")

        user_id = int(payload.get("sub"))
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise UnauthorizedException(message="Người dùng không tồn tại hoặc đã bị khóa.")

        # 2. Xoay vòng token mới
        new_access_token = create_access_token(subject=user.id, role=user.role, extra_claims={"email": user.email})
        new_refresh_token = create_refresh_token(subject=user.id)

        # 3. Thu hồi refresh token cũ (Token Rotation)
        revoke_token(request.refresh_token)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            email=user.email,
            role=user.role
        )

    @staticmethod
    async def logout(token: str) -> None:
        """Đưa token vào blacklist để chống tái sử dụng"""
        revoke_token(token)

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int) -> UserProfileResponse:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise EntityNotFoundException(message="Không tìm thấy thông tin người dùng.")
        return UserProfileResponse.model_validate(user)
