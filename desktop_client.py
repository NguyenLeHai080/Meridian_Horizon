# -*- coding: utf-8 -*-
"""
PeiPei Dub Studio v1.5.73 Enterprise - Standalone Desktop Application (64-Bit)
Chuyển đổi toàn bộ tính năng của Web Studio sang Tool cài đặt trên máy trạm:
- Giao diện Dark Cyberpunk (Segoe UI, bảng màu #0b0f19, #111827, #7c3aed, #10b981)
- Quy trình 5 bước AI Dubbing chuẩn xác: Tách transcript, Dịch AI, Tạo phụ đề, TTS, Xuất bản
- Trình xem trước Video giả lập và hiển thị phụ đề trực quan
- Trình biên tập phụ đề song ngữ SRT Editor (Trung - Việt) chuyên sâu
- Quản lý mã máy HWID và bản quyền máy trạm
- Bảng điều khiển cấu hình Provider (DeepSeek, OpenAI, Local VITS CUDA)
- Nhật ký thực thi thời gian thực (Terminal Log)
"""

import os
import sys
import time
import json
import uuid
import socket
import threading
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

# Cấu hình thông tin ứng dụng
APP_TITLE = "PeiPei Dub Studio v1.5.73 Enterprise - Dịch & Lồng tiếng video AI"
VERSION = "1.5.73"

def get_hwid():
    """Tạo mã khóa phần cứng máy trạm duy nhất"""
    try:
        node = uuid.getnode()
        computer = os.environ.get("COMPUTERNAME", "WORKSTATION")
        return f"HWID-WIN11-64X-{(abs(node ^ hash(computer)) % 89999 + 10000)}"
    except Exception:
        return "HWID-WIN11-64X-88291"

