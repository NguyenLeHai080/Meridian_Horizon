# 🏗️ KIẾN TRÚC BACKEND CORE & MODULAR ENTERPRISE (PYTHON - FASTAPI)
> **Dự án**: Meridian Horizon  
> **Phiên bản**: v1.0 Enterprise  
> **Tiêu chuẩn thiết kế**: Clean Architecture & Domain-Driven Modular  

---

## 1. Bản đồ tổng thể luồng thực thi (Architecture Request Flow)

```
[Client Request]
       │
       ▼
 [Security Headers Middleware]   ──► Bổ sung HSTS, X-Frame-Options DENY, XSS Protection
       │
       ▼
 [Rate Limit Middleware]         ──► Chống Spam & Brute-force (Sliding Window: 120/min general, 20/min auth)
       │
       ▼
 [CORS Middleware]               ──► Kiểm duyệt Whitelist Origins
       │
       ▼
 [Global Error Handler]          ──► Bắt Exception, DatabaseConnectionException, che giấu stack trace
       │
       ▼
 [Router (/api/v1/...)]          ──► Định tuyến RESTful phân cấp
       │
       ▼
 [Dependency Injection (Auth)]   ──► Thẩm định Bearer Token, kiểm tra Blacklist Revocation
       │
       ▼
 [Pydantic Schemas Validation]   ──► Lọc dữ liệu đầu vào (Request DTO)
       │
       ▼
 [Service Layer]                 ──► Xử lý nghiệp vụ (Business Logic)
       │
       ├────────────────────────┐
       ▼                        ▼
 [ORM Models (SQLAlchemy)]   [Providers Layer (AI/TTS)]
       │                        │
       ▼ (Connection Retry)     ▼
 [Async Database Engine]     [DeepSeek / OpenAI / Local VITS]
       │
       ▼
 [Standard Response Envelope]    ──► { success, status_code, message, data, timestamp }
```

---

## 2. Phân tách trách nhiệm (Separation of Concerns)

| Thành phần | Đường dẫn thư mục | Trách nhiệm chính |
| :--- | :--- | :--- |
| **`Core Config`** | `app/core/config.py` | Quản lý biến môi trường, khóa bí mật JWT, giới hạn rate limit. |
| **`Core Database`** | `app/core/database.py` | Quản lý Async Session, cơ chế tự động thử lại khi mất kết nối (`pool_pre_ping`), tự động rollback khi lỗi. |
| **`Core Security`** | `app/core/security.py` | Băm mật khẩu `bcrypt`, cấp phát JWT Access & Refresh Token, danh sách đen thu hồi token (`REVOKED_TOKENS_STORE`). |
| **`Core Pagination`**| `app/core/pagination.py` | Động cơ phân trang độc lập: `PageParams` ➔ `PagedResponse[T]`. |
| **`Core Response`** | `app/core/response.py` | Chuẩn hóa Envelope phản hồi JSON cho toàn bộ API. |
| **`Middlewares`** | `app/core/middlewares/` | Lớp bảo vệ chống tấn công mạng: Anti-spam, Security Headers, CORS, Exception Handler. |
| **`Modules API`** | `app/modules/*/api/` | Routers phân cấp có tiền tố `/api/v1/*`. |
| **`Modules Schemas`**| `app/modules/*/schemas/` | DTO xác thực đầu vào/đầu ra với Pydantic v2. |
| **`Modules Models`** | `app/modules/*/models/` | Cấu trúc bảng CSDL ORM (DeclarativeBase). |
| **`Modules Services`**| `app/modules/*/services/` | Tầng xử lý logic nghiệp vụ độc lập, không phụ thuộc framework web. |
| **`Modules Providers`**| `app/modules/*/providers/` | Tích hợp các dịch vụ bên ngoài (AI DeepSeek, OpenAI, Local TTS). |

---

## 3. Cơ chế xử lý lỗi kết nối CSDL (Connection Resilience)

Khi máy chủ CSDL bị khởi động lại hoặc ngắt kết nối tạm thời, hàm `check_database_connection(max_retries=3)` tự động kích hoạt thuật toán Exponential Backoff:
- Lần 1: Chờ 1.0 giây
- Lần 2: Chờ 2.0 giây
- Lần 3: Chờ 3.0 giây
Nếu không thể kết nối, hệ thống ném ra ngoại lệ `DatabaseConnectionException` (HTTP 503) với thông báo thân thiện và ghi log bảo mật, không làm sập ứng dụng.

---

## 4. Bảo mật đa tầng (Multi-layer Security Strategy)

1. **Chống Brute-force & DDOS Layer 7**:
   - Áp dụng `RateLimitMiddleware`: Giới hạn tối đa 20 lượt thử/phút cho các endpoint đăng nhập (`/auth/login`), và 120 lượt/phút cho các API chung.
   - Khi vi phạm, trả về mã `429 Too Many Requests` kèm header `Retry-After`.
2. **Chống giả mạo & Tấn công Token (Anti-Replay & Revocation)**:
   - Cơ chế Token Rotation: Khi gọi `/auth/refresh`, refresh token cũ ngay lập tức bị vô hiệu hóa.
   - Khi gọi `/auth/logout`, token được đưa vào blacklist chặn đứng việc hacker sử dụng lại token đã đánh cắp.
3. **HTTP Security Hardening**:
   - `X-Frame-Options: DENY`: Chống kỹ thuật clickjacking lồng iframe.
   - `X-Content-Type-Options: nosniff`: Chống tấn công MIME Confusion.
   - `X-XSS-Protection: 1; mode=block`: Bật bộ lọc chống XSS của trình duyệt.
   - `Cache-Control: no-store`: Ngăn trình duyệt lưu cache dữ liệu API nhạy cảm.
