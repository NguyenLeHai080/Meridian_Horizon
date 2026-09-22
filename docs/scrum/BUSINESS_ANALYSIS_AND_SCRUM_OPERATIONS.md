# 📋 TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ & VẬN HÀNH SPRINT DÀNH CHO SCRUM MASTER
> **Dự án**: Meridian Horizon  
> **Tác giả / Vai trò**: Scrum Master & Agile Coach  
> **Đối tượng áp dụng**: Product Owner, Scrum Master, Tech Leads, Developers, QA/QC Engineers  

---

## 1. Tuyên ngôn Agile & Vai trò của Gitflow trong Scrum

Trong mô hình Agile Scrum chuyên nghiệp, hệ thống quản lý nhánh Git (Gitflow) không chỉ đơn thuần là công cụ kỹ thuật lưu trữ mã nguồn, mà là **huyết mạch của chuỗi phân phối giá trị liên tục (Continuous Value Delivery)**.

Scrum Master thiết lập quy chuẩn này nhằm đạt 3 mục tiêu cốt lõi:
1. **Tính minh bạch (Transparency)**: Mọi thay đổi mã nguồn đều liên kết 1:1 với Business Requirement thông qua `Issue ID` (Jira/GitHub Issue).
2. **Khả năng thanh tra (Inspection)**: Kiểm duyệt chất lượng qua các cổng Code Review, Automated CI Testing và QA Validation trên môi trường Staging.
3. **Sự thích ứng (Adaptation)**: Linh hoạt tiếp nhận tính năng mới theo từng Sprint mà không gây rủi ro đứt gãy hệ thống Production.

---

## 2. Ma trận ánh xạ Chu kỳ Sprint với Nhánh Git (Sprint Mapping)

```
[Product Backlog] 
       │ (Sprint Planning)
       ▼
 [Sprint Backlog] ──► Issue ID (#MH-XXX)
       │
       ▼
 [Nhánh `dev`] ──────► Tách `feat/#MH-XXX` (Phát triển trong Sprint)
       │
       ▼ (Code Review + Merge)
 [Nhánh `dev`] ──────► Tích hợp nội bộ (Daily Integration)
       │
       ▼ (End of Sprint / Freeze)
 [Nhánh `staging`] ──► QA Kiểm thử hồi quy & PO Demo nghiệm thu
       │
       ▼ (Sprint Review Sign-off)
 [Nhánh `prod`] ─────► Release to Production & Ghi nhận Done Increment
```

| Giai đoạn Sprint | Hoạt động kỹ thuật Gitflow | Môi trường đích | Trách nhiệm chính |
| :--- | :--- | :---: | :--- |
| **Sprint Planning** | Khởi tạo Issue/User Story, gắn `Issue ID`, tạo branch `feat/<tên>` từ `dev`. | Local / Feature Branch | Product Owner & Dev Team |
| **Active Development** | Commit code chuẩn kèm `#Issue_ID`, tạo PR vào `dev`. Daily Standup cập nhật tiến độ. | Branch `dev` | Developers, Peer Reviewers |
| **Sprint Stabilization** | Đóng băng mã nguồn, merge `dev` vào `staging`. QA chạy test cases và UAT. | Branch `staging` | QA/QC, Scrum Master |
| **Sprint Review** | PO duyệt tính năng trực tiếp trên môi trường Staging. | Staging / Demo | Product Owner, Stakeholders |
| **Sprint Release** | Merge `staging` vào `prod`, gắn Git Tag phiên bản (VD: `v1.2.0`). | Production | Tech Lead, DevOps |
| **Sprint Retrospective** | Phân tích số lượng PR, thời gian review (Lead Time), Hotfix phát sinh. | Report / Dashboard | Toàn bộ Scrum Team |

---

## 3. Tiêu chuẩn DoR (Definition of Ready) & DoD (Definition of Done)

### 3.1. Definition of Ready (DoR) - Điều kiện để Dev mở nhánh `feat/`
Trước khi một Developer được phép checkout nhánh `feat/<feature_name>` từ `dev`, User Story phải đáp ứng đủ:
- [ ] User Story được viết theo định dạng chuẩn: *"Là một [vai trò], tôi muốn [tính năng] để [lợi ích]"*.
- [ ] Tiêu chí chấp nhận (Acceptance Criteria - AC) được định nghĩa rõ ràng theo phong cách Gherkin (`Given - When - Then`).
- [ ] Có đầy đủ bản thiết kế UI/UX (Figma) hoặc API Specification (Swagger/OpenAPI).
- [ ] Đã được Estimation Story Points trong buổi Sprint Planning.
- [ ] Issue đã được tạo trên hệ thống với định danh duy nhất (VD: `#MH-101`).

### 3.2. Definition of Done (DoD) - Cổng kiểm soát theo từng nhánh

```mermaid
flowchart LR
    subgraph DoD Dev ["Cổng 1: Vào dev"]
        D1[Code Clean & Formatted]
        D2[Commit đúng chuẩn #ID]
        D3[Unit Test Pass >= 80%]
        D4[Peer Review Approved]
    end

    subgraph DoD Staging ["Cổng 2: Vào staging"]
        S1[Deploy thành công Staging]
        S2[QA Test Pass 100% Testcases]
        S3[Không còn blocker/critical bug]
        S4[Performance/Security Pass]
    end

    subgraph DoD Prod ["Cổng 3: Vào prod"]
        P1[PO Sign-off / UAT Chấp thuận]
        P2[Release Notes hoàn thiện]
        P3[Gắn Git Tag phiên bản]
        P4[Monitoring Alert sẵn sàng]
    end

    DoD Dev --> DoD Staging --> DoD Prod
```

