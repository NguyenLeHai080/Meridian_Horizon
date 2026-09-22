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
import io
import time
import socket
import threading
import http.server
import socketserver
import subprocess

# Khắc phục triệt để lỗi PyInstaller --noconsole trên Windows (sys.stdout/stderr là None)
if getattr(sys, 'stdout', None) is None:
    sys.stdout = io.StringIO()
if getattr(sys, 'stderr', None) is None:
    sys.stderr = io.StringIO()

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
        candidates = [
            os.path.join(base_dir, 'frontend', 'dist'),
            os.path.join(base_dir, 'dist'),
            base_dir,
            os.path.join(os.path.dirname(sys.executable), 'frontend', 'dist'),
            os.path.join(os.path.dirname(sys.executable), 'dist'),
        ]
        for c in candidates:
            if os.path.exists(os.path.join(c, 'index.html')):
                return c
        
        # Tìm kiếm đệ quy nếu thư mục nằm ở cấp khác
        for root, dirs, files in os.walk(base_dir):
            if 'index.html' in files:
                return root

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
    log_file = os.path.join(os.environ.get('TEMP', os.path.dirname(os.path.abspath(__file__))), 'peipei_client.log')
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"\n====================\nMain entry at {time.strftime('%Y-%m-%d %H:%M:%S')}\nExecutable: {sys.executable}\nFrozen: {getattr(sys, 'frozen', False)}\nMEIPASS: {getattr(sys, '_MEIPASS', 'None')}\n")
    except Exception:
        pass

    dist_dir = get_dist_directory()
    port = find_free_port()

    server = None
    if dist_dir and os.path.exists(dist_dir):
        try:
            server = start_spa_server(dist_dir, port)
        except Exception as se:
            try:
                with open(log_file, 'a', encoding='utf-8') as f:
                    f.write(f"Error starting server: {se}\n")
            except Exception:
                pass

    url = f"http://127.0.0.1:{port}/tool"

    log_file = os.path.join(os.environ.get('TEMP', os.path.dirname(os.path.abspath(__file__))), 'peipei_client.log')
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"\n--- KHỞI CHẠY {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        f.write(f"Frozen: {getattr(sys, 'frozen', False)}\n")
        f.write(f"Dist dir: {dist_dir}\n")
        f.write(f"Port: {port}\n")
        f.write(f"URL: {url}\n")

    # Cấu hình thư mục lưu trữ dữ liệu WebView2 an toàn (tránh lỗi quyền ghi Program Files)
    webview_data_dir = os.path.join(os.environ.get('LOCALAPPDATA', os.environ.get('TEMP', '.')), 'PeiPeiDub', 'WebView2Data')
    try:
        os.makedirs(webview_data_dir, exist_ok=True)
    except Exception:
        pass

    # Thử khởi chạy với PyWebView (Microsoft Edge WebView2 Engine)
    webview_success = False
    try:
        import webview
        try:
            webview.settings['USER_DATA_FOLDER'] = webview_data_dir
        except Exception:
            pass

        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"Webview loaded from: {getattr(webview, '__file__', 'unknown')}\n")

        # Tạo cửa sổ Desktop Ứng dụng chuẩn Windows
        window = webview.create_window(
            title=APP_TITLE,
            url=url,
            width=1340,
            height=840,
            min_size=(1040, 680),
            background_color="#070a12",
            focus=True
        )
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write("Window created successfully, calling webview.start()...\n")
        webview.start(debug=False)
        webview_success = True
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write("webview.start() finished normally\n")
    except Exception as exc:
        webview_success = False
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"ERROR in pywebview: {exc}\n")
            import traceback
            traceback.print_exc(file=f)

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
    try:
        main()
    except Exception as e:
        log_file = os.path.join(os.environ.get('TEMP', os.path.dirname(os.path.abspath(__file__))), 'peipei_client.log')
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"\nCRITICAL TOP-LEVEL EXCEPTION: {e}\n")
                import traceback
                traceback.print_exc(file=f)
        except Exception:
            pass
