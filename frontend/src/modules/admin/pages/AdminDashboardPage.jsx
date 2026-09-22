import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, CreditCard, Tv, LogOut, Download } from 'lucide-react';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminStatsGrid } from '../components/AdminStatsGrid';
import { UserManagementTable } from '../components/UserManagementTable';
import { LicenseManagerCard } from '../components/LicenseManagerCard';
import { useAdminStore } from '../store/adminStore';
import useAuthStore from '@/modules/auth/store/authStore';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addCreditsToUser, createLicense } = useAdminStore();

  // Modals
  const [selectedUserForCredit, setSelectedUserForCredit] = useState(null);
  const [creditAmount, setCreditAmount] = useState(10000);
  const [isLicenseModalOpen, setLicenseModalOpen] = useState(false);
  const [newLicEmail, setNewLicEmail] = useState('');
  const [newLicDays, setNewLicDays] = useState(43);

  const handleAddCreditsSubmit = () => {
    if (selectedUserForCredit) {
      addCreditsToUser(selectedUserForCredit.id, Number(creditAmount));
      setSelectedUserForCredit(null);
    }
  };

  const handleCreateLicenseSubmit = async () => {
    if (newLicEmail) {
      await createLicense(newLicEmail, Number(newLicDays));
      setLicenseModalOpen(false);
      setNewLicEmail('');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans">
      {/* 1. Admin Sidebar */}
      <AdminSidebar />

      {/* 2. Main Admin Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Admin Header */}
        <header className="h-12 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-6 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-100 text-sm">Trung tâm Quản trị Tool Studio</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
              CLUSTER ONLINE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/downloads')}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded text-xs font-semibold transition-all"
            >
              <Download size={13} />
              <span>Tải Tool Desktop (Win/macOS)</span>
            </button>

            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <span className="text-gray-300 font-medium">{user?.email || 'admin@meridian.vn'}</span>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-gray-800"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6">
          {/* Key Metrics Grid */}
          <AdminStatsGrid />

          {/* User Management Section */}
          <UserManagementTable onAddCreditsClick={(u) => setSelectedUserForCredit(u)} />

          {/* Tool License Management Section */}
          <LicenseManagerCard onOpenCreateModal={() => setLicenseModalOpen(true)} />
        </main>
      </div>

      {/* MODAL 1: NẠP CREDIT CHO NGƯỜI DÙNG (SHARED REUSABLE MODAL) */}
      <Modal
        isOpen={!!selectedUserForCredit}
        onClose={() => setSelectedUserForCredit(null)}
        title={`Cấp phát Credit cho: ${selectedUserForCredit?.full_name}`}
        subtitle={`Email: ${selectedUserForCredit?.email} • Số dư hiện tại: ${selectedUserForCredit?.credit_balance?.toLocaleString()} credits`}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedUserForCredit(null)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddCreditsSubmit}>
              Xác nhận cấp Credit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Số lượng credit muốn cấp (+/-)"
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            helperText="Nhập số dương để cộng thêm (ví dụ: 10000, 50000), số âm để giảm trừ."
          />
          <div className="flex gap-2">
            {[5000, 10000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCreditAmount(amt)}
                className="flex-1 py-1.5 text-xs font-semibold bg-[#162136] hover:bg-[#202f4d] border border-gray-700 text-gray-200 rounded"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: TẠO BẢN QUYỀN TOOL MỚI (SHARED REUSABLE MODAL) */}
      <Modal
        isOpen={isLicenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        title="Cấp phát Bản quyền Tool Studio mới"
        subtitle="Hệ thống sẽ tự động sinh mã bản quyền chuẩn và kích hoạt cho người dùng"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLicenseModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="success" size="sm" onClick={handleCreateLicenseSubmit}>
              Tạo License
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email người nhận bản quyền"
            type="email"
            placeholder="client@studio.com"
            value={newLicEmail}
            onChange={(e) => setNewLicEmail(e.target.value)}
            required
          />
          <Input
            label="Số ngày hiệu lực"
            type="number"
            value={newLicDays}
            onChange={(e) => setNewLicDays(e.target.value)}
          />
          <p className="text-[11px] text-gray-500">
            * Khóa máy tính (HWID) sẽ tự động liên kết khi khách hàng kích hoạt lần đầu trong ứng dụng.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
