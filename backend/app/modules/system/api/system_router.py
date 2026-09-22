import time
from fastapi import APIRouter, status
from app.core.config import settings
from app.core.database import check_database_connection
from app.core.response import APIResponse

router = APIRouter(prefix="/system", tags=["System & Health Monitor"])

START_TIME = time.time()

@router.get("/health", response_model=APIResponse[dict])
async def health_check():
    """
    Kiểm tra trạng thái sẵn sàng của dịch vụ (Liveness & Readiness Probe)
    Tự động kiểm tra tính kết nối của CSDL
    """
    db_connected = await check_database_connection()
    uptime_seconds = int(time.time() - START_TIME)
    
    health_data = {
        "status": "healthy" if db_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": uptime_seconds,
        "database_connected": db_connected
    }
    
    return APIResponse.ok(
        data=health_data,
        message="Hệ thống Meridian Horizon hoạt động bình thường."
    )
