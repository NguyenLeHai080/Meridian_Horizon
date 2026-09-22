import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware chống spam và Brute-force attacks:
    - Giới hạn tần suất request theo IP (Sliding Window Algorithm)
    - Phân tách ngưỡng cho API chung (100 req/min) và API Auth/Login (15 req/min)
    """
    def __init__(self, app, general_limit: int = 120, auth_limit: int = 20, window_seconds: int = 60):
        super().__init__(app)
        self.general_limit = general_limit
        self.auth_limit = auth_limit
        self.window_seconds = window_seconds
        self.request_history: Dict[str, List[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

    async def dispatch(self, request: Request, call_next):
        # Bỏ qua Swagger Docs và OpenAPI specs
        path = request.url.path
        if path in ["/docs", "/redoc", "/openapi.json", "/favicon.ico"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Phân loại giới hạn
        is_auth_route = "/api/v1/auth" in path
        limit = self.auth_limit if is_auth_route else self.general_limit
        key = f"{client_ip}:auth" if is_auth_route else f"{client_ip}:general"

        # Lọc các request trong cửa sổ thời gian
        history = self.request_history[key]
        self.request_history[key] = [t for t in history if current_time - t < self.window_seconds]

        # Kiểm tra vượt ngưỡng
        if len(self.request_history[key]) >= limit:
            retry_after = int(self.window_seconds - (current_time - self.request_history[key][0]))
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "status_code": 429,
                    "message": "Phát hiện tần suất gửi yêu cầu quá nhanh (Anti-Spam). Vui lòng thử lại sau.",
                    "errors": {
                        "retry_after_seconds": max(1, retry_after),
                        "limit": limit,
                        "window_seconds": self.window_seconds
                    }
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )

        # Ghi nhận request hợp lệ
        self.request_history[key].append(current_time)
        return await call_next(request)
