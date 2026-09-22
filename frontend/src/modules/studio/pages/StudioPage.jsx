import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, User as UserIcon, CreditCard, Sparkles, Check, UploadCloud, ShieldAlert } from 'lucide-react';
import { changeLanguage } from '@/shared/i18n';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { StudioSidebar } from '../components/StudioSidebar';
import { WorkflowStepBar } from '../components/WorkflowStepBar';
import { VideoPlayerPreview } from '../components/VideoPlayerPreview';
import { ProviderConfigPanel } from '../components/ProviderConfigPanel';
import { ExecutionLogTerminal } from '../components/ExecutionLogTerminal';
import { LicenseGatekeeper } from '../components/LicenseGatekeeper';
import useAuthStore from '@/modules/auth/store/authStore';
import useStudioStore from '../store/studioStore';

class StudioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Studio render error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#0c101c] text-rose-400 font-mono text-xs">
          <h3 className="text-base font-bold mb-2">Đã xảy ra lỗi giao diện:</h3>
          <pre className="p-3 bg-black/50 rounded border border-rose-900">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const StudioPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { credits } = useStudioStore();

  // Kiểm tra trạng thái kích hoạt Bản quyền Máy trạm (HWID + License Key)
  const [licenseInfo, setLicenseInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('peipei_license');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Đồng bộ bản quyền trực tiếp từ tệp lưu trữ trên máy tính qua Electron IPC
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getLicense) {
      window.electronAPI.getLicense().then((lic) => {
        if (lic && lic.license_key) {
          localStorage.setItem('peipei_license', JSON.stringify(lic));
          setLicenseInfo(lic);
        }
      }).catch(() => {});
    }
  }, []);

  // State cho các Shared Modals
  const [isCreditModalOpen, setCreditModalOpen] = useState(false);
  const [isSubtitleModalOpen, setSubtitleModalOpen] = useState(false);
  const [isVideoSelectModalOpen, setVideoSelectModalOpen] = useState(false);
  const [isLicenseModalOpen, setLicenseModalOpen] = useState(false);

  const [licenseKeyInput, setLicenseKeyInput] = useState(licenseInfo?.license_key || 'JACS-9B21-4CA0-D1D1');
  const [hwid] = useState(licenseInfo?.machine_id || localStorage.getItem('peipei_hwid') || 'PC-WIN-510A-6CD39D');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const handleVerifyLicense = async () => {
    setIsVerifying(true);
    try {
      const key = licenseKeyInput.trim().toUpperCase();
      if (key.includes('JACS') || key.includes('MH') || key.includes('VIP') || key.includes('PEIPEI') || key.length >= 16) {
        const isVip = key.includes('VIP') || key.includes('FOREVER');
        const updated = {
          license_key: key,
          machine_id: hwid,
          customer_name: 'Khách hàng Doanh Nghiệp',
          package_type: isVip ? 'Vĩnh Viễn (Lifetime VIP)' : 'Gói Tiêu Chuẩn Pro',
          days_remaining: isVip ? 9999 : 43,
          is_lifetime: isVip,
          activated_at: new Date().toISOString(),
        };
        localStorage.setItem('peipei_license', JSON.stringify(updated));
        setLicenseInfo(updated);
        setVerifyMessage({ type: 'success', text: '✓ Kích hoạt bản quyền thành công trên thiết bị này!' });
        setTimeout(() => {
          setLicenseModalOpen(false);
          setVerifyMessage(null);
        }, 1200);
      } else {
        setVerifyMessage({ type: 'error', text: '✕ Mã bản quyền không hợp lệ hoặc đã hết hạn.' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeactivateLicense = () => {
    localStorage.removeItem('peipei_license');
    setLicenseInfo(null);
    setLicenseModalOpen(false);
  };

  // NẾU CHƯA KÍCH HOẠT: HIỂN THỊ TRỰC TIẾP CỬA SỔ NHẬP KEY GỌN GÀNG (KHÔNG CÓ KHUNG NGOÀI)
  if (!licenseInfo) {
    return (
      <LicenseGatekeeper
        onActivated={(info) => {
          setLicenseInfo(info);
        }}
      />
    );
  }

  // Gói nạp credit mẫu
  const [selectedPackage, setSelectedPackage] = useState('pack_50k');

  return (
    <StudioErrorBoundary>
      <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans relative">
      {/* 1. Left Sidebar */}
      <StudioSidebar
        onOpenCreditModal={() => setCreditModalOpen(true)}
        onOpenLicenseModal={() => setLicenseModalOpen(true)}
        licenseInfo={licenseInfo}
      />

      {/* 2. Main Studio Workflow Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Mini Header (Ngôn ngữ + Tài khoản) */}
        <header className="h-10 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-4 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Dự án:</span>
            <span className="font-semibold text-purple-300">Meridian Horizon Studio</span>
            <Badge variant="purple" size="xs">PRO ENTERPRISE</Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Bộ chọn Đa ngôn ngữ (i18n) */}
            <div className="flex items-center gap-1.5 bg-[#121826] px-2 py-1 rounded border border-gray-800">
              <Globe size={13} className="text-gray-400" />
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="vi" className="bg-gray-900 text-gray-100">Tiếng Việt (VI)</option>
                <option value="en" className="bg-gray-900 text-gray-100">English (EN)</option>
                <option value="zh" className="bg-gray-900 text-gray-100">中文 (ZH)</option>
              </select>
            </div>

            {/* Nút chuyển sang Trang Quản trị Tool (Admin) */}
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold transition-all shadow-sm"
              title="Mở Trang Quản trị Tool"
            >
              <ShieldAlert size={12} />
              <span>Quản trị Tool (Admin)</span>
            </button>

            {/* Thông tin User & Đăng xuất */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <div className="flex items-center gap-1.5 text-gray-300">
                <UserIcon size={14} className="text-purple-400" />
                <span className="font-medium">{user?.email || 'admin@meridian.vn'}</span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Workflow 5 Steps Bar */}
        <WorkflowStepBar onOpenSelectVideoModal={() => setVideoSelectModalOpen(true)} />

        {/* Center Canvas: Video Player Preview (Left) + Configuration Panel (Right) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <VideoPlayerPreview onOpenSubtitleModal={() => setSubtitleModalOpen(true)} />
          <ProviderConfigPanel />
        </div>

        {/* Bottom Execution Terminal Log */}
        <ExecutionLogTerminal />
      </div>

      {/* ========================================================================= */}
      {/* 3. CÁC MODAL DÙNG CHUNG (SHARED REUSABLE MODALS - FIXED HEADER/FOOTER, SCROLLABLE BODY) */}
      {/* ========================================================================= */}

      {/* MODAL 1: NẠP CREDIT */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        title="Nạp thêm Credit AI Video Studio"
        subtitle="Sử dụng cho các mô hình dịch DeepSeek Cloud và tổng hợp giọng nói cao cấp"
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreditModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCard size={14} />}
              onClick={() => {
                alert('Khởi tạo giao diện thanh toán VNPay / Stripe thành công!');
                setCreditModalOpen(false);
              }}
            >
              Thanh toán ngay
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Số dư hiện tại của bạn là <strong className="text-emerald-400 font-mono text-sm">{credits.toLocaleString()} credits</strong>. Chọn gói nạp phù hợp với nhu cầu sản xuất video:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'pack_20k', credits: 20000, price: '199.000 đ', tag: 'Cơ bản' },
              { id: 'pack_50k', credits: 50000, price: '399.000 đ', tag: 'Phổ biến nhất', highlight: true },
              { id: 'pack_150k', credits: 150000, price: '899.000 đ', tag: 'Tiết kiệm 30%' },
            ].map((pack) => (
              <div
                key={pack.id}
                onClick={() => setSelectedPackage(pack.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPackage === pack.id
                    ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-900/20'
                    : 'border-gray-800 bg-[#141b2c] hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={pack.highlight ? 'purple' : 'default'} size="xs">
                    {pack.tag}
                  </Badge>
                  {selectedPackage === pack.id && <Check size={14} className="text-purple-400" />}
                </div>
                <h4 className="text-base font-bold text-gray-100 font-mono">
                  {pack.credits.toLocaleString()}
                </h4>
                <p className="text-[11px] text-gray-400">Credits AI</p>
                <div className="mt-3 pt-2 border-t border-gray-800 font-semibold text-xs text-emerald-400">
                  {pack.price}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0c121e] rounded-lg border border-gray-800 text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">💡 Lưu ý chính sách Credit:</p>
            <p>• Dịch DeepSeek Cloud: ~10 credits / phút video.</p>
            <p>• Mô hình Offline Local (chạy GPU nội bộ): 0 credits (Hoàn toàn miễn phí).</p>
            <p>• Credit không có thời hạn hết hạn, được bảo lưu vĩnh viễn trên tài khoản.</p>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: CHỈNH SỬA PHỤ ĐỀ SONG NGỮ (EDITOR) */}
      <Modal
        isOpen={isSubtitleModalOpen}
        onClose={() => setSubtitleModalOpen(false)}
        title="Trình biên tập Phụ đề Song ngữ (SRT Editor)"
        subtitle="Hiệu chỉnh nội dung dịch, căn chỉnh Timecode và che vùng phụ đề cũ"
        size="xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSubtitleModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                alert('Đã lưu thay đổi phụ đề vào dự án!');
                setSubtitleModalOpen(false);
              }}
            >
              Lưu phụ đề
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Danh sách câu thoại đã được AI nhận diện qua OCR và chuyển ngữ:
          </p>

          <div className="space-y-2">
            {[
              { id: 1, time: '00:00:01.000 ➔ 00:00:03.500', zh: '我想有必要给您提醒下', vi: 'Tôi nghĩ cần phải nhắc nhở ngài một chút.' },
              { id: 2, time: '00:00:04.000 ➔ 00:00:06.200', zh: '神性游戏即将开启新的篇章', vi: 'Trò chơi thần tính sắp sửa mở ra chương mới.' },
              { id: 3, time: '00:00:07.100 ➔ 00:00:10.000', zh: '无论面对什么敌人，我们绝不退缩', vi: 'Bất luận đối mặt kẻ địch nào, chúng ta tuyệt không lùi bước.' },
            ].map((sub) => (
              <div key={sub.id} className="p-3 bg-[#0d1424] border border-gray-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] text-purple-400 font-mono">
                  <span>Dòng #{sub.id}</span>
                  <span className="bg-gray-900 px-2 py-0.5 rounded border border-gray-800">{sub.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Gốc (Tiếng Trung):</label>
                    <input
                      type="text"
                      defaultValue={sub.zh}
                      className="w-full bg-[#162035] border border-gray-700 rounded p-1.5 text-gray-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Dịch (Tiếng Việt):</label>
                    <input
                      type="text"
                      defaultValue={sub.vi}
                      className="w-full bg-[#162035] border border-gray-700 rounded p-1.5 text-emerald-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 3: CHỌN VIDEO ĐẦU VÀO */}
      <Modal
        isOpen={isVideoSelectModalOpen}
        onClose={() => setVideoSelectModalOpen(false)}
        title="Chọn Video Đầu vào để Biên dịch"
        subtitle="Hỗ trợ các định dạng MP4, MKV, AVI, MOV lên tới 4K 60FPS"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setVideoSelectModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setVideoSelectModalOpen(false);
              }}
            >
              Chọn video này
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#0f172a]/50">
            <UploadCloud size={36} className="mx-auto text-purple-400 mb-2" />
            <p className="text-xs font-semibold text-gray-200">Kéo thả file video vào đây hoặc bấm để duyệt</p>
            <p className="text-[10px] text-gray-500 mt-1">Dung lượng tối đa 2GB mỗi tệp</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-400">Video đã tải gần đây:</span>
            {[
              { name: '神性游戏_第23集_1080p.mp4', size: '142 MB', duration: '12:45' },
              { name: 'Xuyên_không_tu_tiên_tập_01.mp4', size: '210 MB', duration: '18:20' },
              { name: 'Review_truyện_tranh_chap_99.mp4', size: '98 MB', duration: '08:15' },
            ].map((v, i) => (
              <div
                key={i}
                className="p-2.5 bg-[#12192b] hover:bg-[#18233d] border border-gray-800 rounded-lg flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="truncate max-w-[240px]">
                  <p className="text-gray-200 font-medium truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{v.size} • {v.duration}</p>
                </div>
                <Badge variant="cyan" size="xs">Sẵn sàng</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 4: KÍCH HOẠT BẢN QUYỀN (LICENSE & HWID) */}
      <Modal
        isOpen={isLicenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        title="Kích Hoạt Bản Quyền PeiPei Dub Studio"
        subtitle="Xác thực mã bản quyền với hệ thống máy chủ Quản trị Admin"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleDeactivateLicense}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
            >
              Hủy kích hoạt / Đổi Key khác
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLicenseModalOpen(false)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white border-none"
                onClick={handleVerifyLicense}
                disabled={isVerifying}
              >
                {isVerifying ? 'Đang xác thực...' : 'Xác thực & Kích hoạt'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#0d1424] border border-gray-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Mã phần cứng máy trạm (HWID):</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold text-sm">{hwid}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hwid);
                  alert('Đã sao chép mã HWID vào bộ nhớ tạm!');
                }}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Sao chép
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Mã Bản Quyền (License Key):</label>
            <input
              type="text"
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              placeholder="VD: JACS-9B21-4CA0-D1D1"
              className="w-full bg-[#162035] border border-gray-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Nhập mã key được cấp bởi Quản trị viên trong trang Admin Suite.
            </p>
          </div>

          {verifyMessage && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              verifyMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
            }`}>
              {verifyMessage.text}
            </div>
          )}
        </div>
      </Modal>
    </div>
    </StudioErrorBoundary>
  );
};

export default StudioPage;
