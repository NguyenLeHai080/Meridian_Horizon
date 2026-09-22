import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { useAdminStore } from '../store/adminStore';

export const LicenseManagerCard = ({ onOpenCreateModal }) => {
  const licenses = useAdminStore((state) => state.licenses);

  return (
    <div className="bg-[#0f1523] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0f1a]">
        <div>
          <h3 className="font-bold text-sm text-gray-100 flex items-center gap-2">
            <KeyRound size={16} className="text-amber-400" />
            <span>Quản lý Bản quyền Tool Studio (License & HWID)</span>
          </h3>
          <p className="text-xs text-gray-400">Kiểm soát mã kích hoạt, ràng buộc phần cứng và số ngày còn lại</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={onOpenCreateModal}
        >
          Tạo License mới
        </Button>
      </div>

      <div className="divide-y divide-gray-800/60 text-xs">
        {licenses.map((lic) => (
          <div key={lic.id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-300 text-sm">{lic.license_key}</span>
                <Badge variant={lic.is_active ? 'success' : 'danger'} size="xs">
                  {lic.is_active ? 'ACTIVE' : 'EXPIRED'}
                </Badge>
              </div>
              <p className="text-gray-400">Người sở hữu: <strong className="text-gray-200">{lic.user_email}</strong></p>
              <p className="text-[11px] text-gray-500 font-mono">Khóa máy (HWID): {lic.machine_id}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[11px] text-gray-400 block">Thời hạn còn lại:</span>
              <span className={`text-base font-extrabold font-mono ${lic.days_remaining > 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {lic.days_remaining} ngày
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicenseManagerCard;
