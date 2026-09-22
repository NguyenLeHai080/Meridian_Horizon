from datetime import datetime, timezone
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    status_code: int = 200
    message: str = "Thành công"
    data: Optional[T] = None
    errors: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @classmethod
    def ok(cls, data: Optional[T] = None, message: str = "Thành công", status_code: int = 200) -> "APIResponse[T]":
        return cls(
            success=True,
            status_code=status_code,
            message=message,
            data=data,
            errors=None
        )

    @classmethod
    def fail(cls, message: str = "Thất bại", status_code: int = 400, errors: Optional[Any] = None) -> "APIResponse[None]":
        return cls(
            success=False,
            status_code=status_code,
            message=message,
            data=None,
            errors=errors
        )
