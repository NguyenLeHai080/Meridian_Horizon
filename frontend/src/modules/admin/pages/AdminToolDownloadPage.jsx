import React, { useState } from 'react';
import { Download, Monitor, Laptop, CheckCircle2, ShieldCheck, Terminal, Cpu, HardDrive, FileArchive, Check } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

export const AdminToolDownloadPage = () => {
  const [downloadingFile, setDownloadingFile] = useState(null);

  const triggerDownload = (filename, downloadUrl) => {
    setDownloadingFile(filename);

    // Kích hoạt tải tệp trực tiếp về máy tính người dùng
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingFile(null);
    }, 2500);
  };

  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-12 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-6 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-100 text-sm">Kho Tải Tool Desktop (Windows & macOS)</span>
            <Badge variant="purple" size="xs">OFFICIAL CLIENT v1.5.73</Badge>
          </div>
          {downloadingFile && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded text-emerald-400 font-mono text-[11px] animate-pulse">
              <Check size={13} />
              <span>Đang tải xuống: {downloadingFile}</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6">
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-purple-300">PeiPei Dub Studio Client v1.5.73</span>
                <span className="text-[11px] text-gray-400 font-mono">• Build 2026.03.22</span>
              </div>
              <p className="text-xs text-gray-400">
                Bấm nút tải phía dưới để lưu trực tiếp tệp cài đặt về máy tính của bạn (hỗ trợ Windows 10/11 và macOS).
              </p>
            </div>
          </div>

          {/* 3 Lựa chọn cài đặt: Windows, macOS và Portable ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* WINDOWS INSTALLER */}
            <div className="p-5 rounded-2xl bg-[#0f1523] border border-blue-500/30 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Monitor size={24} />
                  </div>
                  <Badge variant="cyan" size="xs">Windows 10/11</Badge>
                </div>

                <h3 className="text-base font-bold text-gray-100">Bản Cài Đặt Windows (.EXE)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Trình cài đặt tự động nhận diện phần cứng GPU NVIDIA và cài đặt runtime CUDA / Torch tăng tốc.
                </p>

                <div className="p-2.5 bg-[#080c16] rounded-lg border border-gray-800 space-y-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[11px]">Tệp: <code>PeiPeiDub-Setup-v1.5.73.exe</code> (11.6 MB)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu size={12} className="text-blue-400" />
                    <span className="text-[11px]">Định dạng: Native Windows x64 PE (Chạy trực tiếp)</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full text-xs font-bold"
                leftIcon={<Download size={15} />}
                onClick={() => triggerDownload('PeiPeiDub-Setup-v1.5.73.exe', '/downloads/PeiPeiDub-Setup-v1.5.73.exe')}
              >
                Tải về Windows (.exe)
              </Button>
            </div>

            {/* MACOS DISK IMAGE */}
            <div className="p-5 rounded-2xl bg-[#0f1523] border border-emerald-500/30 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Laptop size={24} />
                  </div>
                  <Badge variant="success" size="xs">macOS DMG</Badge>
                </div>

                <h3 className="text-base font-bold text-gray-100">Bản Cài Đặt macOS (.DMG)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tương thích hoàn hảo Apple Silicon (M1/M2/M3/M4) và chip Intel. Kéo thả vào Applications để sử dụng.
                </p>

                <div className="p-2.5 bg-[#080c16] rounded-lg border border-gray-800 space-y-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[11px]">Tệp: <code>PeiPeiDub-macOS-v1.5.73.dmg</code></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive size={12} className="text-emerald-400" />
                    <span className="text-[11px]">macOS 13.0+</span>
                  </div>
                </div>
              </div>

              <Button
                variant="success"
                size="md"
                className="w-full text-xs font-bold"
                leftIcon={<Download size={15} />}
                onClick={() => triggerDownload('PeiPeiDub-macOS-v1.5.73.dmg', '/downloads/PeiPeiDub-macOS-v1.5.73.dmg')}
              >
                Tải về macOS (.dmg)
              </Button>
            </div>

            {/* PORTABLE ZIP PACKAGE */}
            <div className="p-5 rounded-2xl bg-[#0f1523] border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <FileArchive size={24} />
                  </div>
                  <Badge variant="warning" size="xs">Portable ZIP</Badge>
                </div>

                <h3 className="text-base font-bold text-gray-100">Bản Nén Không Cần Cài (.ZIP)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dành cho máy phòng net hoặc máy công ty không có quyền Admin. Chỉ cần giải nén và chạy trực tiếp.
                </p>

                <div className="p-2.5 bg-[#080c16] rounded-lg border border-gray-800 space-y-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[11px]">Tệp: <code>PeiPeiDub-Portable-v1.5.73.zip</code></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu size={12} className="text-amber-400" />
                    <span className="text-[11px]">Chạy ngay không cần cài</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                className="w-full text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-950/30"
                leftIcon={<Download size={15} />}
                onClick={() => triggerDownload('PeiPeiDub-Portable-v1.5.73.zip', '/downloads/PeiPeiDub-Portable-v1.5.73.zip')}
              >
                Tải bản Portable (.zip)
              </Button>
            </div>
          </div>

          {/* Hướng dẫn kích hoạt bản quyền */}
          <div className="p-5 bg-[#0d1424] border border-gray-800 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-gray-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Quy trình Cài đặt & Kích hoạt Bản quyền Tool</span>
            </h4>
            <ol className="list-decimal list-inside text-xs text-gray-300 space-y-2 leading-relaxed">
              <li>Chọn và bấm nút tải bộ cài đặt phù hợp với máy tính của bạn ở trên.</li>
              <li>Mở tệp cài đặt (đối với Windows nhấp đúp <code>.exe</code>, đối với macOS kéo tệp <code>.dmg</code> vào thư mục Applications).</li>
              <li>Khởi chạy Tool Studio trên máy tính. Phần mềm sẽ hiển thị mã phần cứng duy nhất của máy (**HWID**).</li>
              <li>Trên trang Quản trị này, vào mục <strong>"Bản quyền Tool"</strong>, sao chép <code>Mã License Key</code> và dán vào tool trên máy tính để mở khóa toàn bộ tính năng!</li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminToolDownloadPage;