---

## 4. Chính sách bảo vệ nhánh (Branch Protection Rules)

Scrum Master phối hợp cùng Tech Lead áp dụng các chính sách nghiêm ngặt trên GitHub/GitLab Repository:

```
┌────────────────────────────────────────────────────────┐
│             REPO BRANCH PROTECTION POLICIES            │
├────────────────────────────────────────────────────────┤
│ 1. Direct Push:                                        │
│    - prod:    ⛔ BLOCKED (Chỉ nhận PR)                  │
│    - staging: ⛔ BLOCKED (Chỉ nhận PR)                  │
│    - dev:     ⛔ BLOCKED (Chỉ nhận PR)                  │
│                                                        │
│ 2. Pull Request Requirements:                          │
│    - Bắt buộc tối thiểu 1 Approved Review từ Tech Lead │
│    - Chặn merge nếu có thay đổi mới chưa re-review      │
│    - Bắt buộc tất cả CI status checks thành công       │
│                                                        │
│ 3. History Management:                                 │
│    - Bật "Require linear history"                      │
│    - Cấm Force Push (Chặn git push --force)            │
│    - Cấm xóa nhánh được bảo vệ                         │
└────────────────────────────────────────────────────────┘
```

---

## 5. Quy trình xử lý sự cố khẩn cấp (Hotfix Escalation & SLA)

Khi xảy ra sự cố phát hiện trên môi trường Production, Scrum Master kích hoạt **Quy trình Khẩn cấp (Incident Response Protocol)**:

### 5.1. Bảng phân loại mức độ sự cố (Severity Matrix)
| Cấp độ (Severity) | Tác động kinh doanh (Impact) | SLA phản hồi | SLA xử lý triệt để | Nhánh xử lý |
| :--- | :--- | :---: | :---: | :--- |
| **P0 (Blocker)** | Hệ thống sập toàn diện, rò rỉ dữ liệu, gián đoạn luồng thanh toán chính. | **< 15 phút** | **< 2 giờ** | `hotfix/*` từ `prod` |
| **P1 (Critical)** | Tính năng quan trọng bị hỏng, không có giải pháp thay thế (workaround). | **< 30 phút** | **< 6 giờ** | `hotfix/*` từ `prod` |
| **P2 (Major)** | Tính năng bị lỗi nhưng người dùng có thể thao tác vòng tránh. | **< 2 giờ** | **1 - 2 ngày** | `bugfix/*` vào `dev` |
| **P3 (Minor)** | Lỗi giao diện nhỏ, sai chính tả, không ảnh hưởng logic vận hành. | **1 ngày** | Đưa vào Sprint tới | `feat/*` vào `dev` |

### 5.2. Nguyên tắc đồng bộ 3 nhánh bắt buộc sau Hotfix (Anti-Drift Rule)
Một trong những lỗi nghiêm trọng nhất trong dự án là **"Hotfix xong trên prod nhưng quên đồng bộ vào dev"**, dẫn đến việc các Sprint sau khi release sẽ vô tình ghi đè lại bug cũ.

> ⚠️ **Quy tắc bất biến của Scrum Master**:
> Ngay khi Hotfix được merge vào `prod`, người thực hiện phải ngay lập tức tạo 2 PR đồng bộ ngược:
> 1. `prod` ➔ `staging`
> 2. `prod` ➔ `dev`
> Ticket chỉ được coi là **DONE** khi cả 3 nhánh đều đã chứa commit sửa lỗi.

---

## 6. Biểu mẫu phân tích nghiệp vụ thực tế (User Story Specification)

Dưới đây là một ví dụ phân tích nghiệp vụ mẫu ứng dụng trong Sprint hiện tại:

### User Story: `#MH-101` - Xây dựng Landing Page Meridian Horizon
- **Epic**: `[EPIC-01] Khởi tạo Cổng thông tin khách hàng`
- **Story Points**: `5 SP`
- **Priority**: `High`
- **Assignee**: Frontend Developer
- **Target Branch**: `feat/homepage`

#### Acceptance Criteria (AC):
1. **Kịch bản 1**: Khách hàng truy cập trang chủ
   - *Given*: Khách hàng mở trình duyệt và nhập URL hệ thống
   - *When*: Trang hoàn tất tải
   - *Then*: Hiển thị tiêu đề Hero Banner "Meridian Horizon - Enterprise Solutions", thanh điều hướng (Navigation Bar) và nút kêu gọi hành động (Call To Action).
2. **Kịch bản 2**: Kiểm tra liên kết nghiệp vụ
   - *Given*: Khách hàng nhấp vào nút "Khám phá dịch vụ"
   - *Then*: Cuộn mượt mà xuống phần tính năng và hiển thị thông tin giới thiệu.
3. **Commit & PR Requirement**:
   - Nhánh: `feat/homepage`
   - Commit: `feat(homepage): add landing page and hero section #MH-101`
   - PR Target: `dev`
