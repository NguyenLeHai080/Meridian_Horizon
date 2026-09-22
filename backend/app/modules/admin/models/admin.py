from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from datetime import datetime, timezone
from app.core.database import Base

class ToolLicense(Base):
    __tablename__ = "tool_licenses"

    license_key = Column(String(100), unique=True, index=True, nullable=False)
    user_email = Column(String(255), nullable=False)
    machine_id = Column(String(100), default="HWID-WIN11-64X-88231", nullable=False)
    days_remaining = Column(Integer, default=43, nullable=False) # 43 ngày như trong ảnh mẫu
    max_concurrency = Column(Integer, default=3, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
