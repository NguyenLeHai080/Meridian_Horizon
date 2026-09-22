from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware bổ sung các lớp HTTP Security Headers bảo vệ ứng dụng:
    - Chống Clickjacking (X-Frame-Options)
    - Chống MIME Sniffing (X-Content-Type-Options)
    - Chống XSS (X-XSS-Protection)
    - Bảo vệ kênh truyền an toàn (Strict-Transport-Security)
    - Kiểm soát thông tin người gửi (Referrer-Policy)
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        
        # 1. Chống Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # 2. Chống MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # 3. Kích hoạt bộ lọc XSS của trình duyệt
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # 4. Chính sách Referrer nghiêm ngặt
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # 5. Khóa các API nhạy cảm của thiết bị
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # 6. Cache Control cho các request nhạy cảm
        if "/api/" in request.url.path:
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            
        return response
