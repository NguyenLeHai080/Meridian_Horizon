import React from 'react';
import { Plus, Minus, Lock, Unlock, Shield, Users } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { useAdminStore } from '../store/adminStore';

export const UserManagementTable = ({ onAddCreditsClick }) => {
  const { users, toggleUserStatus } = useAdminStore();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#fafbfc]">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users size={16} className="text-orange-500" />
            <span>Danh sách Tài khoản Người dùng</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý phân quyền, cấp phát credit và kích hoạt tài khoản khách hàng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#f8fafc] text-slate-500 uppercase text-[10.5px] font-bold tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Người dùng</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Số dư Credit</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác Quản trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{u.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : u.role === 'editor'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                  {u.credit_balance.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      u.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        u.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => onAddCreditsClick(u)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg transition-colors cursor-pointer"
                  >
                    + Nạp Credit
                  </button>
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      u.is_active
                        ? 'bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 border-gray-200 hover:border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                    }`}
                    title={u.is_active ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                  >
                    {u.is_active ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;
