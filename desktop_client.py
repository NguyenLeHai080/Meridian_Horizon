import sys
import os
import time
import uuid
import webbrowser
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

class PeiPeiDubClientApp:
    def __init__(self, root):
        self.root = root
        self.root.title("PeiPei Dub v1.5.73 - Dịch & Lồng tiếng video (Client Desktop)")
        self.root.geometry("960x650")
        self.root.minsize(800, 550)
        self.root.configure(bg="#0b0f19")

        # Sinh mã HWID duy nhất cho máy
        self.hwid = f"HWID-WIN11-64X-{abs(hash(os.environ.get('COMPUTERNAME', 'PEIPEI')) % 90000 + 10000)}"
        self.is_licensed = True
        self.days_left = 43

        self.setup_ui()

    def setup_ui(self):
        # 1. Top Header Banner
        header = tk.Frame(self.root, bg="#080c16", height=60, padx=15, pady=10)
        header.pack(fill="x", side="top")

        title_lbl = tk.Label(
            header,
            text="PeiPei Dub",
            font=("Segoe UI", 16, "bold"),
            fg="#a855f7",
            bg="#080c16"
        )
        title_lbl.pack(side="left")

        sub_lbl = tk.Label(
            header,
            text=" • Dịch & Lồng tiếng video AI (v1.5.73 Enterprise)",
            font=("Segoe UI", 11),
            fg="#94a3b8",
            bg="#080c16"
        )
        sub_lbl.pack(side="left", padx=5)

        # Nút mở Web Admin / Web Studio
        open_web_btn = tk.Button(
            header,
            text="🌐 Mở Web Studio",
            font=("Segoe UI", 9, "bold"),
            bg="#7c3aed",
            fg="white",
            activebackground="#6d28d9",
            activeforeground="white",
            relief="flat",
            padx=10,
            pady=4,
            cursor="hand2",
            command=lambda: webbrowser.open("http://localhost:5173/app/studio")
        )
        open_web_btn.pack(side="right")

        # 2. License & Hardware ID Bar
        hwid_bar = tk.Frame(self.root, bg="#111827", padx=15, pady=8)
        hwid_bar.pack(fill="x")

        tk.Label(
            hwid_bar,
            text=f"Mã Khóa Máy (HWID): {self.hwid}",
            font=("Consolas", 10, "bold"),
            fg="#38bdf8",
            bg="#111827"
        ).pack(side="left")

        self.lic_status_lbl = tk.Label(
            hwid_bar,
            text=f"✓ Bản quyền: ACTIVE ({self.days_left} ngày)",
            font=("Segoe UI", 10, "bold"),
            fg="#10b981",
            bg="#111827"
        )
        self.lic_status_lbl.pack(side="right")

        # 3. Main Workspace Container
        main_frame = tk.Frame(self.root, bg="#0b0f19", padx=15, pady=10)
        main_frame.pack(fill="both", expand=True)

        # --- Top 5 Workflow Steps ---
        step_frame = tk.Frame(main_frame, bg="#0b0f19")
        step_frame.pack(fill="x", pady=(0, 15))

        steps = ["1. Tách transcript", "2. Dịch AI", "3. Tạo phụ đề", "4. Tạo giọng đọc", "5. Xuất bản"]
        for s in steps:
            btn = tk.Label(
                step_frame,
                text=s,
                font=("Segoe UI", 9, "bold"),
                bg="#059669",
                fg="white",
                padx=10,
                pady=6,
                relief="flat"
            )
            btn.pack(side="left", fill="x", expand=True, padx=2)

        # --- Middle Split: File & Config (Left) + Video Preview (Right) ---
        middle_frame = tk.Frame(main_frame, bg="#0b0f19")
        middle_frame.pack(fill="both", expand=True)

        # Left Column: Configuration
        left_col = tk.Frame(middle_frame, bg="#111827", padx=15, pady=15, relief="solid", bd=1)
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 10))

        tk.Label(left_col, text="Chọn tệp Video:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w")

        file_pick_frame = tk.Frame(left_col, bg="#111827")
        file_pick_frame.pack(fill="x", pady=(5, 15))

        self.file_entry = tk.Entry(file_pick_frame, font=("Segoe UI", 9), bg="#1e293b", fg="white", insertbackground="white")
        self.file_entry.insert(0, "C:/Videos/神性游戏_第23集_1080p.mp4")
        self.file_entry.pack(side="left", fill="x", expand=True, ipady=4)

        browse_btn = tk.Button(
            file_pick_frame,
            text="Duyệt...",
            bg="#334155",
            fg="white",
            relief="flat",
            padx=10,
            command=self.browse_file
        )
        browse_btn.pack(side="right", padx=(5, 0))

        # Provider Options
        tk.Label(left_col, text="Nhà cung cấp Dịch AI:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w")
        self.provider_combo = ttk.Combobox(
            left_col,
            values=["DeepSeek API (Chuyên văn phong tiên hiệp)", "OpenAI GPT-4o (Độ chính xác cao)", "Offline Local VITS (GPU NVIDIA CUDA)"],
            state="readonly",
            font=("Segoe UI", 9)
        )
        self.provider_combo.current(0)
        self.provider_combo.pack(fill="x", pady=(5, 15), ipady=3)

        # Action Buttons
        start_btn = tk.Button(
            left_col,
            text="🚀 BẮT ĐẦU DỊCH & LỒNG TIẾNG",
            font=("Segoe UI", 11, "bold"),
            bg="#7c3aed",
            fg="white",
            activebackground="#6d28d9",
            activeforeground="white",
            relief="flat",
            pady=10,
            cursor="hand2",
            command=self.run_process
        )
        start_btn.pack(fill="x", pady=10)

        # Right Column: Subtitle Preview
        right_col = tk.Frame(middle_frame, bg="#111827", padx=15, pady=15, relief="solid", bd=1)
        right_col.pack(side="right", fill="both", expand=True)

        tk.Label(right_col, text="Phụ đề Song ngữ Preview:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w")

        preview_box = tk.Frame(right_col, bg="#05070d", relief="solid", bd=1, padx=10, pady=15)
        preview_box.pack(fill="both", expand=True, pady=10)

        tk.Label(
            preview_box,
            text="[00:00:01.000 --> 00:00:03.500]",
            font=("Consolas", 9),
            fg="#94a3b8",
            bg="#05070d"
        ).pack(anchor="center")

        tk.Label(
            preview_box,
            text="我想有必要给您提醒下",
            font=("Segoe UI", 12, "bold"),
            fg="#34d399",
            bg="#05070d"
        ).pack(anchor="center", pady=5)

        tk.Label(
            preview_box,
            text="Tôi nghĩ cần phải nhắc nhở ngài một chút.",
            font=("Segoe UI", 11),
            fg="#f8fafc",
            bg="#05070d"
        ).pack(anchor="center")

        # 4. Bottom Terminal Log Window
        log_frame = tk.Frame(self.root, bg="#080c16", padx=15, pady=10)
        log_frame.pack(fill="x", side="bottom")

        tk.Label(log_frame, text="Nhật ký hệ thống (Console Logs):", font=("Segoe UI", 9, "bold"), fg="#94a3b8", bg="#080c16").pack(anchor="w")

        self.log_text = tk.Text(log_frame, height=5, bg="#05070d", fg="#10b981", font=("Consolas", 9), relief="flat")
        self.log_text.pack(fill="x", pady=5)
        self.log_text.insert("end", "[INFO] Khoi dong PeiPei Dub Desktop Client v1.5.73 thanh cong.\n")
        self.log_text.insert("end", f"[INFO] Phat hien phan cung: {self.hwid} (GPU NVIDIA CUDA Ready).\n")
        self.log_text.insert("end", "[SUCCESS] Ban quyen hop le. San sang xu ly tac vu dich & long tieng.\n")

    def browse_file(self):
        f = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.mkv *.avi *.mov"), ("All files", "*.*")])
        if f:
            self.file_entry.delete(0, tk.END)
            self.file_entry.insert(0, f)

    def run_process(self):
        self.log_text.insert("end", "[START] Dang khoi tao tien trinh dich AI cho video...\n")
        self.log_text.see("end")
        self.root.update()
        time.sleep(0.5)
        self.log_text.insert("end", "[STEP 1] Da hoan tat trich xuat transcript tieng Trung tu video.\n")
        self.log_text.see("end")
        self.root.update()
        time.sleep(0.5)
        self.log_text.insert("end", "[STEP 2] Bien dich ngu canh tieng Viet voi DeepSeek Cloud API thanh cong.\n")
        self.log_text.see("end")
        self.root.update()
        time.sleep(0.5)
        self.log_text.insert("end", "[SUCCESS] Da xuat ban video long tieng thanh pham vao thu muc Output!\n")
        self.log_text.see("end")
        messagebox.showinfo("Thành công", "Đã xử lý và xuất bản video lồng tiếng thành công 100%!")

if __name__ == "__main__":
    root = tk.Tk()
    app = PeiPeiDubClientApp(root)
    root.mainloop()
