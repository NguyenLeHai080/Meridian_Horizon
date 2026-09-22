import React from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { UserManagementTable } from '../components/UserManagementTable';
import { useAdminStore } from '../store/adminStore';

export const AdminUsersPage = () => {
  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-12 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-6 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-100 text-sm">Quản lý Tài khoản & Phân quyền</span>
        </header>
        <main className="flex-1 overflow-y-auto scrollable-body p-6">
          <UserManagementTable onAddCreditsClick={(u) => alert(`Nạp credit cho ${u.email}`)} />
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;
