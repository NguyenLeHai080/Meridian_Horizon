import React from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { LicenseManagerCard } from '../components/LicenseManagerCard';

export const AdminLicensesPage = () => {
  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-12 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-6 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-100 text-sm">Quản lý Bản quyền Tool Studio</span>
        </header>
        <main className="flex-1 overflow-y-auto scrollable-body p-6">
          <LicenseManagerCard onOpenCreateModal={() => alert('Mở form tạo bản quyền mới')} />
        </main>
      </div>
    </div>
  );
};

export default AdminLicensesPage;
