import asyncio
import logging
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import Column, DateTime, Integer, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, declared_attr

from app.core.config import settings
from app.core.exceptions import DatabaseConnectionException

logger = logging.getLogger("meridian.database")

# 1. Base ORM Model
class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Tự động chuyển CamelCase thành snake_case
        import re
        return re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower()

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

# 2. Async Engine Configuration
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    future=True,
    # Hỗ trợ kiểm tra kết nối sống trước khi sử dụng session
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# 3. Connection Health Check & Retry Mechanism
async def check_database_connection(max_retries: int = 3, retry_delay: float = 1.0) -> bool:
    """Kiểm tra và thử kết nối lại CSDL khi xảy ra lỗi gián đoạn"""
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                logger.info("Kết nối cơ sở dữ liệu thành công.")
                return True
        except (OperationalError, SQLAlchemyError, Exception) as err:
            logger.warning(f"Lần thử kết nối CSDL {attempt}/{max_retries} thất bại: {err}")
            if attempt < max_retries:
                await asyncio.sleep(retry_delay * attempt)
            else:
                logger.error("Đã thử lại tối đa nhưng không thể kết nối đến cơ sở dữ liệu.")
                raise DatabaseConnectionException(
                    message="Không thể kết nối đến cơ sở dữ liệu sau nhiều lần thử lại.",
                    details=str(err)
                )
    return False

# 4. Dependency Injection Session Generator
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency cung cấp session an toàn, tự động rollback khi có lỗi"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except OperationalError as op_err:
            await session.rollback()
            logger.error(f"Lỗi kết nối cơ sở dữ liệu trong quá trình xử lý: {op_err}")
            raise DatabaseConnectionException(
                message="Kết nối cơ sở dữ liệu bị gián đoạn trong khi truy vấn.",
                details=str(op_err)
            )
        except Exception as exc:
            await session.rollback()
            raise exc
        finally:
            await session.close()
