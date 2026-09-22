# -*- coding: utf-8 -*-
"""
PeiPei Dub v1.5.73 Enterprise - Modern Desktop Application (64-Bit)
Chạy trực tiếp giao diện Web Studio hiện đại (React 18 + TailwindCSS + Lucide Icons)
thông qua Microsoft Edge Chromium WebView2 engine, mang lại trải nghiệm phần mềm máy trạm cao cấp:
- Linh vật Panda PeiPei đặc trưng
- Quy trình 5 bước AI Dubbing chuẩn xác
- Khung xem trước video & phụ đề OCR bounding box
- Trình biên tập phụ đề song ngữ SRT Editor
- Hộp thoại Kích hoạt Bản quyền HWID liên kết trực tuyến
"""

import os
import sys
import time
import socket
import threading
import http.server
import socketserver
import subprocess

APP_TITLE = "PeiPei Dub 1.5.73 - Dịch & lồng tiếng video"
VERSION = "1.5.73"

def find_free_port():
    """Tìm cổng socket khả dụng tự do trên máy trạm"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def get_dist_directory():
    """Lấy đường dẫn thư mục giao diện tĩnh đã build (frontend/dist)"""
    # 1. Nếu đang chạy trong môi trường PyInstaller frozen
    if getattr(sys, 'frozen', False):
        base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
        c1 = os.path.join(base_dir, 'frontend', 'dist')
        c2 = os.path.join(base_dir, 'dist')
        if os.path.exists(os.path.join(c1, 'index.html')):
            return c1
        if os.path.exists(os.path.join(c2, 'index.html')):
            return c2
        if os.path.exists(os.path.join(base_dir, 'index.html')):
            return base_dir

    # 2. Môi trường phát triển cục bộ
    root_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(root_dir, 'frontend', 'dist'),
        os.path.join(root_dir, 'dist'),
        os.path.join(root_dir, 'frontend_dist'),
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, 'index.html')):
            return c

    return None

class SPAHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Handler phục vụ Single Page Application (React Router HTML5 PushState)"""
    def do_GET(self):
        # Kiểm tra xem đường dẫn có trỏ tới file tĩnh thực sự không
        full_path = self.translate_path(self.path)
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            self.path = '/index.html'
        return super().do_GET()

    def log_message(self, format, *args):
        # Tắt log để giữ terminal sạch sẽ
        pass

from functools import partial

def start_spa_server(dist_path, port):
    """Khởi chạy máy chủ HTTP tĩnh nội bộ phục vụ giao diện React"""
    handler = partial(SPAHTTPHandler, directory=dist_path)
    server = socketserver.TCPServer(('127.0.0.1', port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

def main():
    dist_dir = get_dist_directory()
    port = find_free_port()

    server = None
    if dist_dir and os.path.exists(dist_dir):
        try:
            server = start_spa_server(dist_dir, port)
        except Exception:
            pass

    url = f"http://127.0.0.1:{port}/tool"

    # Thử khởi chạy với PyWebView (Microsoft Edge WebView2 Engine)
    webview_success = False
    try:
        import webview
        # Tạo cửa sổ Desktop Ứng dụng hiện đại
        window = webview.create_window(
            title=APP_TITLE,
            url=url,
            width=1340,
            height=840,
            min_size=(1040, 680),
            background_color="#070a12",
            easy_drag=True
        )
        webview.start(debug=False)
        webview_success = True
    except Exception as exc:
        webview_success = False

    # Nếu PyWebView không khả dụng (môi trường không có WebView2)
    if not webview_success:
        try:
            import webbrowser
            webbrowser.open(url)
            # Giữ server chạy ngầm khi mở bằng trình duyệt
            while True:
                time.sleep(1)
        except Exception:
            pass

    # Dọn dẹp máy chủ khi đóng cửa sổ
    if server:
        try:
            server.shutdown()
        except Exception:
            pass

if __name__ == "__main__":
    main()
