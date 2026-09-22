import React from 'react';
import { Download, Monitor, Laptop, CheckCircle2, ShieldCheck, Terminal, Cpu, HardDrive } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

export const AdminToolDownloadPage = () => {
  const downloadInstaller = (os) => {
    alert(`Đang khởi tạo tải bộ cài đặt Tool Studio cho hệ điều hành: ${os.toUpperCase()}`);
  };

  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-gray-100 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-12 flex-shrink-0 bg-[#090d17] border-b border-gray-800 px-6 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-gray-100 text-sm">Kho Cài Đặt Tool Desktop (Windows & macOS)</span>
            <span className="text-gray-400 ml-2">Phiên bản chính thức: v1.5.73 Enterprise</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6">
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-purple-300">PeiPei Dub Studio Client v1.5.73</span>
                <Badge variant="purple" size="xs">LATEST RELEASE</Badge>
              </div>
              <p className="text-xs text-gray-400">
                Bộ công cụ AI dịch và lồng tiếng video chuyên nghiệp chạy trực tiếp trên máy trạm Windows và macOS.
              </p>
            </div>
          </div>

          {/* Hai phiên bản Windows và macOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WINDOWS CARD */}
            <div className="p-6 rounded-2xl bg-[#0f1523] border border-blue-500/30 shadow-xl flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Monitor size={28} />
                  </div>
                  <Badge variant="cyan" size="sm">Windows 10 / 11</Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-100">Bản Cài Đặt Windows (64-bit)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tối ưu hóa sâu cho card đồ họa NVIDIA (CUDA 12.x / TensorRT). Hỗ trợ tăng tốc GPU tách phụ đề OCR và tổng hợp giọng đọc cực nhanh.
                </p>

                <div className="p-3 bg-[#080c16] rounded-lg border border-gray-800 space-y-1.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Tệp: <code>PeiPeiDub-Setup-v1.5.73.exe</code> (184 MB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu size={13} className="text-blue-400" />
                    <span>Yêu cầu: CPU Core i5/Ryzen 5, RAM 16GB, GPU NVIDIA 6GB+</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<Download size={16} />}
                onClick={() => downloadInstaller('windows')}
              >
                Tải về cho Windows (.EXE)
              </Button>
            </div>

            {/* MACOS CARD */}
            <div className="p-6 rounded-2xl bg-[#0f1523] border border-emerald-500/30 shadow-xl flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Laptop size={28} />
                  </div>
                  <Badge variant="success" size="sm">Apple Silicon & Intel</Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-100">Bản Cài Đặt macOS (.DMG)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tương thích hoàn hảo trên các dòng chip M1/M2/M3/M4 và chip Intel. Tận dụng Apple Neural Engine để tăng tốc xử lý whisper và OCR phụ đề.
                </p>

                <div className="p-3 bg-[#080c16] rounded-lg border border-gray-800 space-y-1.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Tệp: <code>PeiPeiDub-macOS-v1.5.73.dmg</code> (192 MB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive size={13} className="text-emerald-400" />
                    <span>Hệ điều hành: macOS Ventura 13.0 trở lên</span>
                  </div>
                </div>
              </div>

              <Button
                variant="success"
                size="md"
                className="w-full"
                leftIcon={<Download size={16} />}
                onClick={() => downloadInstaller('macos')}
              >
                Tải về cho macOS (.DMG)
              </Button>
            </div>
          </div>

          {/* Hướng dẫn kích hoạt bản quyền */}
          <div className="p-5 bg-[#0d1424] border border-gray-800 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-gray-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Quy trình Cài đặt & Kích hoạt Bản quyền Tool</span>
            </h4>
            <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1.5 leading-relaxed">
              <li>Tải tệp cài đặt phù hợp với máy tính (Windows hoặc macOS) ở trên.</li>
              <li>Mở tệp và làm theo hướng dẫn trên màn hình để hoàn tất cài đặt phần mềm.</li>
              <li>Khởi chạy Tool Studio trên máy tính. Ứng dụng sẽ tự động trích xuất mã phần cứng (HWID) của máy.</li>
              <li>Vào mục <strong>Quản lý Bản quyền Tool</strong> trên trang Admin này, sao chép <code>Mã Bản Quyền (License Key)</code> và nhập vào tool trên máy tính để kích hoạt sử dụng!</li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminToolDownloadPage;
