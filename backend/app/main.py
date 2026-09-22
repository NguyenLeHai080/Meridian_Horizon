import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, check_database_connection, engine
from app.core.middlewares.cors import setup_cors
from app.core.middlewares.error_handler import setup_error_handlers
from app.core.middlewares.rate_limit import RateLimitMiddleware
from app.core.middlewares.security_headers import SecurityHeadersMiddleware
from app.modules.auth.api.auth_router import router as auth_router
from app.modules.dubbing.api.dubbing_router import router as dubbing_router
from app.modules.system.api.system_router import router as system_router
from app.modules.admin.api.admin_router import router as admin_router

# Thiết lập ghi log chuẩn hóa
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("meridian.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Quản lý vòng đời khởi động và kết thúc của ứng dụng"""
    logger.info("=== Khởi động Meridian Horizon Enterprise API ===")
    
    # 1. Kiểm tra kết nối CSDL và tự động tạo bảng
    try:
        await check_database_connection()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Khởi tạo thành công cấu trúc cơ sở dữ liệu ORM.")
    except Exception as exc:
        logger.critical(f"Lỗi nghiêm trọng khi kết nối cơ sở dữ liệu khởi động: {exc}")

    yield

    # Đóng kết nối an toàn khi shutdown
    await engine.dispose()
    logger.info("Đã đóng kết nối cơ sở dữ liệu an toàn.")

# 1. Khởi tạo FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hệ sinh thái API chuẩn hóa doanh nghiệp dành cho Meridian Horizon Studio",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# 2. Đăng ký các lớp Middleware Bảo mật & Chống Spam
setup_cors(app)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, general_limit=120, auth_limit=20, window_seconds=60)
setup_error_handlers(app)

# 3. Đăng ký các Routers có tiền tố /api/v1 chuẩn RESTful
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(dubbing_router, prefix=api_v1_prefix)
app.include_router(system_router, prefix=api_v1_prefix)
app.include_router(admin_router, prefix=api_v1_prefix)

@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{api_v1_prefix}/system/health"
    }
