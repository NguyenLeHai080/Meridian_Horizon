import os
import sys

# Đảm bảo hỗ trợ UTF-8 output trên Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn

# Thêm thư mục backend vào sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("[INFO] Dang khoi chay Meridian Horizon API Server tren http://127.0.0.1:8000...")
    print("[INFO] Swagger UI Docs: http://127.0.0.1:8000/docs")
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )
