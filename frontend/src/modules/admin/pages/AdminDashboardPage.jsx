import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Sparkles, Layers, Users, KeyRound, Download } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { AdminMetricCards } from '../components/AdminMetricCards';
import { AdminJobsTable } from '../components/AdminJobsTable';
import { CreateJobModal } from '../components/CreateJobModal';
import { AccountMachineManager } from '../components/AccountMachineManager';
import { UserManagementTable } from '../components/UserManagementTable';
import { LicenseManagerCard } from '../components/LicenseManagerCard';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import useAdminStore from '../store/adminStore';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { addCreditsToUser, createLicense, fetchStats } = useAdminStore();

  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'jobs' | 'users' | 'licenses'
  const [isCreateJobOpen, setCreateJobOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for User Credits & License Creation
  const [selectedUserForCredit, setSelectedUserForCredit] = useState(null);
  const [creditAmount, setCreditAmount] = useState(10000);
  const [isLicenseModalOpen, setLicenseModalOpen] = useState(false);
  const [newLicEmail, setNewLicEmail] = useState('');
  const [newLicCustomer, setNewLicCustomer] = useState('');
  const [newLicDays, setNewLicDays] = useState(30);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleAddCreditsSubmit = () => {
    if (selectedUserForCredit) {
      addCreditsToUser(selectedUserForCredit.id, Number(creditAmount));
      setSelectedUserForCredit(null);
    }
  };

  const handleCreateLicenseSubmit = async () => {
    if (newLicEmail) {
      await createLicense({
        user_email: newLicEmail,
        customer_name: newLicCustomer || 'Khách hàng mới',
        days: Number(newLicDays),
      });
      setLicenseModalOpen(false);
      setNewLicEmail('');
      setNewLicCustomer('');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. Dark Sidebar matching MintForge Business Suite */}
      <AdminSidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* 2. Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <AdminHeader
          onSearch={(q) => setSearchQuery(q)}
          onOpenCreateJob={() => setCreateJobOpen(true)}
        />

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-5 bg-[#f8fafc]">
          {/* Page Title & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === 'users'
                    ? 'Quản Trị Tài Khoản & Phân Quyền'
                    : activeTab === 'licenses'
                    ? 'Quản Lý Bản Quyền Máy Trạm'
                    : 'Studio Sáng Tạo Hình Ảnh AI'}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold tracking-tight">
                  GPT Image 2.5 (Flare / Sunburst / 2)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {activeTab === 'users'
                  ? 'Quản lý danh sách thành viên, phân quyền hạn và cấp phát credit số dư hệ thống.'
                  : activeTab === 'licenses'
                  ? 'Kiểm soát khóa bản quyền phần cứng HWID máy trạm và thời hạn sử dụng.'
                  : 'Bấm Tạo ảnh mới để mở Studio tạo ảnh, hoặc quản lý, xem chi tiết, sửa và xóa các jobs đã tạo dưới bảng.'}
              </p>
            </div>

            {/* Right Buttons: Làm mới + Tạo ảnh mới */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={handleRefresh}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-orange-500' : ''} />
                <span>Làm mới</span>
              </button>

              <button
                onClick={() => setCreateJobOpen(true)}
                className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] active:bg-[#9a3412] text-white text-xs font-bold rounded-lg shadow-sm shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} strokeWidth={3} />
                <span>+ Tạo ảnh mới</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards Grid */}
          <AdminMetricCards />

          {/* Tab Content */}
          {activeTab === 'users' ? (
            <div className="space-y-4">
              <AccountMachineManager />
            </div>
          ) : activeTab === 'licenses' ? (
            <div className="space-y-4">
              <LicenseManagerCard onOpenCreateModal={() => setLicenseModalOpen(true)} />
            </div>
          ) : (
            /* Default: Studio Sáng Tạo Hình Ảnh AI (Table Jobs) */
            <div className="space-y-4">
              <AdminJobsTable
                externalSearchQuery={searchQuery}
                onOpenCreateModal={() => setCreateJobOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL: KHỞI TẠO TÁC VỤ ẢNH MỚI */}
      <CreateJobModal isOpen={isCreateJobOpen} onClose={() => setCreateJobOpen(false)} />

      {/* MODAL: NẠP CREDIT CHO NGƯỜI DÙNG */}
      <Modal
        isOpen={!!selectedUserForCredit}
        onClose={() => setSelectedUserForCredit(null)}
        title={`Cấp phát Credit: ${selectedUserForCredit?.full_name}`}
        subtitle={`Email: ${selectedUserForCredit?.email} • Số dư: ${selectedUserForCredit?.credit_balance?.toLocaleString()} credits`}
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
        <div className="space-y-4 font-sans text-xs">
          <Input
            label="Số lượng credit muốn cấp (+/-)"
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            helperText="Nhập số dương để cộng thêm, số âm để giảm trừ."
          />
          <div className="flex gap-2">
            {[5000, 10000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCreditAmount(amt)}
                className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: TẠO BẢN QUYỀN MÁY TRẠM MỚI */}
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
        <div className="space-y-3 font-sans text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên khách hàng:</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn A"
              value={newLicCustomer}
              onChange={(e) => setNewLicCustomer(e.target.value)}
              className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email người nhận:</label>
            <input
              type="email"
              required
              placeholder="client@gmail.com"
              value={newLicEmail}
              onChange={(e) => setNewLicEmail(e.target.value)}
              className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Số ngày bản quyền:</label>
            <input
              type="number"
              min="1"
              value={newLicDays}
              onChange={(e) => setNewLicDays(e.target.value)}
              className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
