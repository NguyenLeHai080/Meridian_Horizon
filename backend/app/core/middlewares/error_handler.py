import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.exceptions import AppException, DatabaseConnectionException
from app.core.response import APIResponse

logger = logging.getLogger("meridian.errors")

def setup_error_handlers(app: FastAPI) -> None:
    """Đăng ký các bộ xử lý ngoại lệ tập trung cho toàn bộ ứng dụng"""

    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException):
        logger.warning(f"AppException [{exc.status_code}] tại {request.method} {request.url.path}: {exc.message}")
        response = APIResponse.fail(
            message=exc.message,
            status_code=exc.status_code,
            errors=exc.details
        )
        return JSONResponse(status_code=exc.status_code, content=response.model_dump())

    @app.exception_handler(DatabaseConnectionException)
    async def handle_db_connection_exception(request: Request, exc: DatabaseConnectionException):
        logger.error(f"Lỗi kết nối CSDL tại {request.method} {request.url.path}: {exc.message} - {exc.details}")
        response = APIResponse.fail(
            message=exc.message,
            status_code=503,
            errors={"detail": "Không thể thiết lập kết nối tới cơ sở dữ liệu."}
        )
        return JSONResponse(status_code=503, content=response.model_dump())

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        formatted_errors = []
        for err in exc.errors():
            formatted_errors.append({
                "field": " -> ".join([str(loc) for loc in err["loc"]]),
                "message": err["msg"],
                "type": err["type"]
            })
        logger.info(f"Dữ liệu đầu vào không hợp lệ tại {request.url.path}: {formatted_errors}")
        response = APIResponse.fail(
            message="Dữ liệu yêu cầu gửi lên không đúng định dạng chuẩn.",
            status_code=422,
            errors=formatted_errors
        )
        return JSONResponse(status_code=422, content=response.model_dump())

    @app.exception_handler(SQLAlchemyError)
    async def handle_sqlalchemy_error(request: Request, exc: SQLAlchemyError):
        logger.critical(f"Lỗi cơ sở dữ liệu SQLAlchemy: {str(exc)}", exc_info=True)
        response = APIResponse.fail(
            message="Đã xảy ra lỗi trong quá trình tương tác với cơ sở dữ liệu.",
            status_code=500,
            errors={"type": exc.__class__.__name__}
        )
        return JSONResponse(status_code=500, content=response.model_dump())

    @app.exception_handler(Exception)
    async def handle_generic_exception(request: Request, exc: Exception):
        logger.critical(f"Lỗi hệ thống chưa được kiểm soát: {str(exc)}", exc_info=True)
        response = APIResponse.fail(
            message="Đã xảy ra lỗi máy chủ nội bộ. Quản trị viên đã được thông báo.",
            status_code=500,
            errors=None # Không để lộ stack trace ra ngoài cho hacker
        )
        return JSONResponse(status_code=500, content=response.model_dump())
