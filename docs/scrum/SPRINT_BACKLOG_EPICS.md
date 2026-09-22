# 🚀 SPRINT BACKLOG & EPICS PHÂN TÍCH NGHIỆP VỤ (SCRUM MASTER)
> **Dự án**: Meridian Horizon - AI Video Dubbing & Translation Studio  
> **Chịu trách nhiệm**: Scrum Master & Agile Product Team  
> **Phương pháp**: Agile Scrum 2-week Sprint Cycle  

---

## 1. Danh mục Epics (Epic Breakdown)

| Mã Epic | Tên Epic | Mục tiêu kinh doanh & Kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :---: |
| **`EPIC-01`** | **Core Backend Infrastructure & Multi-layer Security** | Thiết lập hạ tầng Python FastAPI dạng module, bọc bảo vệ đa tầng chống hacker/spam, xử lý lỗi kết nối DB, chuẩn hóa RESTful API envelope. | 🎯 Planned |
| **`EPIC-02`** | **Frontend Core Modular Framework & Shared Assets** | Xây dựng nền tảng React Vite, i18n đa ngôn ngữ, Shared Modal (Fixed Header/Footer, Scrollable Body), Central Axios API, Router không có dấu `#`. | 🎯 Planned |
| **`EPIC-03`** | **AI Video Dubbing Studio & Media Processing Flow** | Xây dựng giao diện Studio biên dịch & lồng tiếng video (layout theo ảnh tham chiếu), quy trình 5 bước (Transcript -> Dịch -> Phụ đề -> Giọng đọc -> Xuất bản), bảng điều khiển Provider và Credit. | 🎯 Planned |

---

## 2. Chi tiết User Stories trong Sprint hiện tại

### User Story `MH-201`: Khởi tạo Core Backend & Cơ chế bắt lỗi CSDL
- **Thuộc Epic**: `EPIC-01`
- **Story Points**: `5 SP`
- **Mô tả**: Là lập trình viên backend, tôi muốn có kiến trúc Core phân tách rõ rệt giữa database, models, pagination, services, và providers để dễ mở rộng và bảo trì.
- **Acceptance Criteria (AC)**:
  1. Cấu hình cơ chế kết nối SQLAlchemy 2.0 Async Session với retry và tự động phát hiện mất kết nối.
  2. Xây dựng chuẩn phân trang `PageParams` (page, page_size) và trả về `PagedResponse[T]` chứa thông tin `total`, `total_pages`, `has_next`.
  3. Tất cả response API đều đóng gói theo envelope chuẩn: `{ success, status_code, message, data, timestamp }`.

### User Story `MH-202`: Hệ thống Xác thực Bảo mật Đa tầng & Chống Spam
- **Thuộc Epic**: `EPIC-01`
- **Story Points**: `8 SP`
- **Mô tả**: Là quản trị viên an ninh, tôi muốn hệ thống API được bảo vệ nhiều lớp tránh hacker xâm nhập, dò mật khẩu và spam request.
- **Acceptance Criteria (AC)**:
  1. Tích hợp JWT kép: `access_token` (ngắn hạn 30 phút) và `refresh_token` (dài hạn 7 ngày).
  2. Băm mật khẩu bằng thuật toán an toàn `bcrypt`.
  3. Middleware bảo mật: Bật đầy đủ HTTP Security Headers (X-Content-Type-Options, X-Frame-Options DENY, X-XSS-Protection, HSTS).
  4. Middleware Rate Limiter: Giới hạn số request/phút theo IP (Anti-Brute-Force & Anti-Spam), trả về mã `429 Too Many Requests`.

### User Story `MH-203`: Khởi tạo Frontend Modular & Shared Reusable Modal
- **Thuộc Epic**: `EPIC-02`
- **Story Points**: `5 SP`
- **Mô tả**: Là lập trình viên frontend, tôi muốn có component Modal dùng chung chuẩn UX để sử dụng trên toàn hệ thống.
- **Acceptance Criteria (AC)**:
  1. Modal có **Header cố định** (chứa tiêu đề và nút đóng `X`).
  2. Modal có **Footer cố định** (chứa các nút Submit, Cancel).
  3. Phần **Body ở giữa độc lập cuộn mượt mà (Scrollable Body)** khi nội dung dài, không làm vỡ khung.
  4. Hỗ trợ phím `Esc` và click ra ngoài backdrop để đóng.

### User Story `MH-204`: Đa ngôn ngữ (i18n) & Central Axios API Interceptor
- **Thuộc Epic**: `EPIC-02`
- **Story Points**: `5 SP`
- **Mô tả**: Là người dùng quốc tế, tôi muốn chuyển đổi giữa Tiếng Việt, Tiếng Anh và Tiếng Trung mượt mà.
- **Acceptance Criteria (AC)**:
  1. Cài đặt `i18next` và `react-i18next` với 3 bộ từ điển: `vi`, `en`, `zh`.
  2. Dropdown chuyển đổi ngôn ngữ hoạt động tức thì không cần reload trang.
  3. Centralized Axios client tự động chèn Bearer Token vào header request, và tự động bắt lỗi `401` để làm mới token.

### User Story `MH-205`: Studio Giao diện Biên dịch & Lồng tiếng Video (Tham chiếu UI)
- **Thuộc Epic**: `EPIC-03`
- **Story Points**: `8 SP`
- **Mô tả**: Là biên tập viên video, tôi muốn một giao diện Studio hiện đại (Dark Cyberpunk) giống phong cách "PeiPei Dub" để thao tác dịch và lồng tiếng video.
- **Acceptance Criteria (AC)**:
  1. Sidebar trái: Menu công cụ (Tải video, Hàng chờ, Ghép/Tách, Tăng tốc GPU, Giọng clone, API Keys, Bản quyền, Nhật ký).
  2. Thanh quy trình 5 bước trên cùng: `1. Tách transcript` ➔ `2. Dịch` ➔ `3. Tạo phụ đề` ➔ `4. Tạo giọng` ➔ `5. Xuất bản`.
  3. Khu vực chính giữa: Màn hình Video Player preview cùng phụ đề song ngữ.
  4. Cột bên phải: Cấu hình nguồn video, lựa chọn AI Provider dịch (DeepSeek, OpenAI), prompt chuyên biệt.
  5. Phía dưới: Khung Terminal nhật ký xử lý real-time và bộ đếm Credit (`86,137 credit`).
  6. Sử dụng icon chuẩn từ `lucide-react`, tuyệt đối không dùng icon AI giả lập.
