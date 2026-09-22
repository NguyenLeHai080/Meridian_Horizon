# 🎨 KIẾN TRÚC FRONTEND MODULAR & COMPONENT DESIGN (REACTJS - VITE)
> **Dự án**: Meridian Horizon Studio  
> **Framework**: React 18 + Vite + TailwindCSS + SCSS Modules  
> **Quy chuẩn**: Clean Architecture, Reusable Components & Scrum Best Practices  

---

## 1. Cấu trúc Module khép kín (Modular Pattern)

Mỗi module nghiệp vụ được tổ chức độc lập theo cấu trúc chuẩn:
```text
src/modules/<module_name>/
  ├── components/   # Các UI Component phục vụ riêng cho module
  ├── hooks/        # Custom React Hooks chứa logic state nghiệp vụ
  ├── store/        # Quản lý trạng thái bằng Zustand Store
  ├── config/       # Hằng số, định tuyến nội bộ, constants
  └── pages/        # Trang giao diện chính (Views)
```

---

## 2. Tiêu chuẩn Modal Dùng Chung (Shared Reusable Modal)

Tuân thủ đúng 100% yêu cầu:
- **Header cố định**: Giữ nguyên vị trí phía trên, chứa tiêu đề nghiệp vụ, subtitle và nút `X` đóng nhanh.
- **Footer cố định**: Giữ nguyên vị trí phía dưới, chứa các nút xác nhận hành động (Hủy, Lưu, Thanh toán).
- **Body ở giữa cuộn độc lập (Scrollable Body)**:
  - Khi nội dung vượt quá chiều cao màn hình, chỉ phần nội dung ở giữa cuộn với thanh cuộn (`.scrollable-body`) được tùy biến mượt mà qua SCSS.
  - Không làm vỡ layout của Header và Footer.
  - Đóng linh hoạt qua phím `Esc` và click ra ngoài backdrop.

---

## 3. Hệ thống Định tuyến (Routing without Hash)

- Hệ thống sử dụng **`BrowserRouter`** (HTML5 History API PushState).
- **Tuyệt đối không có dấu `#`** trong đường dẫn URL.
- Phân nhóm có tiền tố (Path Prefixes):
  - `/auth/login`: Xác thực tài khoản
  - `/app/studio`: Không gian làm việc Studio Video Dubbing & Translation
- Bộ bọc bảo vệ:
  - `PrivateRoute`: Chặn truy cập trái phép khi chưa đăng nhập.
  - `PublicRoute`: Tự động điều hướng vào Studio khi đã có phiên làm việc.

---

## 4. Đa ngôn ngữ (i18n Multi-language)

- Sử dụng `react-i18next` hỗ trợ tức thì 3 ngôn ngữ:
  - `vi`: Tiếng Việt
  - `en`: English
  - `zh`: 中文 (Tiếng Trung)
- Tự động lưu ngôn ngữ vào `localStorage` và chuyển đổi thời gian thực không cần reload trang.

---

## 5. Kết hợp TailwindCSS & SCSS Chuẩn hóa

- **TailwindCSS**: Sử dụng cho 90% giao diện (layout, grid, flexbox, spacing, responsive).
- **Thư mục `assets/scss/`**:
  - `_variables.scss`: Khai báo biến màu sắc Cyberpunk studio.
  - `_scrollbar.scss`: Thiết kế thanh cuộn mảnh tinh tế cho Modal và Terminal.
  - `_animations.scss`: Hiệu ứng phát sáng neon (`pulse-glow`) và quét video.
  - `main.scss`: Đóng gói an toàn, tránh xung đột CSS khi build sản phẩm.
- **Thư viện Icon**: Dùng 100% icon chính thức từ **`lucide-react`**, cam kết không sử dụng icon AI giả lập.
