import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  X,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  CreditCard,
  QrCode
} from 'lucide-react';
import useAdminStore from '@/modules/admin/store/adminStore';

export const LicenseGatekeeper = ({ onActivated, onClose, asModal = false }) => {
  const [hwid, setHwid] = useState('PC-WIN-510A-6CD39D');
  const [licenseKey, setLicenseKey] = useState('');
  const [saveKey, setSaveKey] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  useEffect(() => {
    // Lấy HWID máy tính
    let savedHwid = localStorage.getItem('peipei_hwid');
    if (!savedHwid) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      savedHwid = `PC-WIN-510A-${randomSuffix}`;
      localStorage.setItem('peipei_hwid', savedHwid);
    }
    setHwid(savedHwid);

    // Kiểm tra xem trước đó đã lưu key chưa
    try {
      const savedLic = localStorage.getItem('peipei_license') || localStorage.getItem('wukong_license');
      if (savedLic) {
        const parsed = JSON.parse(savedLic);
        if (parsed?.license_key) {
          setLicenseKey(parsed.license_key);
        }
      }
    } catch (e) {}
  }, []);

  const handleVerify = async (keyToVerify = licenseKey) => {
    const key = (keyToVerify || '').trim().toUpperCase();
    if (!key) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập license key trước khi kích hoạt.',
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    try {
      // 1. Thử gọi backend API nếu có kết nối
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
        // Dự phòng offline
      }

      // 2. Tra cứu Key theo Tài khoản & Phân quyền quản trị
      if (!resData) {
        const localVerify = useAdminStore.getState().verifyLicenseKey(key, hwid);
        if (localVerify.is_valid) {
          resData = localVerify;
        } else {
          setStatusMessage({
            type: 'error',
            text: localVerify.message || 'Mã license không hợp lệ hoặc đã bị khóa.',
          });
          setIsVerifying(false);
          return;
        }
      }

      const activationPayload = {
        license_key: key,
        machine_id: hwid,
        machine_name: resData.machine_name || 'Máy Trạm Khách Hàng',
        customer_name: resData.customer_name || 'Khách hàng Wukong Pro',
        package_type: resData.package_type || 'Wukong Video Pro',
        days_remaining: resData.days_remaining ?? 365,
        is_lifetime: resData.is_lifetime || false,
        permissions: resData.permissions || null,
        activated_at: new Date().toISOString(),
      };

      if (saveKey) {
        localStorage.setItem('peipei_license', JSON.stringify(activationPayload));
        localStorage.setItem('wukong_license', JSON.stringify(activationPayload));
        if (resData.permissions) {
          localStorage.setItem('wukong_permissions', JSON.stringify(resData.permissions));
        }
      }

      // Gửi tín hiệu sang Electron nếu chạy desktop client
      if (window.electronAPI && window.electronAPI.activateSuccess) {
        try {
          window.electronAPI.activateSuccess(activationPayload);
        } catch (e) {}
      }

      setStatusMessage({
        type: 'success',
        text: '✓ Kích hoạt thành công! Đang chuyển vào giao diện làm việc...',
      });

      setTimeout(() => {
        if (onActivated) {
          onActivated(activationPayload);
        }
        if (onClose) {
          onClose();
        }
      }, 700);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseWindow = () => {
    if (window.electronAPI && window.electronAPI.close) {
      window.electronAPI.close();
    } else if (onClose) {
      onClose();
    }
  };

  const handleMinimizeWindow = () => {
    if (window.electronAPI && window.electronAPI.minimize) {
      window.electronAPI.minimize();
    }
  };

  return (
    <div
      className={`w-full ${
        asModal ? 'p-2' : 'h-screen min-h-screen bg-[#0d1017]'
      } text-gray-100 flex flex-col justify-between font-sans select-none relative overflow-hidden`}
    >
      {/* 1. macOS Style Header Bar */}
      {!asModal && (
        <header className="h-9 px-3 flex items-center justify-between border-b border-white/[0.04] bg-[#0d1017] select-none z-20">
          {/* Traffic Lights Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseWindow}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 active:brightness-90 transition-all cursor-pointer shadow-sm"
              title="Đóng cửa sổ"
            />
            <button
              onClick={handleMinimizeWindow}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 active:brightness-90 transition-all cursor-pointer shadow-sm"
              title="Thu nhỏ"
            />
            <button
              onClick={() => {}}
              className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 active:brightness-90 transition-all cursor-pointer shadow-sm"
              title="Toàn màn hình"
            />
          </div>

          {/* Centered Window Title */}
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Wukong Video Pro
            </span>
          </div>

          <div className="w-10" />
        </header>
      )}

      {/* 2. Main Centered Activation Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[440px] bg-[#161b26] border border-[#273043] rounded-2xl p-7 shadow-2xl relative">
          {/* Modal Close button if rendered as modal inside studio */}
          {asModal && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Glowing Flame Badge Icon */}
          <div className="flex justify-center mb-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1c2334] border border-[#2d3a54] flex items-center justify-center shadow-lg relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-sm group-hover:bg-blue-500/20 transition-all" />
              {/* Stylized 3-Petal Lotus Flame SVG (Cyan/Blue & Gold) */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]"
              >
                <defs>
                  <linearGradient id="center-gold-grad" x1="12" y1="3" x2="12" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE047" />
                    <stop offset="0.6" stopColor="#EAB308" />
                    <stop offset="1" stopColor="#CA8A04" />
                  </linearGradient>
                  <linearGradient id="wing-blue-grad" x1="6" y1="7" x2="18" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="0.65" stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                {/* Center flame leaf */}
                <path
                  d="M12 3C10.5 7.2 9.4 9.8 9.4 12.8C9.4 15.8 10.6 18.2 12 19.2C13.4 18.2 14.6 15.8 14.6 12.8C14.6 9.8 13.5 7.2 12 3Z"
                  fill="url(#center-gold-grad)"
                />
                {/* Left wing leaf */}
                <path
                  d="M7.5 7.8C5.8 10.8 5.4 13.5 5.8 16C6.4 18.2 7.8 19.2 9.4 19.2C8.3 17.2 7.8 15.2 8.4 12.5C8.7 11 9.4 9.5 10.4 8.5C9 8 8.1 7.8 7.5 7.8Z"
                  fill="url(#wing-blue-grad)"
                />
                {/* Right wing leaf */}
                <path
                  d="M16.5 7.8C18.2 10.8 18.6 13.5 18.2 16C17.6 18.2 16.2 19.2 14.6 19.2C15.7 17.2 16.2 15.2 15.6 12.5C15.3 11 14.6 9.5 13.6 8.5C15 8 15.9 7.8 16.5 7.8Z"
                  fill="url(#wing-blue-grad)"
                />
              </svg>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <h2 className="text-white font-bold text-[17px] text-center tracking-tight">
            Kích hoạt bản quyền
          </h2>
          <p className="text-slate-400 text-xs text-center mt-1.5 mb-5 leading-normal">
            Nhập license key được cấp để bắt đầu sử dụng Wukong Video Pro.
          </p>

          {/* License Key Input */}
          <div className="space-y-1">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              placeholder="WUKONG-XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-[#111622] border border-[#2c374e] focus:border-[#4f6ef7] focus:ring-1 focus:ring-[#4f6ef7] rounded-lg px-3.5 py-2.5 text-xs text-center font-mono tracking-widest text-slate-100 placeholder-slate-500 uppercase focus:outline-none transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
          </div>

          {/* Checkbox "Lưu mã cho lần đăng nhập sau" */}
          <div className="flex items-center justify-center gap-2 mt-3.5 mb-4">
            <input
              type="checkbox"
              id="save-license-chk"
              checked={saveKey}
              onChange={(e) => setSaveKey(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#111622] border-[#2c374e] accent-[#4f6ef7] cursor-pointer"
            />
            <label
              htmlFor="save-license-chk"
              className="text-slate-400 text-[11.5px] cursor-pointer select-none"
            >
              Lưu mã cho lần đăng nhập sau (không cần gõ lại)
            </label>
          </div>

          {/* Status Message Feedback */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 mb-3.5 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Primary Button "Kích hoạt" */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="w-full bg-[#4f6ef7] hover:bg-[#4360e8] active:bg-[#3852d4] text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang xác minh...</span>
              </>
            ) : (
              <span>Kích hoạt</span>
            )}
          </button>

          {/* Secondary Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center justify-center gap-1.5 bg-[#1d2437] hover:bg-[#252f48] text-slate-300 hover:text-white border border-[#2b364e] text-[11.5px] font-medium py-2.5 px-2 rounded-lg transition-all cursor-pointer"
            >
              <span>🛒</span>
              <span>Xem bảng giá / Mua gói</span>
            </button>
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center justify-center bg-[#1d2437] hover:bg-[#252f48] text-slate-300 hover:text-white border border-[#2b364e] text-[11.5px] font-medium py-2.5 px-2 rounded-lg transition-all cursor-pointer"
            >
              <span>Liên hệ hỗ trợ</span>
            </button>
          </div>

          {/* Footer Card Text */}
          <p className="text-slate-500 text-[10.5px] text-center leading-relaxed mt-4 px-1">
            Hotline/Zalo: 0914779977. License đã mua vẫn được giữ trên máy; màn hình này chỉ dùng để kích hoạt/xác minh lại khi cần.
          </p>

          {/* Quick Trial Helper for Dev / Testing */}
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-mono">HWID: {hwid.slice(0, 15)}...</span>
            <button
              onClick={() => {
                setLicenseKey('WUKONG-VIP9-8888-9999-PRO1');
              }}
              className="text-blue-400/80 hover:text-blue-300 transition-colors cursor-pointer"
            >
              + Dùng key thử
            </button>
          </div>
        </div>
      </main>

      {/* 3. Empty bottom bar to balance header */}
      {!asModal && <div className="h-6" />}

      {/* ========================================================= */}
      {/* POPUP 1: MODAL BẢNG GIÁ & MUA GÓI */}
      {/* ========================================================= */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#161c28] border border-[#2d384e] rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <h3 className="text-base font-bold text-white">Bảng Giá Bản Quyền Wukong Video Pro</h3>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-4">
              Phần mềm được kích hoạt theo mã phần cứng thiết bị (HWID). Đảm bảo bản quyền vĩnh viễn và cập nhật miễn phí.
            </p>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Gói 1 Tháng */}
              <div className="p-3 bg-[#111622] rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                    Cơ bản
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">Gói 1 Tháng</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dùng thử trải nghiệm</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="text-sm font-bold text-blue-400">399.000 đ</div>
                  <span className="text-[10px] text-slate-500">/ 30 ngày</span>
                </div>
              </div>

              {/* Gói 1 Năm - Highlighted */}
              <div className="p-3 bg-[#131c30] rounded-xl border border-blue-500/50 flex flex-col justify-between relative shadow-lg shadow-blue-500/10">
                <span className="absolute -top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  Phổ biến nhất
                </span>
                <div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                    Tiết kiệm
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">Gói 1 Năm</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sản xuất video thường xuyên</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="text-sm font-bold text-blue-400">1.299.000 đ</div>
                  <span className="text-[10px] text-slate-500">/ 365 ngày</span>
                </div>
              </div>

              {/* Gói Vĩnh Viễn */}
              <div className="p-3 bg-[#111622] rounded-xl border border-amber-500/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    VIP Trọn đời
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">Gói Vĩnh Viễn</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Update tính năng trọn đời</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="text-sm font-bold text-amber-400">2.499.000 đ</div>
                  <span className="text-[10px] text-slate-500">Không giới hạn</span>
                </div>
              </div>
            </div>

            {/* Thông tin chuyển khoản & Hotline */}
            <div className="p-3 bg-[#111622] rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hotline / Zalo kích hoạt ngay:</span>
                <a
                  href="https://zalo.me/0914779977"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PhoneCall size={12} />
                  0914.779.977
                </a>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-semibold">MB Bank - 0914779977</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-semibold">WUKONG STUDIO</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Nội dung CK:</span>
                <span className="font-mono text-cyan-300 font-bold">{hwid.slice(-8)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPricingModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <a
                href="https://zalo.me/0914779977"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#4f6ef7] hover:bg-[#4360e8] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Nhắn Zalo Mua Gói</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP 2: MODAL LIÊN HỆ HỖ TRỢ */}
      {/* ========================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161c28] border border-[#2d384e] rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Trung Tâm Hỗ Trợ Kỹ Thuật</h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3.5 bg-[#111622] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hotline / Zalo hỗ trợ:</span>
                  <a
                    href="https://zalo.me/0914779977"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-400 hover:underline flex items-center gap-1 text-sm font-mono"
                  >
                    0914.779.977
                  </a>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Thời gian hỗ trợ: <strong>8h00 - 23h30</strong> tất cả các ngày trong tuần (kể cả Thứ 7, Chủ Nhật và ngày Lễ).
                </p>
              </div>

              {/* HWID copy card for quick support */}
              <div className="p-3.5 bg-[#111622] rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Mã máy tính của bạn (HWID):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(hwid);
                      setCopiedHwid(true);
                      setTimeout(() => setCopiedHwid(false), 2000);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedHwid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedHwid ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <div className="font-mono text-cyan-300 text-xs font-bold tracking-wider bg-black/40 p-2 rounded border border-slate-800">
                  {hwid}
                </div>
                <p className="text-[10.5px] text-slate-500">
                  Gửi mã này qua Zalo để nhân viên cấp lại key khi bạn đổi máy tính hoặc cài lại Windows.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <a
                href="https://zalo.me/0914779977"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#4f6ef7] hover:bg-[#4360e8] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Mở Zalo 0914.779.977</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseGatekeeper;
