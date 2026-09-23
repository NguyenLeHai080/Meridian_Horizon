from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.pagination import PageParams, PagedResponse
from app.core.response import APIResponse
from app.modules.admin.schemas.admin_schema import (
    AdminStatsResponse,
    CreateLicenseRequest,
    RenewLicenseRequest,
    UpdateLicenseRequest,
    VerifyLicenseRequest,
    VerifyLicenseResponse,
    ToggleUserStatusRequest,
    ToolLicenseDTO,
    UpdateUserCreditsRequest,
    UserAdminDTO,
    ClientAccountDTO,
    AccountKeyDTO,
    CreateClientAccountRequest,
    UpdateClientAccountRequest,
    UpdateAccountPermissionsRequest,
    AddAccountKeyRequest,
)
from app.modules.admin.services.admin_service import AdminService
from app.modules.auth.api.auth_router import get_current_user
from app.modules.auth.schemas.auth_schema import UserProfileResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal & Tool Management"])

def require_admin(current_user: UserProfileResponse = Depends(get_current_user)):
    return current_user

@router.get("/stats", response_model=APIResponse[AdminStatsResponse])
async def get_stats(
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    stats = await AdminService.get_stats(session)
    return APIResponse.ok(data=stats, message="Lấy thống kê hệ thống thành công.")

@router.get("/users", response_model=APIResponse[PagedResponse[UserAdminDTO]])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
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
    updated_user = await AdminService.update_user_credits(session, user_id, request.amount)
    return APIResponse.ok(data=updated_user, message=f"Đã cập nhật credit cho user #{user_id}!")

@router.patch("/users/{user_id}/status", response_model=APIResponse[UserAdminDTO])
async def toggle_status(
    user_id: int,
    request: ToggleUserStatusRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    updated_user = await AdminService.toggle_user_status(session, user_id, request.is_active)
    return APIResponse.ok(data=updated_user, message=f"Đã cập nhật trạng thái tài khoản #{user_id}!")

# =============================================================================
# API QUẢN LÝ TÀI KHOẢN MÁY KHÁCH & KEYS & PHÂN QUYỀN (CHUẨN DATABASE REAL)
# =============================================================================

@router.get("/client-accounts", response_model=APIResponse[List[ClientAccountDTO]])
async def list_client_accounts(
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Lấy danh sách tất cả tài khoản máy khách kèm Keys và Ma trận phân quyền"""
    accounts = await AdminService.list_client_accounts(session)
    return APIResponse.ok(data=accounts, message="Lấy danh sách tài khoản máy khách thành công.")

@router.post("/client-accounts", response_model=APIResponse[ClientAccountDTO], status_code=status.HTTP_201_CREATED)
async def create_client_account(
    request: CreateClientAccountRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Tạo mới tài khoản máy khách với tên máy, khách hàng, HWID và phân quyền"""
    account = await AdminService.create_client_account(session, request)
    return APIResponse.ok(data=account, message="Tạo tài khoản máy khách thành công!", status_code=201)

@router.put("/client-accounts/{account_id}", response_model=APIResponse[ClientAccountDTO])
async def update_client_account(
    account_id: int,
    request: UpdateClientAccountRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Chỉnh sửa thông tin tài khoản máy khách (tên máy, email, HWID, ghi chú)"""
    updated = await AdminService.update_client_account(session, account_id, request)
    return APIResponse.ok(data=updated, message="Cập nhật tài khoản máy thành công!")

@router.delete("/client-accounts/{account_id}", response_model=APIResponse[bool])
async def delete_client_account(
    account_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Xóa tài khoản máy khách và thu hồi toàn bộ key liên kết"""
    await AdminService.delete_client_account(session, account_id)
    return APIResponse.ok(data=True, message="Đã xóa tài khoản máy khách thành công!")

@router.patch("/client-accounts/{account_id}/toggle-lock", response_model=APIResponse[ClientAccountDTO])
async def toggle_client_account_lock(
    account_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Tạm khóa hoặc mở khóa tài khoản máy khách"""
    updated = await AdminService.toggle_client_account_lock(session, account_id)
    status_str = "KÍCH HOẠT" if updated.is_active else "TẠM KHÓA"
    return APIResponse.ok(data=updated, message=f"Đã {status_str} tài khoản máy khách thành công!")

@router.put("/client-accounts/{account_id}/permissions", response_model=APIResponse[ClientAccountDTO])
async def update_account_permissions(
    account_id: int,
    request: UpdateAccountPermissionsRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Cập nhật ma trận phân quyền các menu/module Tool cho tài khoản máy này"""
    updated = await AdminService.update_account_permissions(session, account_id, request.permissions)
    return APIResponse.ok(data=updated, message="Đã lưu ma trận phân quyền thành công!")

@router.post("/client-accounts/{account_id}/keys", response_model=APIResponse[AccountKeyDTO], status_code=status.HTTP_201_CREATED)
async def add_account_key(
    account_id: int,
    request: AddAccountKeyRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Cấp phát License Key mới gán trực tiếp cho tài khoản máy khách này"""
    key_dto = await AdminService.add_account_key(session, account_id, request)
    return APIResponse.ok(data=key_dto, message="Cấp Key cho tài khoản thành công!", status_code=201)

@router.delete("/client-accounts/{account_id}/keys/{key_id}", response_model=APIResponse[bool])
async def delete_account_key(
    account_id: int,
    key_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Xóa thu hồi một License Key khỏi tài khoản máy khách"""
    await AdminService.delete_account_key(session, account_id, key_id)
    return APIResponse.ok(data=True, message="Đã thu hồi Key thành công!")

@router.patch("/client-accounts/{account_id}/keys/{key_id}/toggle-lock", response_model=APIResponse[AccountKeyDTO])
async def toggle_account_key_lock(
    account_id: int,
    key_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Khóa hoặc mở khóa một License Key của tài khoản"""
    updated_key = await AdminService.toggle_account_key_lock(session, account_id, key_id)
    status_str = "MỞ KHÓA" if updated_key.status == "active" else "TẠM KHÓA"
    return APIResponse.ok(data=updated_key, message=f"Đã {status_str} Key thành công!")

# =============================================================================
# QUẢN LÝ BẢN QUYỀN MÁY TRẠM VÀ XÁC THỰC TOOL
# =============================================================================

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

@router.put("/licenses/{license_id}/renew", response_model=APIResponse[ToolLicenseDTO])
async def renew_license(
    license_id: int,
    request: RenewLicenseRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Gia hạn thời gian sử dụng bản quyền (+30d, +90d, +365d, Vĩnh viễn)"""
    renewed = await AdminService.renew_license(session, license_id, request)
    return APIResponse.ok(data=renewed, message="Gia hạn bản quyền thành công!")

@router.put("/licenses/{license_id}/toggle-lock", response_model=APIResponse[ToolLicenseDTO])
async def toggle_lock_license(
    license_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Tạm khóa hoặc mở khóa thiết bị khách"""
    updated = await AdminService.toggle_lock_license(session, license_id)
    state_str = "đã bị TẠM KHÓA" if updated.is_locked else "đã được MỞ KHÓA"
    return APIResponse.ok(data=updated, message=f"Thiết bị {state_str} thành công!")

@router.put("/licenses/{license_id}", response_model=APIResponse[ToolLicenseDTO])
async def update_license(
    license_id: int,
    request: UpdateLicenseRequest,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Chỉnh sửa thông tin bản quyền và thiết bị"""
    updated = await AdminService.update_license(session, license_id, request)
    return APIResponse.ok(data=updated, message="Cập nhật thông tin bản quyền thành công!")

@router.delete("/licenses/{license_id}", response_model=APIResponse[bool])
async def delete_license(
    license_id: int,
    admin: UserProfileResponse = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """Thu hồi và xóa bỏ mã bản quyền khỏi hệ thống"""
    await AdminService.delete_license(session, license_id)
    return APIResponse.ok(data=True, message="Đã xóa bản quyền thành công!")

@router.post("/licenses/verify", response_model=APIResponse[VerifyLicenseResponse])
async def verify_license_endpoint(
    request: VerifyLicenseRequest,
    session: AsyncSession = Depends(get_db)
):
    """API xác thực bản quyền trực tuyến dành cho Tool Desktop / Web (Trả về phân quyền theo tài khoản)"""
    result = await AdminService.verify_license(session, request)
    return APIResponse.ok(data=result, message=result.message)
