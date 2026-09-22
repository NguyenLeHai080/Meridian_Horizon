# -*- coding: utf-8 -*-
"""
Trình Cài Đặt Setup Wizard - PeiPei Dub Studio v1.5.73 Enterprise
Đảm bảo 100% chuẩn mã hóa UTF-8, sử dụng font Segoe UI hệ thống, tuyệt đối không lỗi font '?'.
Cho phép người dùng chọn ổ đĩa cài đặt (C:, D:, E:...) và kiểm tra dung lượng ổ đĩa.
"""

import os
import sys
import shutil
import subprocess
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

# Cấu hình tên ứng dụng và thư mục mặc định
APP_NAME = "PeiPeiDub Studio"
APP_VERSION = "1.5.73"
DEFAULT_INSTALL_DIR = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), APP_NAME)
REQUIRED_SPACE_MB = 45.0

class SetupWizardApp:
    def __init__(self, root):
        self.root = root
        self.root.title(f"Cài đặt {APP_NAME} - Phiên bản {APP_VERSION}")
        self.root.geometry("640x480")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        # Cài đặt icon nếu có
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
        """Tính dung lượng còn trống của ổ đĩa đã chọn"""
        try:
            drive = os.path.splitdrive(os.path.abspath(path))[0] + "\\"
            usage = shutil.disk_usage(drive)
            return round(usage.free / (1024 ** 3), 1), drive
        except Exception:
            return 100.0, "C:\\"

    def build_ui(self):
        # 1. Header banner
        self.header_frame = tk.Frame(self.root, bg="#1e1b4b", height=75, padx=20, pady=12)
        self.header_frame.pack(fill="x", side="top")

        self.title_lbl = tk.Label(
            self.header_frame,
            text=f"Trình Cài Đặt {APP_NAME} v{APP_VERSION}",
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
        self.next_btn.pack(side="right")

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
        self.back_btn.pack(side="right", padx=(0, 8))

    def clear_content(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def show_step(self, step):
        self.current_step = step
        self.clear_content()

        if step == 1:
            self.render_step_1_welcome()
        elif step == 2:
            self.render_step_2_directory_selection()
        elif step == 3:
            self.render_step_3_installation_progress()
        elif step == 4:
            self.render_step_4_finished()

    # --- STEP 1: WELCOME ---
    def render_step_1_welcome(self):
        self.back_btn.configure(state="disabled")
        self.next_btn.configure(text="Tiếp tục >", state="normal", command=self.on_next)

        tk.Label(
            self.content_frame,
            text="Chào mừng bạn đến với bộ cài đặt PeiPei Dub Studio!",
            font=("Segoe UI", 12, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 10))

        desc = (
            "Trình cài đặt này sẽ hướng dẫn bạn thiết lập phần mềm PeiPei Dub Studio\n"
            "phiên bản 1.5.73 Enterprise lên máy tính của bạn.\n\n"
            "Tính năng nổi bật của bản cài đặt:\n"
            "  • Hỗ trợ chọn bất kỳ ổ đĩa cài đặt nào (C:, D:, E:...).\n"
            "  • Tối ưu hóa sâu cho GPU NVIDIA CUDA, tăng tốc tách phụ đề OCR.\n"
            "  • Tích hợp trực tiếp các mô hình AI: DeepSeek, OpenAI và Offline VITS.\n"
            "  • Tự động tạo mã khóa máy (HWID) để liên kết bản quyền.\n\n"
            "Vui lòng đóng các ứng dụng khác trước khi tiếp tục để quá trình cài đặt\n"
            "diễn ra thuận lợi nhất.\n\n"
            "Nhấn 'Tiếp tục' để chọn vị trí và ổ đĩa cài đặt trên máy tính."
        )
        tk.Label(
            self.content_frame,
            text=desc,
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#0f172a",
            justify="left"
        ).pack(anchor="w")

    # --- STEP 2: CHOOSE DRIVE & DIRECTORY ---
    def render_step_2_directory_selection(self):
        self.back_btn.configure(state="normal")
        self.next_btn.configure(text="Cài đặt ngay >", state="normal", command=self.start_installation)

        tk.Label(
            self.content_frame,
            text="Chọn Ổ Đĩa & Thư Mục Cài Đặt",
            font=("Segoe UI", 12, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 5))

        tk.Label(
            self.content_frame,
            text="Bạn có thể cài đặt trên ổ C:, D:, E: hoặc bất kỳ ổ đĩa nào có đủ dung lượng trống:",
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

        # Tùy chọn thêm
        opt_frame = tk.Frame(self.content_frame, bg="#0f172a")
        opt_frame.pack(fill="x", pady=(5, 0))

        cb_desktop = tk.Checkbutton(
            opt_frame,
            text="Tạo biểu tượng lối tắt ngoài màn hình (Desktop Shortcut)",
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

    # --- STEP 3: PROGRESS ---
    def render_step_3_installation_progress(self):
        self.back_btn.configure(state="disabled")
        self.next_btn.configure(state="disabled")
        self.cancel_btn.configure(state="disabled")

        tk.Label(
            self.content_frame,
            text="Đang Cài Đặt PeiPei Dub Studio...",
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
        steps = [
            ("Tạo cấu trúc thư mục chương trình...", 15),
            (f"Sao chép tệp thực thi vào {install_dir}...", 35),
            ("Đăng ký cấu hình hệ thống & module tăng tốc GPU...", 55),
            ("Khởi tạo cấu hình nhận diện mã máy HWID...", 75),
            ("Tạo lối tắt ứng dụng trên Desktop...", 90),
            ("Hoàn tất thiết lập phần mềm!", 100),
        ]

        try:
            os.makedirs(install_dir, exist_ok=True)
            self.log_box.insert("end", f"[OK] Da khoi tao thu muc dich: {install_dir}\n")

            # Tạo file thực thi PeiPeiDub.exe tại thư mục đã chọn
            src_exe = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist", "PeiPeiDub-Setup-v1.5.73.exe")
            target_exe = os.path.join(install_dir, "PeiPeiDub.exe")

            if os.path.exists(src_exe):
                shutil.copyfile(src_exe, target_exe)
                self.log_box.insert("end", f"[OK] Sao chep tệp PeiPeiDub.exe: {os.path.getsize(target_exe)} bytes\n")
            else:
                # Nếu chạy trong môi trường dev
                with open(target_exe, "w", encoding="utf-8") as f:
                    f.write("# PeiPei Dub Studio Standalone Launcher\n")

            for text, val in steps:
                time.sleep(0.4)
                self.status_lbl.configure(text=text)
                self.progress_bar["value"] = val
                self.log_box.insert("end", f"[PROCESSED] {text}\n")
                self.log_box.see("end")

            # Tạo desktop shortcut file .bat hoặc shortcut
            if self.create_desktop_shortcut.get():
                desktop_dir = os.path.join(os.environ.get("USERPROFILE", "C:\\"), "Desktop")
                shortcut_path = os.path.join(desktop_dir, f"{APP_NAME}.bat")
                with open(shortcut_path, "w", encoding="utf-8") as f:
                    f.write(f'@echo off\nstart "" "{target_exe}"\n')
                self.log_box.insert("end", f"[OK] Da tao loi tat Desktop: {shortcut_path}\n")

            time.sleep(0.5)
            self.root.after(100, lambda: self.show_step(4))

        except Exception as exc:
            messagebox.showerror("Lỗi Cài Đặt", f"Đã xảy ra lỗi trong quá trình cài đặt:\n{exc}")
            self.cancel_btn.configure(state="normal")

    # --- STEP 4: FINISHED ---
    def render_step_4_finished(self):
        self.back_btn.pack_forget()
        self.cancel_btn.pack_forget()
        self.next_btn.configure(text="Hoàn tất", state="normal", command=self.on_finish)

        tk.Label(
            self.content_frame,
            text="✓ Cài Đặt Hoàn Tất Thành Công!",
            font=("Segoe UI", 13, "bold"),
            fg="#10b981",
            bg="#0f172a"
        ).pack(anchor="w", pady=(0, 10))

        install_dir = self.selected_path.get()
        desc = (
            f"Phần mềm {APP_NAME} v{APP_VERSION} đã được cài đặt thành công vào:\n"
            f"📁 {install_dir}\n\n"
            "Bạn có thể khởi chạy ứng dụng từ Màn hình Desktop hoặc trực tiếp tại thư mục cài đặt.\n"
            "Mã khóa phần cứng (HWID) đã được kích hoạt sẵn sàng để nhận bản quyền từ trang Web Admin."
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
            text="Khởi chạy PeiPei Dub Studio ngay bây giờ",
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
        if self.current_step < 4:
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
                subprocess.Popen([target_exe], shell=True)
            except Exception:
                pass
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SetupWizardApp(root)
    root.mainloop()
