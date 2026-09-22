import math
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")

class PageParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Số trang hiện tại (bắt đầu từ 1)")
    page_size: int = Field(default=10, ge=1, le=100, description="Số phần tử trên mỗi trang (tối đa 100)")
    sort_by: Optional[str] = Field(default="id", description="Tên trường cần sắp xếp")
    order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$", description="Thứ tự: asc hoặc desc")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size

class PageMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PagedResponse(BaseModel, Generic[T]):
    items: List[T]
    meta: PageMeta

    @classmethod
    def create(cls, items: List[T], total_items: int, params: PageParams) -> "PagedResponse[T]":
        total_pages = math.ceil(total_items / params.page_size) if params.page_size > 0 else 0
        meta = PageMeta(
            page=params.page,
            page_size=params.page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=params.page < total_pages,
            has_prev=params.page > 1
        )
        return cls(items=items, meta=meta)

async def paginate(
    session: AsyncSession,
    query,
    params: PageParams,
    count_query = None
) -> PagedResponse:
    """Utility function to paginate any SQLAlchemy async query"""
    if count_query is None:
        count_q = select(func.count()).select_from(query.subquery())
    else:
        count_q = count_query

    total_result = await session.execute(count_q)
    total_items = total_result.scalar_one_or_none() or 0

    paged_query = query.offset(params.offset).limit(params.limit)
    items_result = await session.execute(paged_query)
    items = items_result.scalars().all()

    return PagedResponse.create(items=list(items), total_items=total_items, params=params)
