from sqlalchemy import Boolean, Column, Float, Integer, String
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False) # admin, editor, user
    is_active = Column(Boolean, default=True, nullable=False)
    credit_balance = Column(Integer, default=86137, nullable=False) # Khởi tạo số dư credit như trong ảnh mẫu
