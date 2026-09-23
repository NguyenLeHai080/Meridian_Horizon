from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

DEFAULT_PERMISSIONS_DICT = {
    # 1. Menu NGUỒN (Sources)
    "source_download_url": True,
    "source_queue": True,
    "source_channel_scan": True,
    "source_import_srt": True,

    # 2. Menu CÔNG CỤ (Tools)
    "tool_queue": True,
    "tool_video_split": True,
    "tool_gpu": True,
    "tool_voice_clone": True,
    "tool_offline_voice": True,
    "tool_api_keys": True,

    # 3. Module LÀM VIỆC (Workstations)
    "module_video_dubbing": True,
    "module_movie_review": True,
    "module_subtitles_editor": True,
}

class ClientAccount(Base):
    __tablename__ = "client_accounts"

    machine_name = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    machine_id = Column(String(100), nullable=False, index=True)
    note = Column(String(500), nullable=True)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    permissions = Column(JSON, nullable=False, default=DEFAULT_PERMISSIONS_DICT)

    keys = relationship("AccountKey", back_populates="account", cascade="all, delete-orphan", lazy="selectin")


class AccountKey(Base):
    __tablename__ = "account_keys"

    account_id = Column(Integer, ForeignKey("client_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    license_key = Column(String(100), unique=True, index=True, nullable=False)
    package_type = Column(String(100), default="AI Pro Studio (365 ngày)", nullable=False)
    days_remaining = Column(Integer, default=365, nullable=False)
    is_lifetime = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="active", nullable=False) # active, locked
    last_used = Column(DateTime, nullable=True)
    last_ip = Column(String(50), default="127.0.0.1", nullable=True)

    account = relationship("ClientAccount", back_populates="keys", lazy="selectin")


class ToolLicense(Base):
    __tablename__ = "tool_licenses"

    license_key = Column(String(100), unique=True, index=True, nullable=False)
    customer_name = Column(String(255), default="Người dùng mới", nullable=False)
    user_email = Column(String(255), nullable=False)
    machine_id = Column(String(100), default="HWID-WIN11-64X-88231", nullable=False)
    package_type = Column(String(50), default="AI Pro", nullable=False)
    daily_limit = Column(String(50), default="100/d", nullable=False)
    days_remaining = Column(Integer, default=43, nullable=False)
    is_lifetime = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    last_ip = Column(String(50), default="127.0.0.1", nullable=True)
    expires_at = Column(DateTime, nullable=True)
