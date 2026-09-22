import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, EntityNotFoundException
from app.core.pagination import PageParams, PagedResponse, paginate
from app.modules.auth.models.user import User
from app.modules.dubbing.models.dubbing import DubbingProject
from app.modules.dubbing.providers.ai_provider import ProviderRegistry
from app.modules.dubbing.schemas.dubbing_schema import (
    CreateProjectRequest,
    DubbingProjectResponse,
    ExecuteStepRequest,
)

logger = logging.getLogger("meridian.dubbing_service")

class DubbingService:
    @staticmethod
    async def create_project(
        session: AsyncSession,
        user_id: int,
        request: CreateProjectRequest
    ) -> DubbingProjectResponse:
        # 1. Kiểm tra tài khoản và số dư credit
        user_res = await session.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user:
            raise EntityNotFoundException(message="Không tìm thấy người dùng.")

        if user.credit_balance < 100:
            raise AppException(message="Số dư credit không đủ để khởi tạo dự án mới (Yêu cầu tối thiểu 100 credits).", status_code=400)

        # 2. Khởi tạo dự án với thông số người dùng chọn
        new_project = DubbingProject(
            user_id=user_id,
            title=request.title,
            video_filename=request.video_filename or "default_video.mp4",
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            provider_type=request.provider_type,
            genre=request.genre,
            custom_prompt=request.custom_prompt,
            current_step=1,
            status="ready",
            progress=20,
            credits_used=100
        )
        # Khấu trừ credit
        user.credit_balance -= 100
        session.add(new_project)
        await session.flush()
        await session.refresh(new_project)
        logger.info(f"Tạo dự án lồng tiếng #{new_project.id} cho user {user_id}")
        return DubbingProjectResponse.model_validate(new_project)

    @staticmethod
    async def get_projects(
        session: AsyncSession,
        user_id: int,
        params: PageParams
    ) -> PagedResponse[DubbingProjectResponse]:
        query = select(DubbingProject).where(DubbingProject.user_id == user_id).order_by(DubbingProject.id.desc())
        paged_raw = await paginate(session, query, params)
        
        # Chuyển đổi danh sách ORM sang Pydantic DTO
        validated_items = [DubbingProjectResponse.model_validate(item) for item in paged_raw.items]
        return PagedResponse(items=validated_items, meta=paged_raw.meta)

    @staticmethod
    async def get_project_by_id(session: AsyncSession, project_id: int, user_id: int) -> DubbingProjectResponse:
        query = select(DubbingProject).where(DubbingProject.id == project_id, DubbingProject.user_id == user_id)
        result = await session.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            raise EntityNotFoundException(message=f"Không tìm thấy dự án lồng tiếng #{project_id}.")
        return DubbingProjectResponse.model_validate(project)

    @staticmethod
    async def advance_step(
        session: AsyncSession,
        project_id: int,
        user_id: int,
        request: ExecuteStepRequest
    ) -> DubbingProjectResponse:
        query = select(DubbingProject).where(DubbingProject.id == project_id, DubbingProject.user_id == user_id)
        result = await session.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            raise EntityNotFoundException(message=f"Dự án #{project_id} không tồn tại.")

        # Xử lý tuần tự 5 bước theo quy trình Scrum & Video Dubbing
        step_names = {
            1: "Tách transcript",
            2: "Dịch phụ đề",
            3: "Tạo phụ đề SRT",
            4: "Tạo giọng đọc AI",
            5: "Xuất bản video hoàn tất"
        }
        
        project.current_step = min(request.step + 1, 5)
        project.progress = project.current_step * 20
        project.status = "completed" if project.current_step == 5 else "processing"
        
        # Giả lập xử lý Provider nếu là bước dịch (Bước 2)
        if request.step == 2:
            provider = ProviderRegistry.resolve_provider(project.provider_type)
            translated = await provider.translate_subtitles(
                text_content=project.subtitles_preview or "",
                source_lang=project.source_lang,
                target_lang=project.target_lang,
                style_prompt=project.custom_prompt or ""
            )
            project.subtitles_preview += f"\n[Bản dịch AI]: {translated}"

        await session.flush()
        await session.refresh(project)
        logger.info(f"Dự án #{project_id} đã hoàn tất bước {request.step}: {step_names.get(request.step)}")
        return DubbingProjectResponse.model_validate(project)
