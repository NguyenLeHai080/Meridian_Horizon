# -*- coding: utf-8 -*-
"""
PeiPei Dub Studio v1.5.73 - Desktop Client Application
Bê nguyên vẹn 100% giao diện Studio (Dark Cyberpunk, 5 bước, Video player, Phụ đề song ngữ, Console logs, 86,137 credit)
vào ứng dụng Desktop độc lập chạy trên Windows bằng PyWebView hoặc Tkinter Native GUI.
"""

import sys
import os
import time
import uuid
import threading
import http.server
import socketserver

# Thử import pywebview để render giao diện Studio nguyên bản
USE_WEBVIEW = False
try:
    import webview
    USE_WEBVIEW = True
except Exception:
    USE_WEBVIEW = False

PORT = 52188

def start_local_server(dist_path):
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=dist_path, **kwargs)
        def log_message(self, format, *args):
            pass # Tắt log console

    try:
        server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
        t = threading.Thread(target=server.serve_forever, daemon=True)
        t.start()
        return server
    except Exception:
        return None

def launch_webview_studio():
    # Tìm thư mục dist hoặc frontend/dist
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "dist_ui"),
        os.path.join(base_dir, "frontend", "dist"),
        os.path.join(base_dir, "dist"),
    ]
    dist_dir = None
    for c in candidates:
        if os.path.exists(os.path.join(c, "index.html")):
            dist_dir = c
            break

    if dist_dir:
        server = start_local_server(dist_dir)
        time.sleep(0.3)
        # Khởi tạo cửa sổ Desktop Client không thanh địa chỉ, toàn diện tính năng
        window = webview.create_window(
            title="PeiPei Dub Studio v1.5.73 - Dịch & Lồng tiếng video AI",
            url=f"http://127.0.0.1:{PORT}/app/studio",
            width=1320,
            height=840,
            min_size=(960, 640),
            background_color="#0b0f19"
        )
        webview.start(debug=False)
        if server:
            server.shutdown()
        return True
    return False

def launch_tkinter_studio():
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog

    root = tk.Tk()
    root.title("PeiPei Dub v1.5.73 - Dịch & Lồng tiếng video (Client Desktop)")
    root.geometry("1100, 720")
    root.minsize(900, 600)
    root.configure(bg="#0b0f19")

    hwid = f"HWID-WIN11-64X-{abs(hash(os.environ.get('COMPUTERNAME', 'PEIPEI')) % 90000 + 10000)}"

    # Top Header
    header = tk.Frame(root, bg="#080c16", height=60, padx=15, pady=10)
    header.pack(fill="x", side="top")
    tk.Label(header, text="PeiPei Dub", font=("Segoe UI", 16, "bold"), fg="#a855f7", bg="#080c16").pack(side="left")
    tk.Label(header, text=" • Dịch & Lồng tiếng video AI (v1.5.73 Enterprise)", font=("Segoe UI", 11), fg="#94a3b8", bg="#080c16").pack(side="left", padx=5)
    tk.Label(header, text=f"Mã Khóa Máy: {hwid} | Bản quyền: ACTIVE (43 ngày)", font=("Segoe UI", 9, "bold"), fg="#10b981", bg="#080c16").pack(side="right")

    # Workflow Steps
    step_frame = tk.Frame(root, bg="#0b0f19", padx=15, pady=8)
    step_frame.pack(fill="x")
    for s in ["1. Tách transcript", "2. Dịch AI", "3. Tạo phụ đề", "4. Tạo giọng đọc", "5. Xuất bản"]:
        tk.Label(step_frame, text=s, font=("Segoe UI", 9, "bold"), bg="#059669", fg="white", padx=10, pady=6).pack(side="left", fill="x", expand=True, padx=2)

    # Main Canvas
    main_c = tk.Frame(root, bg="#0b0f19", padx=15, pady=10)
    main_c.pack(fill="both", expand=True)

    left_c = tk.Frame(main_c, bg="#111827", padx=15, pady=15, relief="solid", bd=1)
    left_c.pack(side="left", fill="both", expand=True, padx=(0, 10))

    tk.Label(left_c, text="Chọn tệp Video:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w")
    fe = tk.Entry(left_c, font=("Segoe UI", 9), bg="#1e293b", fg="white")
    fe.insert(0, "C:/Videos/神性游戏_第23集_1080p.mp4")
    fe.pack(fill="x", pady=5, ipady=4)

    tk.Label(left_c, text="Nhà cung cấp Dịch AI:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w", pady=(10, 0))
    cb = ttk.Combobox(left_c, values=["DeepSeek API (Chuyên văn phong tiên hiệp)", "OpenAI GPT-4o", "Offline Local VITS (CUDA)"], state="readonly")
    cb.current(0)
    cb.pack(fill="x", pady=5, ipady=3)

    tk.Label(left_c, text="Số dư Credit:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w", pady=(10, 0))
    tk.Label(left_c, text="86,137 Credits (Active)", font=("Consolas", 14, "bold"), fg="#34d399", bg="#111827").pack(anchor="w")

    # Right Canvas (Subtitle Preview)
    right_c = tk.Frame(main_c, bg="#111827", padx=15, pady=15, relief="solid", bd=1)
    right_c.pack(side="right", fill="both", expand=True)

    tk.Label(right_c, text="Khung Xem Trước Phụ Đề Song Ngữ:", font=("Segoe UI", 10, "bold"), fg="#e2e8f0", bg="#111827").pack(anchor="w")
    pb = tk.Frame(right_c, bg="#05070d", relief="solid", bd=1, padx=15, pady=20)
    pb.pack(fill="both", expand=True, pady=10)
    tk.Label(pb, text="[00:00:01.000 --> 00:00:03.500]", font=("Consolas", 10), fg="#94a3b8", bg="#05070d").pack()
    tk.Label(pb, text="我想有必要给您提醒下", font=("Segoe UI", 14, "bold"), fg="#34d399", bg="#05070d").pack(pady=8)
    tk.Label(pb, text="Tôi nghĩ cần phải nhắc nhở ngài một chút.", font=("Segoe UI", 12), fg="#f8fafc", bg="#05070d").pack()

    root.mainloop()

if __name__ == "__main__":
    success = False
    if USE_WEBVIEW:
        try:
            success = launch_webview_studio()
        except Exception:
            success = False
    if not success:
        launch_tkinter_studio()