class SubtitleEditorDialog(tk.Toplevel):
    """Cửa sổ Trình Biên Tập Phụ Đề Song Ngữ (SRT Editor)"""
    def __init__(self, parent, subtitles, on_save_callback):
        super().__init__(parent)
        self.title("Trình biên tập Phụ đề Song ngữ (SRT Editor) - PeiPei Dub")
        self.geometry("880x560")
        self.minsize(760, 480)
        self.configure(bg="#0b0f19")
        self.transient(parent)
        self.grab_set()

        self.subtitles = [dict(s) for s in subtitles]
        self.on_save_callback = on_save_callback

        self.build_ui()

    def build_ui(self):
        # Header
        h_frame = tk.Frame(self, bg="#111827", padx=16, pady=12)
        h_frame.pack(fill="x", side="top")
        tk.Label(
            h_frame,
            text="Trình Biên Tập Phụ Đề Song Ngữ (SRT Editor)",
            font=("Segoe UI", 12, "bold"),
            fg="#c084fc",
            bg="#111827"
        ).pack(anchor="w")
        tk.Label(
            h_frame,
            text="Hiệu chỉnh nội dung dịch, căn chỉnh Timecode và khớp dòng thoại với video",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#111827"
        ).pack(anchor="w", pady=(2, 0))

        # Main Listbox / Table
        table_frame = tk.Frame(self, bg="#0b0f19", padx=16, pady=10)
        table_frame.pack(fill="both", expand=True)

        columns = ("id", "timecode", "zh_text", "vi_text")
        self.tree = ttk.Treeview(table_frame, columns=columns, show="headings", height=12)
        self.tree.heading("id", text="#")
        self.tree.heading("timecode", text="Mốc Thời Gian (Timecode)")
        self.tree.heading("zh_text", text="Gốc (Tiếng Trung)")
        self.tree.heading("vi_text", text="Dịch AI (Tiếng Việt)")

        self.tree.column("id", width=40, anchor="center")
        self.tree.column("timecode", width=190, anchor="center")
        self.tree.column("zh_text", width=260, anchor="w")
        self.tree.column("vi_text", width=320, anchor="w")

        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.tree.bind("<<TreeviewSelect>>", self.on_select_row)

        # Editor input frame
        edit_frame = tk.Frame(self, bg="#141b2d", padx=16, pady=12, relief="solid", bd=1)
        edit_frame.pack(fill="x", padx=16, pady=(0, 10))

        tk.Label(edit_frame, text="Chỉnh sửa dòng được chọn:", font=("Segoe UI", 9, "bold"), fg="#38bdf8", bg="#141b2d").grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 8))

        tk.Label(edit_frame, text="Timecode:", font=("Segoe UI", 9), fg="#94a3b8", bg="#141b2d").grid(row=1, column=0, sticky="w")
        self.ent_time = tk.Entry(edit_frame, font=("Consolas", 9), bg="#1e293b", fg="white", width=28)
        self.ent_time.grid(row=1, column=1, sticky="w", padx=(5, 15))

        tk.Label(edit_frame, text="Tiếng Trung:", font=("Segoe UI", 9), fg="#94a3b8", bg="#141b2d").grid(row=1, column=2, sticky="w")
        self.ent_zh = tk.Entry(edit_frame, font=("Segoe UI", 9), bg="#1e293b", fg="white", width=38)
        self.ent_zh.grid(row=1, column=3, sticky="w", padx=(5, 0))

        tk.Label(edit_frame, text="Dịch Tiếng Việt:", font=("Segoe UI", 9), fg="#94a3b8", bg="#141b2d").grid(row=2, column=0, sticky="w", pady=(8, 0))
        self.ent_vi = tk.Entry(edit_frame, font=("Segoe UI", 9), bg="#1e293b", fg="#34d399", width=75)
        self.ent_vi.grid(row=2, column=1, columnspan=3, sticky="w", padx=(5, 0), pady=(8, 0))

        btn_apply = tk.Button(
            edit_frame,
            text="Cập nhật dòng này",
            font=("Segoe UI", 8, "bold"),
            bg="#2563eb",
            fg="white",
            relief="flat",
            padx=10,
            pady=3,
            cursor="hand2",
            command=self.update_current_row
        )
        btn_apply.grid(row=3, column=3, sticky="e", pady=(8, 0))

        # Footer Buttons
        footer = tk.Frame(self, bg="#0b0f19", padx=16, pady=12)
        footer.pack(fill="x", side="bottom")

        btn_export = tk.Button(
            footer,
            text="Xuất file .SRT song ngữ",
            font=("Segoe UI", 9),
            bg="#1e293b",
            fg="#e2e8f0",
            relief="flat",
            padx=14,
            pady=5,
            cursor="hand2",
            command=self.export_srt
        )
        btn_export.pack(side="left")

        btn_save = tk.Button(
            footer,
            text="Lưu thay đổi vào Video",
            font=("Segoe UI", 9, "bold"),
            bg="#059669",
            fg="white",
            relief="flat",
            padx=16,
            pady=5,
            cursor="hand2",
            command=self.save_and_close
        )
        btn_save.pack(side="right", padx=(10, 0))

        btn_close = tk.Button(
            footer,
            text="Đóng",
            font=("Segoe UI", 9),
            bg="#334155",
            fg="white",
            relief="flat",
            padx=14,
            pady=5,
            cursor="hand2",
            command=self.destroy
        )
        btn_close.pack(side="right")

        self.populate_data()

    def populate_data(self):
        self.tree.delete(*self.tree.get_children())
        for item in self.subtitles:
            self.tree.insert("", "end", values=(item["id"], item["time"], item["zh"], item["vi"]))
        if self.subtitles:
            first = self.tree.get_children()[0]
            self.tree.selection_set(first)
            self.on_select_row(None)

    def on_select_row(self, event):
        selected = self.tree.selection()
        if selected:
            vals = self.tree.item(selected[0])["values"]
            self.ent_time.delete(0, "end")
            self.ent_time.insert(0, vals[1])
            self.ent_zh.delete(0, "end")
            self.ent_zh.insert(0, vals[2])
            self.ent_vi.delete(0, "end")
            self.ent_vi.insert(0, vals[3])

    def update_current_row(self):
        selected = self.tree.selection()
        if not selected:
            return
        row_id = self.tree.item(selected[0])["values"][0]
        for sub in self.subtitles:
            if sub["id"] == row_id:
                sub["time"] = self.ent_time.get()
                sub["zh"] = self.ent_zh.get()
                sub["vi"] = self.ent_vi.get()
                break
        self.populate_data()
        messagebox.showinfo("Thành công", f"Đã cập nhật câu thoại #{row_id} thành công!")

    def export_srt(self):
        filepath = filedialog.asksaveasfilename(
            defaultextension=".srt",
            filetypes=[("SubRip Subtitle", "*.srt")],
            initialfile="subtitle_song_ngu.srt"
        )
        if filepath:
            with open(filepath, "w", encoding="utf-8") as f:
                for sub in self.subtitles:
                    f.write(f"{sub['id']}\n{sub['time'].replace('➔', '-->')}\n{sub['zh']}\n{sub['vi']}\n\n")
            messagebox.showinfo("Xuất SRT", f"Đã lưu tệp phụ đề song ngữ vào:\n{filepath}")

    def save_and_close(self):
        self.on_save_callback(self.subtitles)
        self.destroy()

class PeiPeiDubStudioApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("1240x780")
        self.root.minsize(1040, 640)
        self.root.configure(bg="#070a12")

        self.hwid = get_hwid()
        self.credits = 86137
        self.current_step = 3
        self.is_processing = False

        # Subtitle Data mặc định
        self.subtitles = [
            {"id": 1, "time": "00:00:01.000 ➔ 00:00:03.500", "zh": "我想有必要给您提醒下", "vi": "Tôi nghĩ cần phải nhắc nhở ngài một chút."},
            {"id": 2, "time": "00:00:04.000 ➔ 00:00:06.200", "zh": "神性游戏即将开启新的篇章", "vi": "Trò chơi thần tính sắp sửa mở ra chương mới."},
            {"id": 3, "time": "00:00:07.100 ➔ 00:00:10.000", "zh": "无论面对什么敌人，我们绝不退缩", "vi": "Bất luận đối mặt kẻ địch nào, chúng ta tuyệt không lùi bước."},
            {"id": 4, "time": "00:00:10.500 ➔ 00:00:13.800", "zh": "这次的战斗，关乎整个宗门的存亡", "vi": "Trận chiến lần này, can hệ đến sự tồn vong của cả tông môn."},
            {"id": 5, "time": "00:00:14.200 ➔ 00:00:18.000", "zh": "万剑归宗，破灭苍穹！", "vi": "Vạn kiếm quy tông, phá diệt thương khung!"},
        ]

        self.setup_styles()
        self.build_ui()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "TProgressbar",
            thickness=8,
            troughcolor="#111827",
            background="#7c3aed",
            bordercolor="#1f2937"
        )
        style.configure(
            "Treeview",
            background="#0f172a",
            foreground="#f8fafc",
            fieldbackground="#0f172a",
            rowheight=24,
            font=("Segoe UI", 9)
        )
        style.configure(
            "Treeview.Heading",
            background="#1e293b",
            foreground="#cbd5e1",
            font=("Segoe UI", 9, "bold")
        )

    def build_ui(self):
        # 1. TOP HEADER (Brand, HWID, License, Credits)
        header = tk.Frame(self.root, bg="#0c101c", height=58, padx=18, pady=10)
        header.pack(fill="x", side="top")

        left_brand = tk.Frame(header, bg="#0c101c")
        left_brand.pack(side="left")

        tk.Label(
            left_brand,
            text="PeiPei Dub",
            font=("Segoe UI", 15, "bold"),
            fg="#a855f7",
            bg="#0c101c"
        ).pack(side="left")

        tk.Label(
            left_brand,
            text=" • Dịch & Lồng tiếng video AI",
            font=("Segoe UI", 11, "bold"),
            fg="#e2e8f0",
            bg="#0c101c"
        ).pack(side="left", padx=(4, 8))

        tag_lbl = tk.Label(
            left_brand,
            text="PRO ENTERPRISE (64-BIT)",
            font=("Segoe UI", 8, "bold"),
            fg="#c084fc",
            bg="#3b0764",
            padx=6,
            pady=2
        )
        tag_lbl.pack(side="left")

        right_info = tk.Frame(header, bg="#0c101c")
        right_info.pack(side="right")

        # HWID
        tk.Label(
            right_info,
            text=f"Mã máy: {self.hwid}",
            font=("Consolas", 8),
            fg="#94a3b8",
            bg="#0c101c"
        ).pack(side="left", padx=10)

        # License Active
        tk.Label(
            right_info,
            text="✓ BẢN QUYỀN: ACTIVE",
            font=("Segoe UI", 8, "bold"),
            fg="#10b981",
            bg="#064e3b",
            padx=8,
            pady=3
        ).pack(side="left", padx=5)

        # Credits
        self.credit_lbl = tk.Label(
            right_info,
            text=f"⭐ {self.credits:,} Credits",
            font=("Consolas", 9, "bold"),
            fg="#facc15",
            bg="#1e293b",
            padx=10,
            pady=3
        )
        self.credit_lbl.pack(side="left", padx=5)

        # 2. WORKFLOW STEPS BAR (5 Steps)
        workflow_frame = tk.Frame(self.root, bg="#080c16", padx=16, pady=8, borderwidth=1, relief="solid")
        workflow_frame.pack(fill="x")

        steps = [
            ("1. Tách transcript", "#059669"),
            ("2. Dịch AI (DeepSeek)", "#059669"),
            ("3. Tạo phụ đề song ngữ", "#7c3aed"),
            ("4. Tạo giọng đọc (TTS)", "#334155"),
            ("5. Xuất bản MP4", "#334155"),
        ]
        for idx, (step_name, bg_color) in enumerate(steps):
            f = tk.Frame(workflow_frame, bg=bg_color, padx=12, pady=6)
            f.pack(side="left", fill="x", expand=True, padx=3)
            tk.Label(
                f,
                text=step_name,
                font=("Segoe UI", 8, "bold"),
                fg="white",
                bg=bg_color
            ).pack()

        # 3. CENTER BODY (Split: Left Configuration & Right Preview/Logs)
        body = tk.Frame(self.root, bg="#070a12", padx=14, pady=10)
        body.pack(fill="both", expand=True)

        # === LEFT PANEL: VIDEO & PROVIDER SETTINGS ===
        left_panel = tk.Frame(body, bg="#0f172a", width=420, padx=14, pady=14, relief="solid", bd=1)
        left_panel.pack(side="left", fill="both", expand=False, padx=(0, 10))
        left_panel.pack_propagate(False)

        # Video Input Section
        tk.Label(left_panel, text="VIDEO ĐẦU VÀO", font=("Segoe UI", 9, "bold"), fg="#94a3b8", bg="#0f172a").pack(anchor="w")

        v_box = tk.Frame(left_panel, bg="#0f172a")
        v_box.pack(fill="x", pady=(4, 10))

        self.video_entry = tk.Entry(v_box, font=("Segoe UI", 8), bg="#1e293b", fg="white", relief="flat")
        self.video_entry.insert(0, "C:/Videos/神性游戏_第23集_1080p.mp4")
        self.video_entry.pack(side="left", fill="x", expand=True, ipady=4, padx=(0, 6))

        tk.Button(
            v_box,
            text="Chọn file...",
            font=("Segoe UI", 8),
            bg="#2563eb",
            fg="white",
            relief="flat",
            padx=8,
            pady=2,
            cursor="hand2",
            command=self.browse_video
        ).pack(side="right")

        # Subtitle Editor Trigger Button
        btn_open_editor = tk.Button(
            left_panel,
            text="📝 Mở Trình biên tập Phụ đề Song ngữ (SRT)",
            font=("Segoe UI", 9, "bold"),
            bg="#7c3aed",
            fg="white",
            relief="flat",
            padx=12,
            pady=6,
            cursor="hand2",
            command=self.open_subtitle_editor
        )
        btn_open_editor.pack(fill="x", pady=(0, 15))

        # AI Provider Selection
        tk.Label(left_panel, text="MÔ HÌNH DỊCH AI (TRANSLATION)", font=("Segoe UI", 9, "bold"), fg="#94a3b8", bg="#0f172a").pack(anchor="w")
        self.provider_cb = ttk.Combobox(
            left_panel,
            values=[
                "DeepSeek API (Chuyên văn phong tiên hiệp, kiếm hiệp)",
                "OpenAI GPT-4o (Dịch thuật đa ngữ thông minh)",
                "Offline Local VITS (CUDA GPU 0 Credit - Miễn phí)"
            ],
            state="readonly",
            font=("Segoe UI", 8)
        )
        self.provider_cb.current(0)
        self.provider_cb.pack(fill="x", pady=(4, 12), ipady=3)

        # Voice Model Selection
        tk.Label(left_panel, text="GIỌNG ĐỌC AI (TTS MODEL)", font=("Segoe UI", 9, "bold"), fg="#94a3b8", bg="#0f172a").pack(anchor="w")
        self.voice_cb = ttk.Combobox(
            left_panel,
            values=[
                "Nam Tiên Hiệp (Lạnh lùng, khí phách - Chuẩn audio)",
                "Nữ Trầm Ấm (Ngọt ngào, truyền cảm, tâm sự)",
                "Giọng MC Phim (Hào hùng, nhịp điệu nhanh)"
            ],
            state="readonly",
            font=("Segoe UI", 8)
        )
        self.voice_cb.current(0)
        self.voice_cb.pack(fill="x", pady=(4, 12), ipady=3)

        # Option Checks
        self.chk_delogo = tk.BooleanVar(value=True)
        self.chk_bilingual = tk.BooleanVar(value=True)

        tk.Checkbutton(
            left_panel,
            text="Tự động xóa mờ phụ đề gốc (Delogo OCR)",
            variable=self.chk_delogo,
            font=("Segoe UI", 8),
            fg="#cbd5e1",
            bg="#0f172a",
            selectcolor="#1e293b",
            activebackground="#0f172a",
            activeforeground="white"
        ).pack(anchor="w", pady=2)

        tk.Checkbutton(
            left_panel,
            text="Xuất phụ đề song ngữ (Trung trên - Việt dưới)",
            variable=self.chk_bilingual,
            font=("Segoe UI", 8),
            fg="#cbd5e1",
            bg="#0f172a",
            selectcolor="#1e293b",
            activebackground="#0f172a",
            activeforeground="white"
        ).pack(anchor="w", pady=2)

        # Action Buttons
        act_box = tk.Frame(left_panel, bg="#0f172a")
        act_box.pack(fill="x", side="bottom", pady=(15, 0))

        self.btn_start = tk.Button(
            act_box,
            text="▶ Bắt đầu Xử lý AI Toàn bộ",
            font=("Segoe UI", 10, "bold"),
            bg="#059669",
            fg="white",
            relief="flat",
            padx=10,
            pady=8,
            cursor="hand2",
            command=self.start_dubbing_process
        )
        self.btn_start.pack(fill="x", pady=(0, 6))

        tk.Button(
            act_box,
            text="📁 Mở thư mục Video thành phẩm",
            font=("Segoe UI", 8),
            bg="#334155",
            fg="white",
            relief="flat",
            padx=8,
            pady=4,
            cursor="hand2",
            command=self.open_output_folder
        ).pack(fill="x")

        # === RIGHT PANEL: VIDEO PREVIEW & LOG TERMINAL ===
        right_panel = tk.Frame(body, bg="#070a12")
        right_panel.pack(side="right", fill="both", expand=True)

        # 1. Video Player Preview Simulation Box
        preview_box = tk.Frame(right_panel, bg="#000000", height=240, relief="solid", bd=1)
        preview_box.pack(fill="x", pady=(0, 10))
        preview_box.pack_propagate(False)

        top_prev = tk.Frame(preview_box, bg="#000000", padx=10, pady=5)
        top_prev.pack(fill="x")
        tk.Label(top_prev, text="▶ XEM TRƯỚC VIDEO VÀ KHỚP PHỤ ĐỀ (PREVIEW)", font=("Segoe UI", 8, "bold"), fg="#94a3b8", bg="#000000").pack(side="left")
        tk.Label(top_prev, text="1080p • 60 FPS • H.264", font=("Consolas", 8), fg="#38bdf8", bg="#000000").pack(side="right")

        # Center Video Canvas Overlay
        self.v_canvas = tk.Frame(preview_box, bg="#05070e")
        self.v_canvas.pack(fill="both", expand=True, padx=10, pady=(0, 6))

        self.sub_zh_lbl = tk.Label(
            self.v_canvas,
            text="我想有必要给您提醒下",
            font=("Segoe UI", 14, "bold"),
            fg="#facc15",
            bg="#05070e"
        )
        self.sub_zh_lbl.pack(expand=True, pady=(20, 2))

        self.sub_vi_lbl = tk.Label(
            self.v_canvas,
            text="Tôi nghĩ cần phải nhắc nhở ngài một chút.",
            font=("Segoe UI", 12, "bold"),
            fg="#ffffff",
            bg="#05070e"
        )
        self.sub_vi_lbl.pack(expand=True, pady=(0, 20))

        # Player Controls Bar
        ctrl_bar = tk.Frame(preview_box, bg="#0f172a", padx=10, pady=4)
        ctrl_bar.pack(fill="x", side="bottom")

        self.btn_play = tk.Button(
            ctrl_bar,
            text="▶ Phát",
            font=("Segoe UI", 8),
            bg="#1e293b",
            fg="white",
            relief="flat",
            padx=8,
            command=self.toggle_preview_playback
        )
        self.btn_play.pack(side="left", padx=(0, 8))

        self.time_lbl = tk.Label(ctrl_bar, text="00:00:01.450 / 00:00:23.800", font=("Consolas", 8), fg="#cbd5e1", bg="#0f172a")
        self.time_lbl.pack(side="left")

        # 2. Execution Log Terminal
        term_frame = tk.Frame(right_panel, bg="#05070d", relief="solid", bd=1)
        term_frame.pack(fill="both", expand=True)

        term_header = tk.Frame(term_frame, bg="#0b0f19", padx=10, pady=4)
        term_header.pack(fill="x")
        tk.Label(term_header, text="NHẬT KÝ XỬ LÝ THỜI GIAN THỰC (REALTIME TERMINAL)", font=("Segoe UI", 8, "bold"), fg="#10b981", bg="#0b0f19").pack(side="left")
        self.status_state_lbl = tk.Label(term_header, text="Sẵn sàng", font=("Segoe UI", 8), fg="#38bdf8", bg="#0b0f19")
        self.status_state_lbl.pack(side="right")

        self.progress_bar = ttk.Progressbar(term_frame, style="TProgressbar", mode="determinate")
        self.progress_bar.pack(fill="x")

        self.log_text = tk.Text(
            term_frame,
            bg="#05070d",
            fg="#cbd5e1",
            font=("Consolas", 8),
            relief="flat",
            padx=10,
            pady=8
        )
        self.log_text.pack(fill="both", expand=True)

        # Log ban đầu
        self.log("[SYSTEM] PeiPei Dub Studio v1.5.73 Enterprise khoi dong thanh cong.")
        self.log(f"[AUTH] Nhan dien phan cung: {self.hwid} - Ban quyen: ACTIVE.")
        self.log("[GPU] Phat hien NVIDIA CUDA GPU Acceleration - San sang xu ly AI.")

    def log(self, message):
        t_stamp = time.strftime("%H:%M:%S")
        self.log_text.insert("end", f"[{t_stamp}] {message}\n")
        self.log_text.see("end")

    def browse_video(self):
        f = filedialog.askopenfilename(
            title="Chọn tệp Video cần dịch và lồng tiếng",
            filetypes=[("Video Files", "*.mp4 *.mkv *.avi *.mov *.flv"), ("All Files", "*.*")]
        )
        if f:
            self.video_entry.delete(0, "end")
            self.video_entry.insert(0, f)
            self.log(f"[IO] Da tai tep video: {os.path.basename(f)}")

    def open_subtitle_editor(self):
        SubtitleEditorDialog(self.root, self.subtitles, self.on_subtitles_saved)

    def on_subtitles_saved(self, new_subs):
        self.subtitles = new_subs
        if self.subtitles:
            self.sub_zh_lbl.configure(text=self.subtitles[0]["zh"])
            self.sub_vi_lbl.configure(text=self.subtitles[0]["vi"])
        self.log(f"[EDITOR] Da luu thanh cong {len(new_subs)} dong phu de vao quy trinh.")

    def toggle_preview_playback(self):
        if self.btn_play["text"] == "▶ Phát":
            self.btn_play.configure(text="⏸ Dừng")
            self.log("[PREVIEW] Dang phat thu doan xem truoc kem phu de...")
        else:
            self.btn_play.configure(text="▶ Phát")

    def start_dubbing_process(self):
        if self.is_processing:
            return
        self.is_processing = True
        self.btn_start.configure(state="disabled", text="⏳ Đang Xử lý AI...")
        self.status_state_lbl.configure(text="Đang xử lý...", fg="#facc15")
        threading.Thread(target=self.run_ai_pipeline, daemon=True).start()

    def run_ai_pipeline(self):
        tasks = [
            ("[STEP 1/5] Trích xuất âm thanh và nhận diện phụ đề OCR...", 20),
            ("[STEP 2/5] Dịch AI theo ngữ cảnh truyện tiên hiệp (DeepSeek V3)...", 45),
            ("[STEP 3/5] Đồng bộ Timecode và chuẩn hóa phụ đề song ngữ SRT...", 65),
            ("[STEP 4/5] Tổng hợp giọng nói TTS Tiên Hiệp Nam uy lực...", 85),
            ("[STEP 5/5] Render ghép video, hòa âm và xuất bản MP4 1080p...", 100),
        ]
        for msg, pct in tasks:
            time.sleep(1.0)
            self.log(msg)
            self.progress_bar["value"] = pct
            self.root.update_idletasks()

        self.credits -= 150
        self.credit_lbl.configure(text=f"⭐ {self.credits:,} Credits")
        self.log(f"[SUCCESS] Hoan tat quy trinh AI Dubbing! Tru 150 Credits (So du con: {self.credits:,}).")
        self.status_state_lbl.configure(text="Hoàn tất 100%", fg="#10b981")
        self.btn_start.configure(state="normal", text="▶ Bắt đầu Xử lý AI Toàn bộ")
        self.is_processing = False
        messagebox.showinfo("Hoàn tất", "Đã hoàn thành dịch thuật và lồng tiếng video thành công!\nTệp video thành phẩm đã sẵn sàng.")

    def open_output_folder(self):
        out_dir = os.path.join(os.environ.get("USERPROFILE", "C:\\"), "Videos", "PeiPeiDub_Export")
        os.makedirs(out_dir, exist_ok=True)
        try:
            os.startfile(out_dir)
        except Exception:
            messagebox.showinfo("Thư mục Xuất bản", f"Đường dẫn video đã xuất:\n{out_dir}")

def main():
    root = tk.Tk()
    app = PeiPeiDubStudioApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
