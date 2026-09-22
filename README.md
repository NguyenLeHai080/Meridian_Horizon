# Meridian Horizon 🌅

Hệ thống quản lý và phát triển mã nguồn chuẩn doanh nghiệp theo mô hình **Agile Scrum** và **Gitflow Workflow**.

---

## 📚 Mục lục tài liệu chuẩn hóa
- 🌳 **[Chiến lược phân phối nhánh Gitflow](file:///d:/PROJECT/Client_Projects/Meridian_Horizon/docs/gitflow/GIT_BRANCHING_STRATEGY.md)**: Quy chuẩn nhánh `prod`, `staging`, `dev`, quy tắc commit và quy trình merge.
- 📋 **[Phân tích nghiệp vụ & Vận hành Sprint (Scrum Master)](file:///d:/PROJECT/Client_Projects/Meridian_Horizon/docs/scrum/BUSINESS_ANALYSIS_AND_SCRUM_OPERATIONS.md)**: Ma trận chu kỳ Sprint, DoR, DoD, SLA xử lý sự cố Hotfix và quy chuẩn truy vết Issue ID.
- 🧪 **[Kịch bản thực hành mẫu & Lệnh CLI](file:///d:/PROJECT/Client_Projects/Meridian_Horizon/docs/gitflow/PRACTICE_WALKTHROUGH.md)**: Hướng dẫn chi tiết từng bước thực hành phân nhánh, PR và Hotfix.
- 📝 **[Mẫu Pull Request](file:///d:/PROJECT/Client_Projects/Meridian_Horizon/.github/pull_request_template.md)**: Template kiểm duyệt chất lượng PR.

---

## 🌿 Cấu trúc nhánh chính

```
prod (Production - Live code)
 └── staging (Staging / UAT / QA Testing & Sprint Demo)
      └── dev (Development integration)
           ├── feat/<feature_name> (Tính năng mới)
           └── hotfix/<hotfix_name> (Vá lỗi khẩn cấp, tách từ prod)
```

## 🏷️ Quy chuẩn Commit Message
```text
<type>(<scope>): <mô tả ngắn gọn bằng thể mệnh lệnh> #<issue_id>
```
*Ví dụ*:
- `feat(homepage): add hero section and responsive layout #MH-101`
- `fix(auth): resolve session timeout bug #MH-105`
- `refactor(login): optimize input validation #MH-110`
- `vendor(docker): update redis container version to latest #MH-112`