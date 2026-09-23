import React from 'react';
import { KeyRound, ShieldCheck, Plus, CheckCircle, AlertTriangle, Monitor, Copy } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

export const LicenseManagerCard = ({ onOpenCreateModal }) => {
  const licenses = useAdminStore((state) => state.licenses);

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    alert(`Đã sao chép License Key: ${key}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#fafbfc]">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <KeyRound size={16} className="text-orange-500" />
            <span>Quản lý Bản quyền Máy Trạm (Licenses & HWID)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát mã kích hoạt, ràng buộc phần cứng và số ngày còn lại của khách hàng
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Tạo License mới</span>
        </button>
      </div>

      <div className="divide-y divide-gray-100 text-xs">
        {licenses.map((lic) => (
          <div
            key={lic.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-700 text-sm tracking-wider">
                  {lic.full_license_key || lic.license_key}
                </span>
                <button
                  onClick={() => handleCopy(lic.full_license_key || lic.license_key)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                  title="Sao chép"
                >
                  <Copy size={12} />
                </button>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    lic.is_active && !lic.is_locked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {lic.is_active && !lic.is_locked ? 'ACTIVE' : 'LOCKED / EXPIRED'}
                </span>
              </div>
              <p className="text-slate-500">
                Chủ sở hữu: <strong className="text-slate-800">{lic.customer_name}</strong> ({lic.user_email})
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Khóa máy (HWID): {lic.machine_id}
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[11px] text-slate-400 block">Thời hạn còn lại:</span>
              <span
                className={`text-base font-extrabold font-mono ${
                  lic.days_remaining > 10 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {lic.is_lifetime ? 'Vĩnh viễn' : `${lic.days_remaining} ngày`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicenseManagerCard;
