import React from 'react';
import { Plus, Minus, Lock, Unlock, Shield } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { useAdminStore } from '../store/adminStore';

export const UserManagementTable = ({ onAddCreditsClick }) => {
  const { users, toggleUserStatus } = useAdminStore();

  return (
    <div className="bg-[#0f1523] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0f1a]">
        <div>
          <h3 className="font-bold text-sm text-gray-100">Danh sách Người dùng Tool</h3>
          <p className="text-xs text-gray-400">Quản lý phân quyền, cấp phát credit và trạng thái tài khoản</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#080c16] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
            <tr>
              <th className="py-3 px-4">Người dùng</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Số dư Credit</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-100">{u.full_name}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{u.email}</p>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'editor' ? 'cyan' : 'default'} size="xs">
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                  {u.credit_balance.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={u.is_active ? 'success' : 'danger'} size="xs" dot>
                    {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-1 px-2 text-[11px]"
                    onClick={() => onAddCreditsClick(u)}
                  >
                    + Nạp Credit
                  </Button>
                  <Button
                    variant={u.is_active ? 'ghost' : 'success'}
                    size="sm"
                    className="py-1 px-2 text-[11px]"
                    onClick={() => toggleUserStatus(u.id)}
                  >
                    {u.is_active ? <Lock size={12} className="text-rose-400" /> : <Unlock size={12} className="text-emerald-400" />}
                  </Button>
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
