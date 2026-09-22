import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EntityNotFoundException, ConflictException
from app.core.pagination import PageParams, PagedResponse, paginate
from app.modules.admin.models.admin import ToolLicense
from app.modules.admin.schemas.admin_schema import (
    AdminStatsResponse,
    CreateLicenseRequest,
    RenewLicenseRequest,
    UpdateLicenseRequest,
    VerifyLicenseRequest,
    VerifyLicenseResponse,
    ToolLicenseDTO,
    UserAdminDTO,
)
from app.modules.auth.models.user import User
from app.modules.dubbing.models.dubbing import DubbingProject

class AdminService:
    @staticmethod
    async def get_stats(session: AsyncSession) -> AdminStatsResponse:
        total_users = (await session.execute(select(func.count(User.id)))).scalar() or 0
        active_licenses = (await session.execute(
            select(func.count(ToolLicense.id)).where(
                ToolLicense.is_active == True,
                ToolLicense.is_locked == False,
                ToolLicense.days_remaining > 0
            )
        )).scalar() or 0
        expired_or_locked = (await session.execute(
            select(func.count(ToolLicense.id)).where(
                (ToolLicense.days_remaining <= 0) | (ToolLicense.is_locked == True) | (ToolLicense.is_active == False)
            )
        )).scalar() or 0

        total_credits = (await session.execute(select(func.sum(User.credit_balance)))).scalar() or 0
        total_videos = (await session.execute(select(func.count(DubbingProject.id)).where(DubbingProject.current_step == 5))).scalar() or 0
        active_tasks = (await session.execute(select(func.count(DubbingProject.id)).where(DubbingProject.status == "processing"))).scalar() or 0

        return AdminStatsResponse(
            total_users=total_users,
            active_licenses=active_licenses,
            expired_or_locked=expired_or_locked,
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
        licenses = res.scalars().all()

        # Seed dữ liệu mẫu chuẩn nếu chưa có
        if not licenses:
            lic1 = ToolLicense(
                license_key=f"JACS-{uuid.uuid4().hex[:4].upper()}-D1D1",
                customer_name="Máy nhà",
                user_email="nguyenlehai2003@gmail.com",
                machine_id="PC JACS-WIN-510A-6CD39D",
                package_type="AI Pro",
                daily_limit="100/d",
                days_remaining=0,
                is_lifetime=False,
                is_active=True,
                is_locked=False,
                is_online=False,
                last_ip="172.21.0.4",
                expires_at=datetime.utcnow() - timedelta(days=1)
            )
            lic2 = ToolLicense(
                license_key=f"JACS-{uuid.uuid4().hex[:4].upper()}-54E5",
                customer_name="hoangdinhchien",
                user_email="hoangdinhchien2601@gmail.com",
                machine_id="Win JACS-WIN-C82F-1C088C",
                package_type="Lifetime VIP",
                daily_limit="100/d",
                days_remaining=9999,
                is_lifetime=True,
                is_active=True,
                is_locked=False,
                is_online=False,
                last_ip="172.21.0.4",
                expires_at=None
            )
            session.add_all([lic1, lic2])
            await session.flush()
            res = await session.execute(select(ToolLicense).order_by(ToolLicense.id.desc()))
            licenses = res.scalars().all()

        return [ToolLicenseDTO.model_validate(lic) for lic in licenses]

    @staticmethod
    async def create_license(session: AsyncSession, request: CreateLicenseRequest) -> ToolLicenseDTO:
        prefix = "JACS" if "VIP" in request.package_type else "MH"
        new_key = f"{prefix}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
        
        expires = None
        days = request.days
        if request.is_lifetime:
            days = 9999
        else:
            expires = datetime.utcnow() + timedelta(days=days)

        lic = ToolLicense(
            license_key=new_key,
            customer_name=request.customer_name,
            user_email=request.user_email,
            machine_id=request.machine_id or f"PC JACS-WIN-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:6].upper()}",
            package_type=request.package_type,
            daily_limit=request.daily_limit,
            days_remaining=days,
            is_lifetime=request.is_lifetime,
            is_active=True,
            is_locked=False,
            is_online=False,
            expires_at=expires
        )
        session.add(lic)
        await session.flush()
        await session.refresh(lic)
        return ToolLicenseDTO.model_validate(lic)

    @staticmethod
    async def renew_license(session: AsyncSession, license_id: int, request: RenewLicenseRequest) -> ToolLicenseDTO:
        lic = (await session.execute(select(ToolLicense).where(ToolLicense.id == license_id))).scalar_one_or_none()
        if not lic:
            raise EntityNotFoundException(message=f"Không tìm thấy bản quyền #{license_id}")

        if request.is_lifetime:
            lic.is_lifetime = True
            lic.days_remaining = 9999
            lic.expires_at = None
        else:
            lic.days_remaining = max(0, lic.days_remaining) + request.add_days
            base_time = lic.expires_at if (lic.expires_at and lic.expires_at > datetime.utcnow()) else datetime.utcnow()
            lic.expires_at = base_time + timedelta(days=request.add_days)

        lic.is_locked = False
        lic.is_active = True
        await session.flush()
        await session.refresh(lic)
        return ToolLicenseDTO.model_validate(lic)

    @staticmethod
    async def toggle_lock_license(session: AsyncSession, license_id: int) -> ToolLicenseDTO:
        lic = (await session.execute(select(ToolLicense).where(ToolLicense.id == license_id))).scalar_one_or_none()
        if not lic:
            raise EntityNotFoundException(message=f"Không tìm thấy bản quyền #{license_id}")

        lic.is_locked = not lic.is_locked
        await session.flush()
        await session.refresh(lic)
        return ToolLicenseDTO.model_validate(lic)

    @staticmethod
    async def update_license(session: AsyncSession, license_id: int, request: UpdateLicenseRequest) -> ToolLicenseDTO:
        lic = (await session.execute(select(ToolLicense).where(ToolLicense.id == license_id))).scalar_one_or_none()
        if not lic:
            raise EntityNotFoundException(message=f"Không tìm thấy bản quyền #{license_id}")

        if request.customer_name is not None:
            lic.customer_name = request.customer_name
        if request.user_email is not None:
            lic.user_email = request.user_email
        if request.package_type is not None:
            lic.package_type = request.package_type
        if request.daily_limit is not None:
            lic.daily_limit = request.daily_limit
        if request.machine_id is not None:
            lic.machine_id = request.machine_id

        await session.flush()
        await session.refresh(lic)
        return ToolLicenseDTO.model_validate(lic)

    @staticmethod
    async def delete_license(session: AsyncSession, license_id: int) -> bool:
        lic = (await session.execute(select(ToolLicense).where(ToolLicense.id == license_id))).scalar_one_or_none()
        if not lic:
            raise EntityNotFoundException(message=f"Không tìm thấy bản quyền #{license_id}")

        await session.delete(lic)
        await session.flush()
        return True

    @staticmethod
    async def verify_license(session: AsyncSession, request: VerifyLicenseRequest) -> VerifyLicenseResponse:
        query = select(ToolLicense).where(ToolLicense.license_key == request.license_key.strip())
        lic = (await session.execute(query)).scalar_one_or_none()

        if not lic:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Mã bản quyền (License Key) không tồn tại trên hệ thống."
            )

        if lic.is_locked:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Bản quyền này đã bị Quản trị viên TẠM KHÓA do vi phạm chính sách."
            )

        if not lic.is_active:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Bản quyền này đã bị hủy kích hoạt."
            )

        # Kiểm tra HWID (nếu key đã gán với máy khác thì báo lỗi)
        clean_req_hwid = request.machine_id.strip()
        if lic.machine_id and lic.machine_id != clean_req_hwid and "JACS" not in lic.machine_id and "WIN" not in lic.machine_id:
            return VerifyLicenseResponse(
                is_valid=False,
                message=f"Mã bản quyền đã được kích hoạt trên thiết bị khác ({lic.machine_id}). Vui lòng liên hệ Admin để đổi thiết bị."
            )

        # Cập nhật HWID cho thiết bị hiện tại nếu chưa gán
        lic.machine_id = clean_req_hwid
        lic.is_online = True

        if not lic.is_lifetime and lic.days_remaining <= 0:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Bản quyền đã HẾT HẠN sử dụng. Vui lòng liên hệ Admin để gia hạn thêm thời gian."
            )

        await session.flush()

        return VerifyLicenseResponse(
            is_valid=True,
            message="Kích hoạt bản quyền thành công!",
            customer_name=lic.customer_name,
            package_type=lic.package_type,
            days_remaining=lic.days_remaining,
            is_lifetime=lic.is_lifetime,
            expires_at=lic.expires_at
        )
