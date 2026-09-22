import os
import time
from fastapi import APIRouter, status
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import check_database_connection
from app.core.exceptions import EntityNotFoundException
from app.core.response import APIResponse

router = APIRouter(prefix="/system", tags=["System & Health Monitor"])

START_TIME = time.time()
STORAGE_DOWNLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../storage/downloads"))

@router.get("/health", response_model=APIResponse[dict])
async def health_check():
    """Kiểm tra trạng thái sẵn sàng của dịch vụ (Liveness & Readiness Probe)"""
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

@router.get("/downloads/windows")
async def download_windows_installer():
    """Tải tệp cài đặt cho Windows (.exe)"""
    file_path = os.path.join(STORAGE_DOWNLOAD_DIR, "PeiPeiDub-Setup-v1.5.73.exe")
    if not os.path.exists(file_path):
        raise EntityNotFoundException(message="Tệp cài đặt Windows không tồn tại trên máy chủ.")
    return FileResponse(
        path=file_path,
        filename="PeiPeiDub-Setup-v1.5.73.exe",
        media_type="application/octet-stream"
    )

@router.get("/downloads/macos")
async def download_macos_installer():
    """Tải tệp cài đặt cho macOS (.dmg)"""
    file_path = os.path.join(STORAGE_DOWNLOAD_DIR, "PeiPeiDub-macOS-v1.5.73.dmg")
    if not os.path.exists(file_path):
        raise EntityNotFoundException(message="Tệp cài đặt macOS không tồn tại trên máy chủ.")
    return FileResponse(
        path=file_path,
        filename="PeiPeiDub-macOS-v1.5.73.dmg",
        media_type="application/octet-stream"
    )
