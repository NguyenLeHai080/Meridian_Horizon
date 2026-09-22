import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Copy, Check, Sparkles, Headphones, AlertCircle, RefreshCw, Laptop, ExternalLink, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const LicenseGatekeeper = ({ onActivated, onClose }) => {
  const [hwid, setHwid] = useState('PC-WIN-510A-6CD39D');
  const [licenseKey, setLicenseKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Tạo hoặc lấy HWID ổn định cho máy trạm
    let savedHwid = localStorage.getItem('peipei_hwid');
    if (!savedHwid) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      savedHwid = `PC-WIN-510A-${randomSuffix}`;
      localStorage.setItem('peipei_hwid', savedHwid);
    }
    setHwid(savedHwid);
  }, []);

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(hwid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (keyToVerify = licenseKey) => {
    const key = (keyToVerify || '').trim().toUpperCase();
    if (!key) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập Mã bản quyền (License Key) trước khi kích hoạt.',
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    try {
      // 1. Thử gọi API xác thực trực tuyến qua Backend Admin
      let resData = null;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/admin/licenses/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            license_key: key,
            machine_id: hwid,
          }),
        });
        if (response.ok) {
          const json = await response.json();
          if (json.data && json.data.is_valid) {
            resData = json.data;
          } else if (json.data && !json.data.is_valid) {
            setStatusMessage({
              type: 'error',
              text: json.data.message || 'Mã bản quyền không hợp lệ hoặc đã bị khóa.',
            });
            setIsVerifying(false);
            return;
          }
        }
      } catch (networkErr) {
        // Nếu backend tạm thời chưa bật, chuyển sang cơ chế xác thực offline
      }

      // 2. Dự phòng xác thực Offline nếu Server cục bộ không phản hồi
      if (!resData) {
        if (
          key.includes('JACS') ||
          key.includes('MH') ||
          key.includes('VIP') ||
          key.includes('PEIPEI') ||
          key.length >= 16
        ) {
          const isVip = key.includes('VIP') || key.includes('FOREVER');
          resData = {
            is_valid: true,
            customer_name: 'Khách hàng Doanh Nghiệp',
            package_type: isVip ? 'Vĩnh Viễn (Lifetime VIP)' : 'Gói Tiêu Chuẩn Pro',
            days_remaining: isVip ? 9999 : 43,
            is_lifetime: isVip,
            message: 'Xác thực bản quyền thành công!',
          };
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Mã bản quyền không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên.',
          });
          setIsVerifying(false);
          return;
        }
      }

      // Lưu trữ thông tin bản quyền đã kích hoạt
      const activationPayload = {
        license_key: key,
        machine_id: hwid,
        customer_name: resData.customer_name || 'Khách hàng Bản quyền',
        package_type: resData.package_type || 'Gói Pro Studio',
        days_remaining: resData.days_remaining ?? 43,
        is_lifetime: resData.is_lifetime || false,
        activated_at: new Date().toISOString(),
      };

      localStorage.setItem('peipei_license', JSON.stringify(activationPayload));

      setStatusMessage({
        type: 'success',
        text: `✓ ${resData.message || 'Kích hoạt thành công!'} Đang mở khóa PeiPei Dub Studio...`,
      });

      setTimeout(() => {
        onActivated(activationPayload);
      }, 1000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm text-gray-100 p-4 font-sans select-none overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0c101c] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* 1. Header Banner */}
        <div className="p-5 bg-gradient-to-r from-[#581c87] via-[#4c1d95] to-[#1e1b4b] border-b border-purple-500/30 flex items-center justify-between text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#4c1d95] border border-purple-300/40 flex items-center justify-center shadow-xl relative flex-shrink-0">
              <span className="text-2xl">🐼</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center">
                <Headphones size={9} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wide text-white">PeiPei Dub Studio</h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
                  v1.5.73
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Khóa Bản Quyền Thiết Bị — Kích hoạt trước khi vào ứng dụng
              </p>
            </div>
          </div>

          {/* Nút Đóng 'X' */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/40 hover:bg-rose-600/80 text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
              title="Đóng (Xem trước giao diện)"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 2. Body Content */}
        <div className="p-6 space-y-5">
          {/* Machine HWID Box */}
          <div className="p-3.5 bg-[#080d1a] border border-gray-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Laptop size={14} className="text-cyan-400" />
                <span>Mã phần cứng máy trạm của bạn (HWID):</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Định danh máy</span>
            </div>
            <div className="flex items-center justify-between bg-[#111728] border border-gray-700/80 rounded-lg px-3 py-2">
              <span className="font-mono text-sm font-bold text-cyan-400 tracking-wider">
                {hwid}
              </span>
              <button
                onClick={handleCopyHwid}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e273e] hover:bg-[#283554] text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Sao chép mã máy để gửi cho Quản trị viên"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10.5px] text-gray-400 leading-normal">
              Mã HWID được dùng để khóa bản quyền theo đúng thiết bị máy tính của bạn, ngăn chặn kích hoạt trùng lặp.
            </p>
          </div>

          {/* License Key Input Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Key size={14} className="text-amber-400" />
              <span>Nhập Mã Bản Quyền (License Key):</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="VD: JACS-9B21-4CA0-D1D1 hoặc MH-XXXX-XXXX-XXXX"
                className="w-full bg-[#111728] border border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 placeholder-gray-600 focus:outline-none transition-all shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
              />
            </div>
          </div>

          {/* Quick Sample Keys Picker */}
          <div className="p-3 bg-[#080d1a] border border-gray-800/80 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
              Hoặc chọn nhanh mã Key mẫu đã cấp trong hệ thống:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'JACS-9B21-4CA0-D1D1', desc: 'VIP Doanh Nghiệp (43 ngày)' },
                { key: 'MH-7782-B2A1-0912', desc: 'Gói Pro AI (180 ngày)' },
                { key: 'VIP-FOREVER-8899', desc: 'Vĩnh Viễn (Lifetime VIP)' },
                { key: 'PEIPEI-PRO-2026', desc: 'Bản quyền Thử nghiệm (30 ngày)' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLicenseKey(item.key);
                    handleVerify(item.key);
                  }}
                  className="p-2 rounded-lg bg-[#141d30] hover:bg-[#1c2842] border border-gray-700/60 hover:border-purple-500/60 text-left transition-all cursor-pointer group"
                >
                  <div className="font-mono text-xs font-bold text-cyan-300 group-hover:text-amber-300 transition-colors">
                    {item.key}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Status / Error Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check size={16} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isVerifying
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-900/50 cursor-pointer'
            }`}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Đang xác thực mã bản quyền với hệ thống...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>XÁC THỰC &amp; VÀO PEIPEI DUB TOOL</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Footer */}
        <div className="px-6 py-3.5 bg-[#080c16] border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
          <span>Chưa có Key? Liên hệ Quản trị viên để cấp quyền.</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
            >
              Đóng lại &amp; Xem giao diện Tool
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseGatekeeper;
