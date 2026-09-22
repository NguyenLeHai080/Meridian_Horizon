from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from datetime import datetime, timezone
from app.core.database import Base

class ToolLicense(Base):
    __tablename__ = "tool_licenses"

    license_key = Column(String(100), unique=True, index=True, nullable=False)
    customer_name = Column(String(255), default="Người dùng mới", nullable=False)
    user_email = Column(String(255), nullable=False)
    machine_id = Column(String(100), default="HWID-WIN11-64X-88231", nullable=False)
    package_type = Column(String(50), default="AI Pro", nullable=False) # AI Pro, Lifetime VIP
    daily_limit = Column(String(50), default="100/d", nullable=False)
    days_remaining = Column(Integer, default=43, nullable=False)
    is_lifetime = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    last_ip = Column(String(50), default="127.0.0.1", nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
