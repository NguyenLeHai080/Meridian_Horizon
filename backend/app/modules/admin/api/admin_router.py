from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.pagination import PageParams, PagedResponse
from app.core.response import APIResponse
from app.modules.admin.schemas.admin_schema import (
    AdminStatsResponse,
    CreateLicenseRequest,
    ToggleUserStatusRequest,
    ToolLicenseDTO,
    UpdateUserCreditsRequest,
    UserAdminDTO,
)
from app.modules.admin.services.admin_service import AdminService
from app.modules.auth.api.auth_router import get_current_user
from app.modules.auth.schemas.auth_schema import UserProfileResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal & Tool Management"])

# Dependency kiểm tra quyền Quản trị viên
def require_admin(current_user: UserProfileResponse = Depends(get_current_user)):
    # Trong môi trường dev, cho phép user hoặc kiểm tra role admin
    return current_user

@router.get("/stats", response_model=APIResponse[AdminStatsResponse])
async def get_stats(
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Thống kê tổng quan hệ sinh thái Studio Tool: users, credits, gpu, tasks"""
    stats = await AdminService.get_stats(session)
    return APIResponse.ok(data=stats, message="Lấy thống kê hệ thống thành công.")

@router.get("/users", response_model=APIResponse[PagedResponse[UserAdminDTO]])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Danh sách toàn bộ người dùng sử dụng tool với phân trang"""
    params = PageParams(page=page, page_size=page_size)
    paged_users = await AdminService.list_users(session, params)
    return APIResponse.ok(data=paged_users, message="Tải danh sách người dùng thành công.")

@router.patch("/users/{user_id}/credits", response_model=APIResponse[UserAdminDTO])
async def update_credits(
    user_id: int,
    request: UpdateUserCreditsRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Admin nạp thêm hoặc trừ credit của người dùng"""
    updated_user = await AdminService.update_user_credits(session, user_id, request.amount)
    return APIResponse.ok(data=updated_user, message=f"Đã cập nhật credit cho user #{user_id}!")

@router.patch("/users/{user_id}/status", response_model=APIResponse[UserAdminDTO])
async def toggle_status(
    user_id: int,
    request: ToggleUserStatusRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Khóa hoặc mở khóa tài khoản người dùng"""
    updated_user = await AdminService.toggle_user_status(session, user_id, request.is_active)
    return APIResponse.ok(data=updated_user, message=f"Đã cập nhật trạng thái tài khoản #{user_id}!")

@router.get("/licenses", response_model=APIResponse[List[ToolLicenseDTO]])
async def list_licenses(
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Danh sách bản quyền tool đã phát hành và thời hạn còn lại"""
    licenses = await AdminService.list_licenses(session)
    return APIResponse.ok(data=licenses, message="Lấy danh sách bản quyền thành công.")

@router.post("/licenses", response_model=APIResponse[ToolLicenseDTO], status_code=status.HTTP_201_CREATED)
async def create_license(
    request: CreateLicenseRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Cấp phát mã bản quyền mới cho tool (HWID Binding)"""
    new_lic = await AdminService.create_license(session, request)
    return APIResponse.ok(data=new_lic, message="Cấp bản quyền thành công!", status_code=201)
