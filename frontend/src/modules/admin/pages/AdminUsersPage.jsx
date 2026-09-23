import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { AdminMetricCards } from '../components/AdminMetricCards';
import { AccountMachineManager } from '../components/AccountMachineManager';
import { UserManagementTable } from '../components/UserManagementTable';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAdminStore } from '../store/adminStore';

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { addCreditsToUser } = useAdminStore();
  const [subTab, setSubTab] = useState('machines'); // 'machines' | 'system_users'
  const [selectedUserForCredit, setSelectedUserForCredit] = useState(null);
  const [creditAmount, setCreditAmount] = useState(10000);

  const handleAddCreditsSubmit = () => {
    if (selectedUserForCredit) {
      addCreditsToUser(selectedUserForCredit.id, Number(creditAmount));
      setSelectedUserForCredit(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans antialiased">
      <AdminSidebar activeTab="users" />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-5 bg-[#f8fafc]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Trị Tài Khoản & Truy Cập
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold">
                  Tài khoản & Phân quyền Tool
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản được tạo trước để quản lý tên máy và phân quyền chức năng khi vào Tool, sau đó cấp License Key tương ứng.
              </p>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-semibold">
              <button
                onClick={() => setSubTab('machines')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  subTab === 'machines'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tài khoản Máy Khách & Cấp Key
              </button>
              <button
                onClick={() => navigate('/admin/permissions')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                title="Mở ma trận phân quyền"
              >
                <span>Ma Trận Phân Quyền</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-orange-100 text-orange-700 font-bold rounded">Live</span>
              </button>
              <button
                onClick={() => navigate('/admin/licenses')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                title="Mở quản lý API Keys & Licenses"
              >
                API Keys Cổng Khách
              </button>
              <button
                onClick={() => setSubTab('system_users')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  subTab === 'system_users'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Người Dùng & Nạp Credit
              </button>
            </div>
          </div>

          <AdminMetricCards />

          {subTab === 'machines' ? (
            <AccountMachineManager />
          ) : (
            <UserManagementTable onAddCreditsClick={(u) => setSelectedUserForCredit(u)} />
          )}
        </main>
      </div>

      {/* Modal nạp credit */}
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
                className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
