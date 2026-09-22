from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.pagination import PageParams, PagedResponse
from app.core.response import APIResponse
from app.modules.auth.api.auth_router import get_current_user
from app.modules.auth.schemas.auth_schema import UserProfileResponse
from app.modules.dubbing.providers.ai_provider import ProviderRegistry
from app.modules.dubbing.schemas.dubbing_schema import (
    CreateProjectRequest,
    DubbingProjectResponse,
    ExecuteStepRequest,
    ProviderInfo,
)
from app.modules.dubbing.services.dubbing_service import DubbingService

router = APIRouter(prefix="/dubbing", tags=["AI Video Dubbing Studio"])

@router.get("/providers", response_model=APIResponse[List[ProviderInfo]])
async def get_providers():
    """Lấy danh sách các nhà cung cấp AI dịch thuật và giọng đọc khả dụng"""
    providers = ProviderRegistry.get_available_providers()
    return APIResponse.ok(data=providers, message="Lấy danh sách AI Providers thành công.")

@router.get("/projects", response_model=APIResponse[PagedResponse[DubbingProjectResponse]])
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: UserProfileResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Lấy danh sách các dự án lồng tiếng của người dùng có phân trang chuẩn"""
    params = PageParams(page=page, page_size=page_size)
    paged_projects = await DubbingService.get_projects(session, current_user.id, params)
    return APIResponse.ok(data=paged_projects, message="Tải danh sách dự án thành công.")

@router.post("/projects", response_model=APIResponse[DubbingProjectResponse], status_code=status.HTTP_201_CREATED)
async def create_project(
    request: CreateProjectRequest,
    current_user: UserProfileResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Khởi tạo một dự án video dubbing mới và cấu hình tham số AI"""
    project = await DubbingService.create_project(session, current_user.id, request)
    return APIResponse.ok(data=project, message="Khởi tạo dự án lồng tiếng thành công.", status_code=201)

@router.get("/projects/{project_id}", response_model=APIResponse[DubbingProjectResponse])
async def get_project_details(
    project_id: int,
    current_user: UserProfileResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Chi tiết dự án, tiến độ các bước và phụ đề preview"""
    project = await DubbingService.get_project_by_id(session, project_id, current_user.id)
    return APIResponse.ok(data=project, message="Lấy chi tiết dự án thành công.")

@router.post("/projects/{project_id}/execute-step", response_model=APIResponse[DubbingProjectResponse])
async def execute_step(
    project_id: int,
    request: ExecuteStepRequest,
    current_user: UserProfileResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Kích hoạt thực thi tuần tự từng bước trong chu trình 5 bước"""
    updated_project = await DubbingService.advance_step(session, project_id, current_user.id, request)
    return APIResponse.ok(data=updated_project, message=f"Đã xử lý xong bước {request.step}!")
