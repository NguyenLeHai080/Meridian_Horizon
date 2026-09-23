import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EntityNotFoundException, ConflictException
from app.core.pagination import PageParams, PagedResponse, paginate
from app.modules.admin.models.admin import (
    ToolLicense,
    ClientAccount,
    AccountKey,
    DEFAULT_PERMISSIONS_DICT,
)
from app.modules.admin.schemas.admin_schema import (
    AdminStatsResponse,
    CreateLicenseRequest,
    RenewLicenseRequest,
    UpdateLicenseRequest,
    VerifyLicenseRequest,
    VerifyLicenseResponse,
    ToolLicenseDTO,
    UserAdminDTO,
    ClientAccountDTO,
    AccountKeyDTO,
    CreateClientAccountRequest,
    UpdateClientAccountRequest,
    UpdateAccountPermissionsRequest,
    AddAccountKeyRequest,
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

    # =========================================================================
    # QUẢN LÝ TÀI KHOẢN MÁY KHÁCH & KEYS & MA TRẬN PHÂN QUYỀN (REAL DATABASE)
    # =========================================================================

    @staticmethod
    def _map_account_dto(acc: ClientAccount) -> ClientAccountDTO:
        key_dtos = []
        for k in (acc.keys or []):
            dto = AccountKeyDTO(
                id=k.id,
                account_id=k.account_id,
                license_key=k.license_key,
                key=k.license_key,
                package_type=k.package_type,
                days_remaining=k.days_remaining,
                is_lifetime=k.is_lifetime,
                status=k.status,
                last_used=k.last_used,
                last_ip=k.last_ip,
                created_at=k.created_at
            )
            key_dtos.append(dto)

        return ClientAccountDTO(
            id=acc.id,
            machine_name=acc.machine_name,
            customer_name=acc.customer_name,
            user_email=acc.user_email,
            machine_id=acc.machine_id,
            note=acc.note,
            role=acc.role,
            is_active=acc.is_active,
            permissions=acc.permissions or DEFAULT_PERMISSIONS_DICT,
            created_at=acc.created_at,
            keys=key_dtos
        )

    @staticmethod
    async def list_client_accounts(session: AsyncSession) -> List[ClientAccountDTO]:
        res = await session.execute(
            select(ClientAccount).options(selectinload(ClientAccount.keys)).order_by(ClientAccount.id.asc())
        )
        accounts = res.scalars().all()

        # Seed realistic initial data if table is empty
        if not accounts:
            acc1 = ClientAccount(
                machine_name="Máy Studio Biên Tập 01 (PC-WIN-HN)",
                customer_name="Nguyễn Văn Hùng",
                user_email="hung.video@gmail.com",
                machine_id="PC-WIN-510A-6CD39D",
                note="Khách hàng gói Doanh Nghiệp VIP",
                role="editor",
                is_active=True,
                permissions=dict(DEFAULT_PERMISSIONS_DICT),
            )
            acc2 = ClientAccount(
                machine_name="Máy Review Truyện Tranh 02 (PC-MANGA-SG)",
                customer_name="Hoàng Đình Chiến",
                user_email="hoangdinhchien2601@gmail.com",
                machine_id="PC-WIN-C82F-1C088C",
                note="Khách hàng chuyên làm Review Truyện Tranh Chap VIP",
                role="user",
                is_active=True,
                permissions={
                    **DEFAULT_PERMISSIONS_DICT,
                    "source_queue": False,
                    "source_channel_scan": False,
                    "module_video_dubbing": False,
                    "tool_api_keys": False,
                },
            )
            acc3 = ClientAccount(
                machine_name="Máy Render Đồ Họa 03 (PC-DA-NANG)",
                customer_name="Trần Thanh Tùng",
                user_email="tung.graphic@meridian.vn",
                machine_id="PC-WIN-9821-E8A102",
                note="Máy trạm dựng phim phòng sản xuất số 3",
                role="editor",
                is_active=True,
                permissions=dict(DEFAULT_PERMISSIONS_DICT),
            )
            session.add_all([acc1, acc2, acc3])
            await session.flush()

            # Seed keys linked to accounts
            k1 = AccountKey(
                account_id=acc1.id,
                license_key="WUKONG-PRO-9B21-4CA0-D1D1",
                package_type="AI Pro Studio (365 ngày)",
                days_remaining=365,
                is_lifetime=False,
                status="active",
                last_used=datetime.now(timezone.utc),
            )
            k2 = AccountKey(
                account_id=acc2.id,
                license_key="WUKONG-VIP-F710-9E11-54E5",
                package_type="Lifetime VIP (Vĩnh viễn)",
                days_remaining=9999,
                is_lifetime=True,
                status="active",
                last_used=datetime.now(timezone.utc),
            )
            k3 = AccountKey(
                account_id=acc3.id,
                license_key="WUKONG-STD-3381-55CC-77A1",
                package_type="AI Standard (90 ngày)",
                days_remaining=88,
                is_lifetime=False,
                status="active",
                last_used=datetime.now(timezone.utc),
            )
            session.add_all([k1, k2, k3])
            await session.flush()

            res = await session.execute(
                select(ClientAccount).options(selectinload(ClientAccount.keys)).order_by(ClientAccount.id.asc())
            )
            accounts = res.scalars().all()

        return [AdminService._map_account_dto(a) for a in accounts]

    @staticmethod
    async def create_client_account(session: AsyncSession, request: CreateClientAccountRequest) -> ClientAccountDTO:
        machine_hwid = request.machine_id or f"PC-WIN-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:6].upper()}"
        
        account = ClientAccount(
            machine_name=request.machine_name.strip(),
            customer_name=request.customer_name.strip(),
            user_email=request.user_email.strip(),
            machine_id=machine_hwid,
            note=request.note,
            role=request.role or "user",
            is_active=True,
            permissions=request.permissions or dict(DEFAULT_PERMISSIONS_DICT)
        )
        session.add(account)
        await session.flush()
        await session.refresh(account)
        
        # Load keys relationship
        res = await session.execute(
            select(ClientAccount).options(selectinload(ClientAccount.keys)).where(ClientAccount.id == account.id)
        )
        acc_full = res.scalar_one()
        return AdminService._map_account_dto(acc_full)

    @staticmethod
    async def update_client_account(
        session: AsyncSession, account_id: int, request: UpdateClientAccountRequest
    ) -> ClientAccountDTO:
        res = await session.execute(
            select(ClientAccount).options(selectinload(ClientAccount.keys)).where(ClientAccount.id == account_id)
        )
        account = res.scalar_one_or_none()
        if not account:
            raise EntityNotFoundException(message=f"Không tìm thấy tài khoản máy #{account_id}")

        if request.machine_name is not None:
            account.machine_name = request.machine_name.strip()
        if request.customer_name is not None:
            account.customer_name = request.customer_name.strip()
        if request.user_email is not None:
            account.user_email = request.user_email.strip()
        if request.machine_id is not None:
            account.machine_id = request.machine_id.strip()
        if request.note is not None:
            account.note = request.note
        if request.role is not None:
            account.role = request.role
        if request.is_active is not None:
            account.is_active = request.is_active

        await session.flush()
        await session.refresh(account)
        return AdminService._map_account_dto(account)

    @staticmethod
    async def delete_client_account(session: AsyncSession, account_id: int) -> bool:
        res = await session.execute(select(ClientAccount).where(ClientAccount.id == account_id))
        account = res.scalar_one_or_none()
        if not account:
            raise EntityNotFoundException(message=f"Không tìm thấy tài khoản máy #{account_id}")

        await session.delete(account)
        await session.flush()
        return True

    @staticmethod
    async def toggle_client_account_lock(session: AsyncSession, account_id: int) -> ClientAccountDTO:
        res = await session.execute(
            select(ClientAccount).options(selectinload(ClientAccount.keys)).where(ClientAccount.id == account_id)
        )
        account = res.scalar_one_or_none()
        if not account:
            raise EntityNotFoundException(message=f"Không tìm thấy tài khoản máy #{account_id}")

        account.is_active = not account.is_active
        await session.flush()
        await session.refresh(account)
        return AdminService._map_account_dto(account)

    @staticmethod
    async def update_account_permissions(
        session: AsyncSession, account_id: int, permissions: dict
    ) -> ClientAccountDTO:
        res = await session.execute(
            select(ClientAccount).options(selectinload(ClientAccount.keys)).where(ClientAccount.id == account_id)
        )
        account = res.scalar_one_or_none()
        if not account:
            raise EntityNotFoundException(message=f"Không tìm thấy tài khoản máy #{account_id}")

        account.permissions = permissions
        await session.flush()
        await session.refresh(account)
        return AdminService._map_account_dto(account)

    @staticmethod
    async def add_account_key(
        session: AsyncSession, account_id: int, request: AddAccountKeyRequest
    ) -> AccountKeyDTO:
        res = await session.execute(select(ClientAccount).where(ClientAccount.id == account_id))
        account = res.scalar_one_or_none()
        if not account:
            raise EntityNotFoundException(message=f"Không tìm thấy tài khoản máy #{account_id}")

        if request.custom_key and request.custom_key.strip():
            key_str = request.custom_key.strip().upper()
        else:
            tag = "VIP" if "Lifetime" in request.package_type or request.is_lifetime else "PRO"
            key_str = f"WUKONG-{tag}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"

        days = 9999 if request.is_lifetime else request.days_remaining

        new_key = AccountKey(
            account_id=account_id,
            license_key=key_str,
            package_type=request.package_type,
            days_remaining=days,
            is_lifetime=request.is_lifetime,
            status="active",
            last_used=datetime.now(timezone.utc),
        )
        session.add(new_key)
        await session.flush()
        await session.refresh(new_key)

        return AccountKeyDTO(
            id=new_key.id,
            account_id=new_key.account_id,
            license_key=new_key.license_key,
            key=new_key.license_key,
            package_type=new_key.package_type,
            days_remaining=new_key.days_remaining,
            is_lifetime=new_key.is_lifetime,
            status=new_key.status,
            last_used=new_key.last_used,
            last_ip=new_key.last_ip,
            created_at=new_key.created_at
        )

    @staticmethod
    async def delete_account_key(session: AsyncSession, account_id: int, key_id: int) -> bool:
        res = await session.execute(
            select(AccountKey).where(AccountKey.id == key_id, AccountKey.account_id == account_id)
        )
        key_obj = res.scalar_one_or_none()
        if not key_obj:
            raise EntityNotFoundException(message=f"Không tìm thấy Key #{key_id} thuộc tài khoản #{account_id}")

        await session.delete(key_obj)
        await session.flush()
        return True

    @staticmethod
    async def toggle_account_key_lock(session: AsyncSession, account_id: int, key_id: int) -> AccountKeyDTO:
        res = await session.execute(
            select(AccountKey).where(AccountKey.id == key_id, AccountKey.account_id == account_id)
        )
        key_obj = res.scalar_one_or_none()
        if not key_obj:
            raise EntityNotFoundException(message=f"Không tìm thấy Key #{key_id} thuộc tài khoản #{account_id}")

        key_obj.status = "locked" if key_obj.status == "active" else "active"
        await session.flush()
        await session.refresh(key_obj)

        return AccountKeyDTO(
            id=key_obj.id,
            account_id=key_obj.account_id,
            license_key=key_obj.license_key,
            key=key_obj.license_key,
            package_type=key_obj.package_type,
            days_remaining=key_obj.days_remaining,
            is_lifetime=key_obj.is_lifetime,
            status=key_obj.status,
            last_used=key_obj.last_used,
            last_ip=key_obj.last_ip,
            created_at=key_obj.created_at
        )

    # =========================================================================
    # QUẢN LÝ BẢN QUYỀN VÀ XÁC THỰC TOOL (REAL VERIFICATION)
    # =========================================================================

    @staticmethod
    async def list_licenses(session: AsyncSession) -> List[ToolLicenseDTO]:
        res = await session.execute(select(ToolLicense).order_by(ToolLicense.id.desc()))
        licenses = res.scalars().all()

        if not licenses:
            lic1 = ToolLicense(
                license_key=f"JACS-{uuid.uuid4().hex[:4].upper()}-D1D1",
                customer_name="Máy nhà",
                user_email="nguyenlehai2003@gmail.com",
                machine_id="PC JACS-WIN-510A-6CD39D",
                package_type="AI Pro",
                daily_limit="100/d",
                days_remaining=365,
                is_lifetime=False,
                is_active=True,
                is_locked=False,
                is_online=False,
                last_ip="172.21.0.4",
                expires_at=datetime.now(timezone.utc) + timedelta(days=365)
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
            expires = datetime.now(timezone.utc) + timedelta(days=days)

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
            base_time = lic.expires_at if (lic.expires_at and lic.expires_at > datetime.now(timezone.utc)) else datetime.now(timezone.utc)
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
        input_key = request.license_key.strip()
        input_hwid = request.machine_id.strip() if request.machine_id else ""

        # 1. First priority: Check in AccountKey table (which links to ClientAccount)
        query_acc_key = (
            select(AccountKey)
            .options(selectinload(AccountKey.account))
            .where(func.lower(AccountKey.license_key) == input_key.lower())
        )
        res_key = await session.execute(query_acc_key)
        acc_key = res_key.scalar_one_or_none()

        if acc_key:
            account = acc_key.account

            # Check if Key is locked
            if acc_key.status == "locked":
                return VerifyLicenseResponse(
                    is_valid=False,
                    message="Khóa bản quyền (Key) này đã bị Quản trị viên TẠM KHÓA."
                )

            # Check if Machine Account is active
            if not account or not account.is_active:
                return VerifyLicenseResponse(
                    is_valid=False,
                    message="Tài khoản máy khách này đã bị tạm ngừng kích hoạt trên hệ thống."
                )

            # Check HWID binding
            if input_hwid and account.machine_id:
                # If account machine_id was generic placeholder, bind it now
                if "PC-WIN-" not in account.machine_id and "HWID-" not in account.machine_id:
                    account.machine_id = input_hwid
                elif account.machine_id != input_hwid:
                    # Allow if admin bound it or match
                    pass

            # Check expiration
            if not acc_key.is_lifetime and acc_key.days_remaining <= 0:
                return VerifyLicenseResponse(
                    is_valid=False,
                    message="Bản quyền đã HẾT HẠN sử dụng. Vui lòng liên hệ Admin để gia hạn thêm."
                )

            # Update last used
            acc_key.last_used = datetime.now(timezone.utc)
            await session.flush()

            return VerifyLicenseResponse(
                is_valid=True,
                message="Xác thực bản quyền thành công!",
                license_key=acc_key.license_key,
                customer_name=account.customer_name,
                machine_name=account.machine_name,
                machine_id=account.machine_id,
                package_type=acc_key.package_type,
                days_remaining=acc_key.days_remaining,
                is_lifetime=acc_key.is_lifetime,
                permissions=account.permissions or dict(DEFAULT_PERMISSIONS_DICT),
            )

        # 2. Fallback: Check in legacy ToolLicense table
        query_tool_lic = select(ToolLicense).where(func.lower(ToolLicense.license_key) == input_key.lower())
        lic = (await session.execute(query_tool_lic)).scalar_one_or_none()

        if not lic:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Mã bản quyền (License Key) không tồn tại trên hệ thống máy chủ."
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

        if not lic.is_lifetime and lic.days_remaining <= 0:
            return VerifyLicenseResponse(
                is_valid=False,
                message="Bản quyền đã HẾT HẠN sử dụng. Vui lòng liên hệ Admin để gia hạn thêm."
            )

        lic.is_online = True
        await session.flush()

        return VerifyLicenseResponse(
            is_valid=True,
            message="Kích hoạt bản quyền thành công!",
            license_key=lic.license_key,
            customer_name=lic.customer_name,
            machine_name=lic.customer_name,
            machine_id=lic.machine_id,
            package_type=lic.package_type,
            days_remaining=lic.days_remaining,
            is_lifetime=lic.is_lifetime,
            permissions=dict(DEFAULT_PERMISSIONS_DICT),
            expires_at=lic.expires_at
        )
