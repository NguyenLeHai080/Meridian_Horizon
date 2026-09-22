import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Set
from jose import JWTError, jwt
import bcrypt

from app.core.config import settings
from app.core.exceptions import AppException, UnauthorizedException

# In-Memory Token Revocation / Blacklist
REVOKED_TOKENS_STORE: Set[str] = set()

# 1. Direct Bcrypt Hashing (Chuẩn Python 3.13, tốc độ cao, không phụ thuộc passlib)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác thực mật khẩu người dùng với chuỗi hash bcrypt"""
    try:
        # Cắt ngắn tối đa 72 bytes theo giới hạn chuẩn của thuật toán Bcrypt
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Băm mật khẩu sử dụng trực tiếp thư viện bcrypt độ bảo mật cao"""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def validate_password_strength(password: str) -> None:
    """
    Kiểm tra độ mạnh của mật khẩu chống Brute-force & Dictionary Attack:
    - Tối thiểu 8 ký tự
    - Chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
    """
    if len(password) < 8:
        raise AppException(message="Mật khẩu phải có độ dài tối thiểu 8 ký tự.", status_code=400)
    if not re.search(r"[A-Z]", password):
        raise AppException(message="Mật khẩu phải chứa ít nhất một chữ cái in hoa.", status_code=400)
    if not re.search(r"[a-z]", password):
        raise AppException(message="Mật khẩu phải chứa ít nhất một chữ cái thường.", status_code=400)
    if not re.search(r"\d", password):
        raise AppException(message="Mật khẩu phải chứa ít nhất một chữ số.", status_code=400)
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise AppException(message="Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*...).", status_code=400)

def create_access_token(subject: Any, role: str = "user", extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Tạo Access Token ngắn hạn với JTI (JWT ID) duy nhất"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid.uuid4())
    to_encode = {
        "sub": str(subject),
        "role": role,
        "jti": jti,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: Any, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Tạo Refresh Token dài hạn dùng để xoay vòng access token"""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())
    to_encode = {
        "sub": str(subject),
        "jti": jti,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    """Giải mã và kiểm tra chữ ký token, chống giả mạo và token đã bị thu hồi (revoked)"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        jti = payload.get("jti")
        if jti and jti in REVOKED_TOKENS_STORE:
            raise UnauthorizedException(message="Token đã bị vô hiệu hóa / thu hồi. Vui lòng đăng nhập lại.")
        return payload
    except JWTError as e:
        raise UnauthorizedException(message=f"Chữ ký xác thực không hợp lệ hoặc đã hết hạn: {str(e)}")

def revoke_token(token: str) -> None:
    """Đưa token vào danh sách đen khi người dùng đăng xuất (Logout)"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": False})
        jti = payload.get("jti")
        if jti:
            REVOKED_TOKENS_STORE.add(jti)
    except Exception:
        pass
