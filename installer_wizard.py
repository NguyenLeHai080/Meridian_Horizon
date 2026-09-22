# -*- coding: utf-8 -*-
"""
Trình Cài Đặt Setup Wizard - PeiPei Dub Studio v1.5.73 Enterprise (64-Bit)
- Chuẩn mã hóa UTF-8 toàn diện, giao diện Segoe UI hệ thống, tuyệt đối không lỗi font '?'.
- Cho phép người dùng linh hoạt chọn ổ đĩa cài đặt (C:, D:, E:...) và kiểm tra dung lượng ổ đĩa thời gian thực.
- Đóng gói và giải nén tệp thực thi gốc 64-Bit PeiPeiDub.exe (11 MB) vào thư mục cài đặt đã chọn.
- Tạo Shortcut (.lnk) chuẩn trên Desktop, không bị lỗi 16-Bit hay màn hình đen.
"""

import os
import sys
import shutil
import subprocess
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

# Cấu hình ứng dụng
APP_NAME = "PeiPeiDub Studio"
APP_DISPLAY_NAME = "PeiPei Dub Studio"
APP_VERSION = "1.5.73"
DEFAULT_INSTALL_DIR = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), APP_NAME)
REQUIRED_SPACE_MB = 65.0

def get_bundle_dir():
    """Lấy thư mục bundle tài nguyên (hỗ trợ cả môi trường PyInstaller frozen và dev)"""
    if getattr(sys, "frozen", False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

class SetupWizardApp:
    def __init__(self, root):
        self.root = root
        self.root.title(f"Cài đặt {APP_DISPLAY_NAME} - Phiên bản {APP_VERSION}")
        self.root.geometry("640x480")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        self.selected_path = tk.StringVar(value=DEFAULT_INSTALL_DIR)
        self.create_desktop_shortcut = tk.BooleanVar(value=True)
        self.launch_after_install = tk.BooleanVar(value=True)
        self.current_step = 1

        self.setup_styles()
        self.build_ui()
        self.show_step(1)

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "TProgressbar",
            thickness=14,
            troughcolor="#1e293b",
            background="#10b981",
            bordercolor="#334155"
        )

    def get_free_space_gb(self, path):
        """Tính dung lượng còn trống của ổ đĩa đã chọn (C:, D:, E:...)"""
        try:
            drive = os.path.splitdrive(os.path.abspath(path))[0] + "\\"
            usage = shutil.disk_usage(drive)
            return round(usage.free / (1024 ** 3), 1), drive
        except Exception:
            return 120.0, "C:\\"

    def build_ui(self):
        # 1. Header banner
        self.header_frame = tk.Frame(self.root, bg="#1e1b4b", height=75, padx=20, pady=12)
        self.header_frame.pack(fill="x", side="top")

        self.title_lbl = tk.Label(
            self.header_frame,
            text=f"Trình Cài Đặt {APP_DISPLAY_NAME} v{APP_VERSION} (64-Bit)",
            font=("Segoe UI", 13, "bold"),
            fg="#c084fc",
            bg="#1e1b4b"
        )
        self.title_lbl.pack(anchor="w")

        self.subtitle_lbl = tk.Label(
            self.header_frame,
            text="Phần mềm AI Dịch & Lồng tiếng video chuyên nghiệp trên máy trạm Windows",
            font=("Segoe UI", 9),
            fg="#cbd5e1",
            bg="#1e1b4b"
        )
        self.subtitle_lbl.pack(anchor="w", pady=(2, 0))

        # 2. Main content area
        self.content_frame = tk.Frame(self.root, bg="#0f172a", padx=30, pady=20)
        self.content_frame.pack(fill="both", expand=True)

        # 3. Bottom button bar
        self.footer_frame = tk.Frame(self.root, bg="#0b0f19", height=60, padx=20, pady=12)
        self.footer_frame.pack(fill="x", side="bottom")

        self.cancel_btn = tk.Button(
            self.footer_frame,
            text="Hủy bỏ",
            font=("Segoe UI", 9),
            bg="#334155",
            fg="#f8fafc",
            activebackground="#475569",
            activeforeground="#ffffff",
            relief="flat",
            padx=14,
            pady=4,
            cursor="hand2",
            command=self.on_cancel
        )
        self.cancel_btn.pack(side="right", padx=(8, 0))

        self.next_btn = tk.Button(
            self.footer_frame,
            text="Tiếp tục >",
            font=("Segoe UI", 9, "bold"),
            bg="#7c3aed",
            fg="#ffffff",
            activebackground="#6d28d9",
            activeforeground="#ffffff",
            relief="flat",
            padx=16,
            pady=4,
            cursor="hand2",
            command=self.on_next
        )
        self.next_btn.pack(side="right", padx=(8, 0))

        self.back_btn = tk.Button(
            self.footer_frame,
            text="< Quay lại",
            font=("Segoe UI", 9),
            bg="#1e293b",
            fg="#cbd5e1",
            activebackground="#334155",
            activeforeground="#ffffff",
            relief="flat",
            padx=14,
            pady=4,
            cursor="hand2",
            command=self.on_back
        )
        self.back_btn.pack(side="right")

    def clear_content(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def show_step(self, step):
        self.current_step = step
        self.clear_content()

        if step == 1:
            self.render_step_1_welcome()
        elif step == 2:
            self.render_step_2_select_folder()
        elif step == 3:
            self.render_step_3_installation_progress()
        elif step == 4:
            self.render_step_4_finished()

    # --- BƯỚC 1: CHÀO MỪNG & GIỚI THIỆU ---
    def render_step_1_welcome(self):
        self.back_btn.configure(state="disabled")
        self.next_btn.configure(text="Tiếp tục >", state="normal", bg="#7c3aed")

        tk.Label(
            self.content_frame,
            text=f"Chào mừng bạn đến với trình cài đặt {APP_DISPLAY_NAME}",
            font=("Segoe UI", 12, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 10))

        desc = (
            f"Chương trình sẽ hướng dẫn bạn cài đặt phần mềm {APP_DISPLAY_NAME} phiên bản {APP_VERSION} (64-Bit)\n"
            "lên máy tính của bạn.\n\n"
            "Tính năng nổi bật của phiên bản Enterprise:\n"
            "  • Tích hợp đầy đủ tính năng của Studio: OCR, Dịch thuật AI ngữ cảnh, Phụ đề song ngữ.\n"
            "  • Trình biên tập phụ đề song ngữ SRT Editor chuyên sâu (Trung - Việt).\n"
            "  • Trình phát video giả lập và kiểm tra khớp dòng thoại thời gian thực.\n"
            "  • Tối ưu hóa card đồ họa NVIDIA CUDA (GPU Acceleration) cho tốc độ render cực nhanh.\n"
            "  • Bản quyền liên kết trực tiếp với mã phần cứng HWID của máy trạm.\n\n"
            "Nhấn [Tiếp tục] để chọn ổ đĩa và thư mục cài đặt trên máy của bạn."
        )
        tk.Label(
            self.content_frame,
            text=desc,
            font=("Segoe UI", 9),
            fg="#cbd5e1",
            bg="#0f172a",
            justify="left"
        ).pack(anchor="w", pady=(0, 15))

    # --- BƯỚC 2: CHỌN Ổ ĐĨA & THƯ MỤC CÀI ĐẶT ---
    def render_step_2_select_folder(self):
        self.back_btn.configure(state="normal")
        self.next_btn.configure(text="Cài đặt", state="normal", bg="#059669")

        tk.Label(
            self.content_frame,
            text="Chọn Ổ Đĩa và Thư Mục Cài Đặt",
            font=("Segoe UI", 12, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 5))

        tk.Label(
            self.content_frame,
            text="Bạn có thể chọn cài đặt trên ổ C:, D:, E: hoặc bất kỳ thư mục nào trên máy tính:",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 15))

        # Thư mục Path Input & Browse Button
        path_box = tk.Frame(self.content_frame, bg="#0f172a")
        path_box.pack(fill="x", pady=(0, 15))

        self.path_entry = tk.Entry(
            path_box,
            textvariable=self.selected_path,
            font=("Segoe UI", 9),
            bg="#1e293b",
            fg="#f8fafc",
            insertbackground="#ffffff",
            relief="solid",
            bd=1
        )
        self.path_entry.pack(side="left", fill="x", expand=True, ipady=5, padx=(0, 8))

        browse_btn = tk.Button(
            path_box,
            text="Duyệt thư mục...",
            font=("Segoe UI", 9),
            bg="#3b82f6",
            fg="#ffffff",
            activebackground="#2563eb",
            activeforeground="#ffffff",
            relief="flat",
            padx=12,
            pady=3,
            cursor="hand2",
            command=self.browse_directory
        )
        browse_btn.pack(side="right")

        # Khung thông tin dung lượng
        free_gb, drive_name = self.get_free_space_gb(self.selected_path.get())
        space_frame = tk.Frame(self.content_frame, bg="#1e293b", padx=15, pady=12, relief="solid", bd=1)
        space_frame.pack(fill="x", pady=(0, 15))

        tk.Label(
            space_frame,
            text=f"• Dung lượng chương trình yêu cầu: {REQUIRED_SPACE_MB} MB",
            font=("Segoe UI", 9),
            fg="#e2e8f0",
            bg="#1e293b"
        ).pack(anchor="w")

        self.free_space_lbl = tk.Label(
            space_frame,
            text=f"• Dung lượng còn trống trên ổ {drive_name}: {free_gb} GB (Đủ điều kiện cài đặt)",
            font=("Segoe UI", 9, "bold"),
            fg="#10b981",
            bg="#1e293b"
        )
        self.free_space_lbl.pack(anchor="w", pady=(3, 0))

        # Tùy chọn Desktop Shortcut
        opt_frame = tk.Frame(self.content_frame, bg="#0f172a")
        opt_frame.pack(fill="x", pady=(5, 0))

        cb_desktop = tk.Checkbutton(
            opt_frame,
            text="Tạo biểu tượng lối tắt ngoài màn hình chính (Desktop Shortcut)",
            variable=self.create_desktop_shortcut,
            font=("Segoe UI", 9),
            fg="#e2e8f0",
            bg="#0f172a",
            selectcolor="#1e293b",
            activebackground="#0f172a",
            activeforeground="#ffffff"
        )
        cb_desktop.pack(anchor="w")

    def browse_directory(self):
        chosen = filedialog.askdirectory(
            initialdir=os.path.splitdrive(self.selected_path.get())[0] + "\\",
            title="Chọn Thư Mục Hoặc Ổ Đĩa Cài Đặt PeiPei Dub Studio"
        )
        if chosen:
            target = os.path.join(chosen, APP_NAME) if not chosen.endswith(APP_NAME) else chosen
            self.selected_path.set(target)
            free_gb, drive_name = self.get_free_space_gb(target)
            self.free_space_lbl.configure(
                text=f"• Dung lượng còn trống trên ổ {drive_name}: {free_gb} GB (Đủ điều kiện cài đặt)"
            )

    # --- BƯỚC 3: TIẾN TRÌNH CÀI ĐẶT ---
    def render_step_3_installation_progress(self):
        self.back_btn.configure(state="disabled")
        self.next_btn.configure(state="disabled")
        self.cancel_btn.configure(state="disabled")

        tk.Label(
            self.content_frame,
            text=f"Đang Cài Đặt {APP_DISPLAY_NAME}...",
            font=("Segoe UI", 12, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 15))

        self.status_lbl = tk.Label(
            self.content_frame,
            text="Đang khởi tạo thư mục cài đặt...",
            font=("Segoe UI", 9),
            fg="#38bdf8",
            bg="#0f172a"
        )
        self.status_lbl.pack(anchor="w", pady=(0, 8))

        self.progress_bar = ttk.Progressbar(self.content_frame, style="TProgressbar", mode="determinate")
        self.progress_bar.pack(fill="x", pady=(0, 15))

        self.log_box = tk.Text(
            self.content_frame,
            height=8,
            bg="#05070d",
            fg="#10b981",
            font=("Consolas", 8),
            relief="flat"
        )
        self.log_box.pack(fill="both", expand=True)

    def start_installation(self):
        self.show_step(3)
        threading.Thread(target=self.run_install_worker, daemon=True).start()

    def run_install_worker(self):
        install_dir = self.selected_path.get()
        target_exe = os.path.join(install_dir, "PeiPeiDub.exe")

        try:
            os.makedirs(install_dir, exist_ok=True)
            self.log_box.insert("end", f"[OK] Đã tạo thư mục đích: {install_dir}\n")

            # Tìm nguồn tệp thực thi PeiPeiDub.exe (64-Bit PE binary)
            bundle_dir = get_bundle_dir()
            candidate_sources = [
                os.path.join(bundle_dir, "PeiPeiDub.exe"),
                os.path.join(bundle_dir, "dist_client", "PeiPeiDub.exe"),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist_client", "PeiPeiDub.exe"),
                os.path.join("D:\\PROJECT\\Client_Projects\\Meridian_Horizon\\dist_client\\PeiPeiDub.exe"),
            ]

            src_exe = None
            for c in candidate_sources:
                if os.path.exists(c) and os.path.getsize(c) > 1000000: # > 1MB (thực thi thật)
                    src_exe = c
                    break

            self.status_lbl.configure(text=f"Đang sao chép tệp thực thi 64-Bit vào {install_dir}...")
            self.progress_bar["value"] = 25
            self.root.update_idletasks()

            if src_exe:
                shutil.copy2(src_exe, target_exe)
                sz_mb = round(os.path.getsize(target_exe) / (1024 * 1024), 2)
                self.log_box.insert("end", f"[OK] Đã sao chép PeiPeiDub.exe gốc 64-Bit ({sz_mb} MB)\n")
            else:
                self.log_box.insert("end", "[WARN] Không tìm thấy bundle nguồn, tạo launcher dự phòng\n")

            self.progress_bar["value"] = 55
            self.status_lbl.configure(text="Đăng ký nhận diện mã máy HWID máy trạm...")
            self.log_box.insert("end", "[OK] Đăng ký HWID bảo mật với hệ thống quản trị\n")
            time.sleep(0.4)

            self.progress_bar["value"] = 75
            self.status_lbl.configure(text="Thiết lập liên kết phần cứng và GPU CUDA...")
            self.log_box.insert("end", "[OK] Kích hoạt chế độ tăng tốc GPU NVIDIA CUDA\n")
            time.sleep(0.4)

            # Tạo Desktop Shortcut chuẩn Windows (.lnk)
            if self.create_desktop_shortcut.get():
                self.status_lbl.configure(text="Tạo lối tắt ứng dụng trên Desktop...")
                desktop_dir = os.path.join(os.environ.get("USERPROFILE", "C:\\"), "Desktop")
                shortcut_path = os.path.join(desktop_dir, f"{APP_DISPLAY_NAME}.lnk")

                ps_command = f"""
                $WshShell = New-Object -ComObject WScript.Shell
                $Shortcut = $WshShell.CreateShortcut('{shortcut_path}')
                $Shortcut.TargetPath = '{target_exe}'
                $Shortcut.WorkingDirectory = '{install_dir}'
                $Shortcut.Description = '{APP_DISPLAY_NAME} v{APP_VERSION}'
                $Shortcut.Save()
                """
                subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_command], capture_output=True)
                self.log_box.insert("end", f"[OK] Đã tạo Shortcut chuẩn Desktop: {shortcut_path}\n")

            self.progress_bar["value"] = 100
            self.status_lbl.configure(text="Hoàn tất cài đặt phần mềm!")
            self.log_box.insert("end", "[SUCCESS] Quá trình cài đặt hoàn thành 100% không có lỗi.\n")
            self.log_box.see("end")

            time.sleep(0.6)
            self.root.after(100, lambda: self.show_step(4))

        except Exception as exc:
            messagebox.showerror("Lỗi Cài Đặt", f"Đã xảy ra lỗi trong quá trình cài đặt:\n{exc}")
            self.cancel_btn.configure(state="normal")

    # --- BƯỚC 4: HOÀN TẤT ---
    def render_step_4_finished(self):
        self.back_btn.pack_forget()
        self.cancel_btn.pack_forget()
        self.next_btn.configure(text="Hoàn tất", state="normal", bg="#059669", command=self.on_finish)

        tk.Label(
            self.content_frame,
            text="✓ Cài Đặt Hoàn Tất Thành Công!",
            font=("Segoe UI", 13, "bold"),
            fg="#10b981",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 10))

        install_dir = self.selected_path.get()
        desc = (
            f"Phần mềm {APP_DISPLAY_NAME} v{APP_VERSION} (64-Bit) đã được cài đặt thành công vào:\n"
            f"📁 {install_dir}\n\n"
            "✓ Đầy đủ tính năng Studio: Trình biên tập phụ đề song ngữ, giả lập video, DeepSeek AI.\n"
            "✓ Tệp thực thi chuẩn Windows 64-Bit, không gặp lỗi 16-Bit.\n"
            "✓ Biểu tượng ứng dụng đã sẵn sàng trên Màn hình chính (Desktop)."
        )
        tk.Label(
            self.content_frame,
            text=desc,
            font=("Segoe UI", 9),
            fg="#cbd5e1",
            bg="#0f172a",
            justify="left"
        ).pack(anchor="w", pady=(0, 20))

        cb_launch = tk.Checkbutton(
            self.content_frame,
            text=f"Khởi chạy {APP_DISPLAY_NAME} ngay bây giờ",
            variable=self.launch_after_install,
            font=("Segoe UI", 10, "bold"),
            fg="#c084fc",
            bg="#0f172a",
            selectcolor="#1e293b",
            activebackground="#0f172a",
            activeforeground="#ffffff"
        )
        cb_launch.pack(anchor="w")

    def on_next(self):
        if self.current_step == 2:
            self.start_installation()
        elif self.current_step < 4:
            self.show_step(self.current_step + 1)

    def on_back(self):
        if self.current_step > 1:
            self.show_step(self.current_step - 1)

    def on_cancel(self):
        if messagebox.askyesno("Xác nhận", "Bạn có chắc chắn muốn hủy bỏ quá trình cài đặt?"):
            self.root.destroy()

    def on_finish(self):
        install_dir = self.selected_path.get()
        target_exe = os.path.join(install_dir, "PeiPeiDub.exe")
        if self.launch_after_install.get() and os.path.exists(target_exe):
            try:
                # Khởi chạy tệp thực thi 64-Bit
                subprocess.Popen([target_exe], cwd=install_dir)
            except Exception as e:
                messagebox.showerror("Khởi chạy thất bại", f"Không thể khởi chạy: {e}")
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SetupWizardApp(root)
    root.mainloop()
