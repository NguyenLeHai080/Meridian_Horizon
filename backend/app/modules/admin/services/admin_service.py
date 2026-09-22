import uuid
from typing import List
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EntityNotFoundException
from app.core.pagination import PageParams, PagedResponse, paginate
from app.modules.admin.models.admin import ToolLicense
from app.modules.admin.schemas.admin_schema import (
    AdminStatsResponse,
    CreateLicenseRequest,
    ToolLicenseDTO,
    UserAdminDTO,
)
from app.modules.auth.models.user import User
from app.modules.dubbing.models.dubbing import DubbingProject

class AdminService:
    @staticmethod
    async def get_stats(session: AsyncSession) -> AdminStatsResponse:
        total_users = (await session.execute(select(func.count(User.id)))).scalar() or 0
        active_licenses = (await session.execute(select(func.count(ToolLicense.id)).where(ToolLicense.is_active == True))).scalar() or 0
        total_credits = (await session.execute(select(func.sum(User.credit_balance)))).scalar() or 0
        total_videos = (await session.execute(select(func.count(DubbingProject.id)).where(DubbingProject.current_step == 5))).scalar() or 0
        active_tasks = (await session.execute(select(func.count(DubbingProject.id)).where(DubbingProject.status == "processing"))).scalar() or 0

        return AdminStatsResponse(
            total_users=total_users,
            active_licenses=active_licenses,
            total_credits_allocated=total_credits,
            total_rendered_videos=total_videos,
            gpu_cluster_status="NVIDIA RTX 4090 Cluster - Online (4/4 Nodes)",
            active_dubbing_tasks=active_tasks
        )

    @staticmethod
    async def list_users(session: AsyncSession, params: PageParams) -> PagedResponse[UserAdminDTO]:
        query = select(User).order_by(User.id.desc())
        paged = await paginate(session, query, params)
        items = [UserAdminDTO.model_validate(u) for u in paged.items]
        return PagedResponse(items=items, meta=paged.meta)

    @staticmethod
    async def update_user_credits(session: AsyncSession, user_id: int, amount: int) -> UserAdminDTO:
        user = (await session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise EntityNotFoundException(message=f"Không tìm thấy người dùng #{user_id}")
        user.credit_balance = max(0, user.credit_balance + amount)
        await session.flush()
        await session.refresh(user)
        return UserAdminDTO.model_validate(user)

    @staticmethod
    async def toggle_user_status(session: AsyncSession, user_id: int, is_active: bool) -> UserAdminDTO:
        user = (await session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise EntityNotFoundException(message=f"Không tìm thấy người dùng #{user_id}")
        user.is_active = is_active
        await session.flush()
        await session.refresh(user)
        return UserAdminDTO.model_validate(user)

    @staticmethod
    async def list_licenses(session: AsyncSession) -> List[ToolLicenseDTO]:
        res = await session.execute(select(ToolLicense).order_by(ToolLicense.id.desc()))
        return [ToolLicenseDTO.model_validate(lic) for lic in res.scalars().all()]

    @staticmethod
    async def create_license(session: AsyncSession, request: CreateLicenseRequest) -> ToolLicenseDTO:
        new_key = f"PEIPEI-PRO-{uuid.uuid4().hex[:8].upper()}-{uuid.uuid4().hex[:8].upper()}"
        lic = ToolLicense(
            license_key=new_key,
            user_email=request.user_email,
            machine_id=request.machine_id or f"HWID-{uuid.uuid4().hex[:12].upper()}",
            days_remaining=request.days,
            is_active=True
        )
        session.add(lic)
        await session.flush()
        await session.refresh(lic)
        return ToolLicenseDTO.model_validate(lic)
