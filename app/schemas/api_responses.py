from __future__ import annotations

from typing import Generic, Optional, TypeVar, Any
from typing import Literal
from pydantic import BaseModel

T = TypeVar("T")


class ApiError(BaseModel):
    code: int
    message: str


class ApiMessage(BaseModel):
    success: Literal[True] = True
    message: str


class ApiData(BaseModel, Generic[T]):
    success: Literal[True] = True
    data: Optional[T] = None
    message: Optional[str] = None


class ErrorEnvelope(BaseModel):
    success: Literal[False] = False
    error: ApiError
    request_id: Optional[str] = None


class HealthStatus(BaseModel):
    status: str
    version: str
    timestamp: float
    database: Optional[str] = None
    openai: Optional[str] = None
    redis: Optional[str] = None


class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int
    has_next: bool
    has_prev: bool


class EmailsPageResponse(BaseModel):
    success: Literal[True] = True
    data: list[Any]
    pagination: PaginationMeta


# Analytics payloads
class UsageTotals(BaseModel):
    user_id: int
    total_analyses: int
    month_analyses: int
    quota_limit: int


class DailyBucket(BaseModel):
    date: str  # YYYY-MM-DD
    count: int


class UsageTimeSeries(BaseModel):
    success: Literal[True] = True
    data: list[DailyBucket]


class AdminOverview(BaseModel):
    success: Literal[True] = True
    data: dict[str, Any]
