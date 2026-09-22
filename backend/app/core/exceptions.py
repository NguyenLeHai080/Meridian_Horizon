from typing import Any, Optional

class AppException(Exception):
    """Base Application Exception"""
    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        status_code: int = 500,
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

class DatabaseConnectionException(AppException):
    """Raised when the database connection fails or drops"""
    def __init__(self, message: str = "Không thể kết nối đến máy chủ cơ sở dữ liệu. Vui lòng thử lại sau.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=503, details=details)

class EntityNotFoundException(AppException):
    """Raised when a requested resource is not found"""
    def __init__(self, message: str = "Tài nguyên yêu cầu không tồn tại.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=404, details=details)

class UnauthorizedException(AppException):
    """Raised when authentication fails or token is invalid"""
    def __init__(self, message: str = "Thông tin xác thực không hợp lệ hoặc phiên đăng nhập đã hết hạn.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=401, details=details)

class ForbiddenException(AppException):
    """Raised when user doesn't have required permissions"""
    def __init__(self, message: str = "Bạn không có quyền thực hiện thao tác này.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=403, details=details)

class ConflictException(AppException):
    """Raised on state conflict, such as duplicate user email"""
    def __init__(self, message: str = "Dữ liệu bị trùng lặp hoặc xung đột trạng thái.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=409, details=details)

class RateLimitException(AppException):
    """Raised when requests exceed quota / anti-spam limit"""
    def __init__(self, message: str = "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=429, details=details)
