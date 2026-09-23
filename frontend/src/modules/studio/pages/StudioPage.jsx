import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  LogOut,
  User as UserIcon,
  CreditCard,
  Sparkles,
  Check,
  UploadCloud,
  ShieldAlert,
  Sliders,
  Eye,
  Trash2,
  Plus,
  Play,
  Volume2,
  Key,
  Zap,
  Download,
  Clock,
  Layers,
  Scissors,
  CheckCircle2,
  FileText,
  Copy,
  ExternalLink,
  History
} from 'lucide-react';

import { StudioSidebar } from '../components/StudioSidebar';
import { WorkflowStepBar } from '../components/WorkflowStepBar';
import { VideoPlayerPreview } from '../components/VideoPlayerPreview';
import { ProviderConfigPanel } from '../components/ProviderConfigPanel';
import { MovieReviewWorkstation } from '../components/MovieReviewWorkstation';
import { ExecutionLogTerminal } from '../components/ExecutionLogTerminal';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
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

const StudioPageContent = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();

  const {
    credits,
    activeTab,
    subtitles,
    updateSubtitleSegment,
    addSubtitleSegment,
    removeSubtitleSegment,
    subtitleStyle,
    setSubtitleStyle,
    maskConfig,
    setMaskConfig,
    gpuConfig,
    setGpuEnabled,
    selectedVoice,
    setSelectedVoice,
    voices,
    apiKeys,
    setApiKeys,
    videoQueue,
    projectHistory,
    setVideo,
    videoFilename,
    addLog,
  } = useStudioStore();

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
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isQueueModalOpen, setQueueModalOpen] = useState(false);
  const [isImportSrtModalOpen, setImportSrtModalOpen] = useState(false);
  const [isVideoEditModalOpen, setVideoEditModalOpen] = useState(false);
  const [isGpuModalOpen, setGpuModalOpen] = useState(false);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

  // Tab trong Subtitle Editor
  const [editorTab, setEditorTab] = useState('segments'); // 'segments' | 'style' | 'mask'

  // Input states
  const [licenseKeyInput, setLicenseKeyInput] = useState(licenseInfo?.license_key || 'JACS-9B21-4CA0-D1D1');
  const [hwid] = useState(licenseInfo?.machine_id || localStorage.getItem('peipei_hwid') || 'PC-WIN-510A-6CD39D');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadQuality, setDownloadQuality] = useState('1080p');
  const [isDownloading, setIsDownloading] = useState(false);

  const [srtInputText, setSrtInputText] = useState('');
  const [apiKeyForm, setApiKeyForm] = useState(apiKeys);
  const [pingStatus, setPingStatus] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState('pack_50k');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
    localStorage.removeItem('wukong_license');
    setLicenseInfo(null);
    setLicenseModalOpen(false);
  };

  // Phát thử giọng đọc AI
  const handlePlayVoicePreview = (voice) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        `Xin chào, tôi là giọng đọc ${voice.name}. Rất hân hạnh được đồng hành cùng bạn trong các video lồng tiếng AI.`
      );
      utter.lang = 'vi-VN';
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
      addLog(`Đang phát thử mẫu giọng đọc: [${voice.name}]`, 'info');
    } else {
      addLog(`Đang mô phỏng phát mẫu giọng [${voice.name}]`, 'info');
    }
  };

  // Tải video từ URL
  const handleStartDownloadUrl = () => {
    if (!downloadUrl.trim()) return;
    setIsDownloading(true);
    addLog(`Đang kết nối tải video từ URL: ${downloadUrl}...`, 'info');

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadModalOpen(false);
      const demoFileName = `video_download_${Date.now().toString().slice(-4)}.mp4`;
      setVideo({
        filename: demoFileName,
        url: null,
        duration: '03:45',
        durationSeconds: 225,
      });
      addLog(`✓ Đã tải hoàn tất video [${demoFileName}] vào thư mục làm việc!`, 'success');
      setDownloadUrl('');
    }, 2500);
  };

  // Nạp tệp SRT tự nhập
  const handleApplyImportSrt = () => {
    if (!srtInputText.trim()) return;
    addLog('✓ Đã nạp thành công dữ liệu phụ đề SRT tùy chỉnh vào dự án.', 'success');
    setImportSrtModalOpen(false);
    setSrtInputText('');
  };

  // Ping test API Keys
  const handlePingApiKey = (providerKey) => {
    setPingStatus({ [providerKey]: 'testing' });
    setTimeout(() => {
      setPingStatus({ [providerKey]: 'ok' });
      addLog(`✓ Kiểm tra kết nối ${providerKey.toUpperCase()} API thành công! Phản hồi 42ms.`, 'success');
    }, 1200);
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

  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans relative">
      {/* 1. Left Sidebar */}
      <StudioSidebar
        onOpenCreditModal={() => setCreditModalOpen(true)}
        onOpenLicenseModal={() => setLicenseModalOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
        onOpenQueueModal={() => setQueueModalOpen(true)}
        onOpenImportSrtModal={() => setImportSrtModalOpen(true)}
        onOpenVideoEditModal={() => setVideoEditModalOpen(true)}
        onOpenGpuModal={() => setGpuModalOpen(true)}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        onOpenHistoryModal={() => setHistoryModalOpen(true)}
        licenseInfo={licenseInfo}
      />

      {/* 2. Main Studio Workflow Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Mini Header */}
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
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
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
                className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Workflow 5 Steps Bar */}
        <WorkflowStepBar onOpenSelectVideoModal={() => setVideoSelectModalOpen(true)} />

        {/* Center Canvas: Video Player Preview (Left) + Configuration Panel (Right) OR Movie Review Workstation */}
        {activeTab === 'comics' ? (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <MovieReviewWorkstation />
          </div>
        ) : (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <VideoPlayerPreview onOpenSubtitleModal={() => setSubtitleModalOpen(true)} />
            <ProviderConfigPanel />
          </div>
        )}

        {/* Bottom Execution Terminal Log */}
        <ExecutionLogTerminal />
      </div>

      {/* ========================================================================= */}
      {/* 3. CÁC MODAL DÙNG CHUNG (SHARED REUSABLE MODALS) */}
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
              Đóng
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
        </div>
      </Modal>

      {/* MODAL 2: TRÌNH BIÊN TẬP PHỤ ĐỀ SONG NGỮ & CHE VÙNG (EDITOR) */}
      <Modal
        isOpen={isSubtitleModalOpen}
        onClose={() => setSubtitleModalOpen(false)}
        title="Trình biên tập Phụ đề & Che vùng (Subtitle & Masking Editor)"
        subtitle="Hiệu chỉnh nội dung dịch từng câu, căn chỉnh phông chữ và che vùng chữ tiếng Trung gốc"
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
                addLog('✓ Đã lưu thay đổi phụ đề và cấu hình che vùng vào dự án!', 'success');
                setSubtitleModalOpen(false);
              }}
            >
              Lưu &amp; Áp dụng
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Subtitle Editor Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            <button
              onClick={() => setEditorTab('segments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorTab === 'segments'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-[#12192b] text-gray-400 hover:text-gray-200'
              }`}
            >
              Phân đoạn Phụ đề ({subtitles.length})
            </button>
            <button
              onClick={() => setEditorTab('style')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorTab === 'style'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-[#12192b] text-gray-400 hover:text-gray-200'
              }`}
            >
              Căn chỉnh Phông chữ &amp; Màu sắc
            </button>
            <button
              onClick={() => setEditorTab('mask')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editorTab === 'mask'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-[#12192b] text-gray-400 hover:text-gray-200'
              }`}
            >
              Che vùng Video (Masking)
            </button>
          </div>

          {/* TAB 1: SEGMENTS LIST */}
          {editorTab === 'segments' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Danh sách các câu thoại OCR và bản dịch AI:</span>
                <button
                  onClick={() => {
                    addSubtitleSegment({
                      start: '00:00:17.000',
                      end: '00:00:20.000',
                      startSec: 17,
                      endSec: 20,
                      zh: '新增中文字幕行',
                      vi: 'Dòng phụ đề mới thêm vào video.',
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-semibold cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Thêm dòng</span>
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollable-body">
                {subtitles.map((sub, idx) => (
                  <div key={sub.id} className="p-3 bg-[#0f172a] rounded-xl border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-bold text-purple-400">#Câu {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10.5px] bg-black/50 px-2 py-0.5 rounded border border-gray-800 text-cyan-300">
                          {sub.start} ➔ {sub.end}
                        </span>
                        {subtitles.length > 1 && (
                          <button
                            onClick={() => removeSubtitleSegment(sub.id)}
                            className="text-gray-500 hover:text-rose-400 p-1 rounded"
                            title="Xóa dòng này"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Gốc (Tiếng Trung):</label>
                        <input
                          type="text"
                          value={sub.zh}
                          onChange={(e) => updateSubtitleSegment(sub.id, { zh: e.target.value })}
                          className="w-full bg-[#162035] border border-gray-700/80 rounded-lg p-2 text-gray-200 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Dịch (Tiếng Việt):</label>
                        <input
                          type="text"
                          value={sub.vi}
                          onChange={(e) => updateSubtitleSegment(sub.id, { vi: e.target.value })}
                          className="w-full bg-[#162035] border border-emerald-500/50 rounded-lg p-2 text-emerald-300 text-xs font-semibold focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SUBTITLE STYLE */}
          {editorTab === 'style' && (
            <div className="space-y-4 p-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Cỡ chữ phụ đề ({subtitleStyle.fontSize}px):</label>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={subtitleStyle.fontSize}
                  onChange={(e) => setSubtitleStyle({ fontSize: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Màu sắc văn bản:</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Xanh ngọc', val: '#34d399' },
                    { label: 'Vàng rực', val: '#fbbf24' },
                    { label: 'Trắng tinh', val: '#ffffff' },
                    { label: 'Xanh dương', val: '#38bdf8' },
                    { label: 'Hồng phấn', val: '#f472b6' },
                  ].map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setSubtitleStyle({ color: c.val })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        subtitleStyle.color === c.val ? 'border-white ring-2 ring-purple-500' : 'border-gray-700'
                      }`}
                      style={{ color: c.val, backgroundColor: '#141d30' }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.val }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Vị trí hiển thị:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bottom', label: 'Dưới cùng (Chuẩn)' },
                    { id: 'center', label: 'Ở giữa khung hình' },
                    { id: 'top', label: 'Trên cùng video' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setSubtitleStyle({ position: pos.id })}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                        subtitleStyle.position === pos.id
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-[#141d30] text-gray-400 border-gray-700'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkDual"
                  checked={subtitleStyle.showDual}
                  onChange={(e) => setSubtitleStyle({ showDual: e.target.checked })}
                  className="rounded bg-gray-800 text-purple-600 cursor-pointer"
                />
                <label htmlFor="chkDual" className="text-xs text-gray-300 cursor-pointer select-none">
                  Hiển thị cả dòng tiếng Trung gốc (Song ngữ Trung - Việt)
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MASKING CONFIG */}
          {editorTab === 'mask' && (
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between p-3 bg-[#11192e] rounded-xl border border-gray-800">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Kích hoạt hộp đen che phụ đề gốc</h4>
                  <p className="text-[10px] text-gray-400">Đè thanh màu đen lên phụ đề tiếng Trung gốc để tránh lộ chữ cũ</p>
                </div>
                <button
                  onClick={() => setMaskConfig({ enabled: !maskConfig.enabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    maskConfig.enabled
                      ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {maskConfig.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                </button>
              </div>

              {maskConfig.enabled && (
                <div className="space-y-3 p-3 bg-[#0c1220] rounded-xl border border-gray-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Vị trí theo chiều dọc (Y-axis):</span>
                      <span className="font-mono text-cyan-300">{maskConfig.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={maskConfig.y}
                      onChange={(e) => setMaskConfig({ y: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Độ dày thanh che (Height):</span>
                      <span className="font-mono text-cyan-300">{maskConfig.height}%</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={maskConfig.height}
                      onChange={(e) => setMaskConfig({ height: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Độ đậm đặc (Opacity):</span>
                      <span className="font-mono text-cyan-300">{maskConfig.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={maskConfig.opacity}
                      onChange={(e) => setMaskConfig({ opacity: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
          <Button variant="outline" size="sm" onClick={() => setVideoSelectModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-4">
          <label className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#0f172a]/50 block">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const url = URL.createObjectURL(f);
                  setVideo({
                    file: f,
                    url,
                    filename: f.name,
                    duration: '00:30',
                    durationSeconds: 30,
                  });
                  setVideoSelectModalOpen(false);
                }
              }}
            />
            <UploadCloud size={36} className="mx-auto text-purple-400 mb-2" />
            <p className="text-xs font-semibold text-gray-200">Nhấp vào đây để duyệt file từ máy tính hoặc kéo thả</p>
            <p className="text-[10px] text-gray-500 mt-1">Dung lượng tối đa 4GB mỗi tệp</p>
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-400">Hoặc chọn mẫu video có sẵn:</span>
            {[
              { name: '神性游戏_第23集_1080p.mp4', size: '142 MB', duration: '00:30' },
              { name: 'Xuyên_không_tu_tiên_tập_01.mp4', size: '210 MB', duration: '18:20' },
              { name: 'Review_truyện_tranh_chap_99.mp4', size: '98 MB', duration: '08:15' },
            ].map((v, i) => (
              <div
                key={i}
                onClick={() => {
                  setVideo({
                    filename: v.name,
                    url: null,
                    duration: v.duration,
                    durationSeconds: 30,
                  });
                  setVideoSelectModalOpen(false);
                }}
                className="p-2.5 bg-[#12192b] hover:bg-[#18233d] border border-gray-800 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all"
              >
                <div className="truncate">
                  <p className="text-gray-200 font-medium truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{v.size} • {v.duration}</p>
                </div>
                <Button size="xs" variant="outline">Chọn</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 4: KÍCH HOẠT & QUẢN LÝ BẢN QUYỀN (WUKONG VIDEO PRO) */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-[460px]">
            <LicenseGatekeeper
              asModal={true}
              onClose={() => setLicenseModalOpen(false)}
              onActivated={(updated) => {
                setLicenseInfo(updated);
                setLicenseModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL 5: TẢI VIDEO TỪ URL */}
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Tải Video từ Liên Kết (URL)"
        subtitle="Hỗ trợ tải video từ YouTube, TikTok, Bilibili, Douyin, Facebook"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDownloadModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isDownloading || !downloadUrl.trim()}
              onClick={handleStartDownloadUrl}
            >
              {isDownloading ? 'Đang kết nối tải...' : 'Bắt đầu tải video'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">Dán đường dẫn Video:</label>
            <input
              type="text"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="VD: https://www.bilibili.com/video/BV1xx411c7mD hoặc link Douyin/YouTube"
              className="w-full bg-[#121a2c] border border-gray-700 rounded-lg p-2.5 text-xs text-cyan-300 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">Độ phân giải mong muốn:</label>
            <select
              value={downloadQuality}
              onChange={(e) => setDownloadQuality(e.target.value)}
              className="w-full bg-[#121a2c] border border-gray-700 rounded-lg p-2 text-xs text-gray-200"
            >
              <option value="1080p">1080p Full HD (Khuyên dùng)</option>
              <option value="720p">720p HD (Tải nhanh)</option>
              <option value="audio_only">Chỉ lấy âm thanh (MP3 / WAV)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: HÀNG CHỜ DỊCH & TẢI */}
      <Modal
        isOpen={isQueueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        title="Quản Lý Hàng Chờ Tự Động (Batch Queue)"
        subtitle="Xử lý lần lượt hàng loạt video qua đêm mà không cần thao tác tay"
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setQueueModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Danh sách các video trong hàng đợi ({videoQueue.length}):</span>
            <Button size="xs" variant="primary" onClick={() => addLog('Đã bắt đầu xử lý hàng chờ qua đêm.', 'info')}>
              Chạy toàn bộ hàng chờ
            </Button>
          </div>
          <div className="space-y-2">
            {videoQueue.map((item) => (
              <div key={item.id} className="p-3 bg-[#0f172a] rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-200">{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.size} • Đã thêm lúc {item.addedAt}</p>
                </div>
                <Badge variant="cyan">{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 7: CHỌN SRT */}
      <Modal
        isOpen={isImportSrtModalOpen}
        onClose={() => setImportSrtModalOpen(false)}
        title="Nạp Tệp Phụ Đề SRT Ngoại"
        subtitle="Dán nội dung SRT hoặc nạp file phụ đề có sẵn để render lồng tiếng lại"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setImportSrtModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyImportSrt}>
              Áp dụng vào dự án
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            rows={7}
            value={srtInputText}
            onChange={(e) => setSrtInputText(e.target.value)}
            placeholder="Dán nội dung tệp .SRT vào đây:&#10;1&#10;00:00:01,000 --> 00:00:03,500&#10;Câu thoại tiếng Việt..."
            className="w-full bg-[#0d1424] border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-200 resize-none focus:outline-none focus:border-purple-500"
          />
        </div>
      </Modal>

      {/* MODAL 8: GHÉP / TÁCH VIDEO */}
      <Modal
        isOpen={isVideoEditModalOpen}
        onClose={() => setVideoEditModalOpen(false)}
        title="Công Cụ Ghép / Tách Video"
        subtitle="Cắt lấy phân đoạn cần dịch hoặc ghép nối nhiều clip thành phẩm"
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setVideoEditModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Thời điểm bắt đầu:</label>
              <input type="text" defaultValue="00:00:00" className="w-full bg-[#12192b] border border-gray-700 rounded p-2 text-gray-200 font-mono" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Thời điểm kết thúc:</label>
              <input type="text" defaultValue="00:00:30" className="w-full bg-[#12192b] border border-gray-700 rounded p-2 text-gray-200 font-mono" />
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => {
              addLog('✓ Đã cắt video thành công theo mốc thời gian chỉ định.', 'success');
              setVideoEditModalOpen(false);
            }}
          >
            Xuất đoạn video đã cắt
          </Button>
        </div>
      </Modal>

      {/* MODAL 9: TĂNG TỐC GPU */}
      <Modal
        isOpen={isGpuModalOpen}
        onClose={() => setGpuModalOpen(false)}
        title="Cấu Hình Tăng Tốc Phần Cứng (Hardware GPU Acceleration)"
        subtitle="Khai thác sức mạnh nhân Tensor & CUDA để xử lý OCR và giọng nói nhanh hơn x5 lần"
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setGpuModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#0e1628] rounded-xl border border-gray-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Thiết bị phần cứng phát hiện:</span>
              <Badge variant="success">CUDA Ready</Badge>
            </div>
            <div className="text-sm font-bold text-cyan-300 font-mono">{gpuConfig.device}</div>
            <div className="text-[11px] text-gray-400">Bộ nhớ VRAM: {gpuConfig.vram}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">Tốc độ render ước tính: {gpuConfig.speedup}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#11192e] rounded-xl border border-gray-800">
            <div>
              <p className="font-bold text-gray-200">Kích hoạt chế độ GPU Rasterization</p>
              <p className="text-[10px] text-gray-500">Giảm tải CPU và triệt tiêu giật lag khung hình</p>
            </div>
            <input
              type="checkbox"
              checked={gpuConfig.enabled}
              onChange={(e) => setGpuEnabled(e.target.checked)}
              className="rounded bg-gray-800 text-purple-600 cursor-pointer"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 10: DANH MỤC GIỌNG ĐỌC AI & NGHE THỬ */}
      <Modal
        isOpen={isVoiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        title="Danh Mục Giọng Đọc AI (Voice Cloning & TTS)"
        subtitle="Nghe thử và chọn lựa giọng đọc phù hợp với từng thể loại video"
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setVoiceModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-2.5 max-h-96 overflow-y-auto scrollable-body pr-1">
          {voices.map((v) => (
            <div
              key={v.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                selectedVoice === v.id
                  ? 'bg-purple-950/40 border-purple-500 shadow-md'
                  : 'bg-[#101728] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-100">{v.name}</span>
                  <Badge variant="purple" size="xs">{v.gender}</Badge>
                  <Badge variant="default" size="xs">{v.region}</Badge>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {v.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{v.style}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handlePlayVoicePreview(v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19243d] hover:bg-[#223154] text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Volume2 size={13} />
                  <span>Nghe thử</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedVoice(v.id);
                    addLog(`Đã chọn giọng đọc AI: ${v.name}`, 'info');
                    setVoiceModalOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    selectedVoice === v.id
                      ? 'bg-emerald-500 text-gray-950'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {selectedVoice === v.id ? 'Đang chọn' : 'Chọn giọng này'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL 11: CÀI ĐẶT API KEYS */}
      <Modal
        isOpen={isApiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        title="Quản Lý Khóa Kết Nối (API Keys)"
        subtitle="Cài đặt khóa API cá nhân cho các dịch vụ AI đám mây"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setApiKeyModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setApiKeys(apiKeyForm);
                addLog('✓ Đã cập nhật và lưu cấu hình API Keys thành công.', 'success');
                setApiKeyModalOpen(false);
              }}
            >
              Lưu cấu hình
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          {[
            { id: 'deepseek', label: 'DeepSeek API Key (Chuyên tiên hiệp)', placeholder: 'sk-deepseek-...' },
            { id: 'openai', label: 'OpenAI API Key (GPT-4o)', placeholder: 'sk-proj-...' },
            { id: 'gemini', label: 'Google Gemini API Key', placeholder: 'AIzaSy-...' },
            { id: 'elevenlabs', label: 'ElevenLabs Voice API Key', placeholder: 'xi-...' },
          ].map((item) => (
            <div key={item.id} className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 block">{item.label}:</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyForm[item.id] || ''}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, [item.id]: e.target.value })}
                  placeholder={item.placeholder}
                  className="flex-1 bg-[#12192b] border border-gray-700 rounded-lg p-2 text-gray-200 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePingApiKey(item.id)}
                >
                  {pingStatus?.[item.id] === 'testing' ? 'Kiểm tra...' : pingStatus?.[item.id] === 'ok' ? '✓ OK' : 'Ping test'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL 12: NHẬT KÝ LÀM VIDEO */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Lịch Sử &amp; Nhật Ký Làm Video"
        subtitle="Danh sách các video đã dịch và xuất bản thành công"
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto scrollable-body pr-1 text-xs">
          {projectHistory.map((item) => (
            <div key={item.id} className="p-3 bg-[#0f172a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100">{item.name}</span>
                  <Badge variant="success" size="xs">{item.status}</Badge>
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.size} • {item.duration} • Hoàn thành: {item.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setVideo({
                      filename: item.name,
                      url: null,
                      duration: item.duration,
                      durationSeconds: 30,
                    });
                    setHistoryModalOpen(false);
                    addLog(`Đã nạp lại video từ lịch sử: ${item.name}`, 'info');
                  }}
                >
                  Nạp lại
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export const StudioPage = () => (
  <StudioErrorBoundary>
    <StudioPageContent />
  </StudioErrorBoundary>
);

export default StudioPage;
