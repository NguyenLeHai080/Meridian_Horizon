# 🧪 TÀI LIỆU HƯỚNG DẪN THỰC HÀNH GITFLOW & KỊCH BẢN HOTFIX

Tài liệu này ghi lại toàn bộ kịch bản thực hành Gitflow mô phỏng môi trường doanh nghiệp thực tế trên repository **Meridian Horizon**.

---

## Mục lục kịch bản
1. [Giai đoạn 1: Chuẩn bị 3 nhánh chính (`prod`, `staging`, `dev`)](#giai-đoạn-1)
2. [Giai đoạn 2: Phát triển tính năng `feat/homepage` và merge vào `dev`](#giai-đoạn-2)
3. [Giai đoạn 3: Chuyển giao `dev` sang `staging` để QA kiểm thử](#giai-đoạn-3)
4. [Giai đoạn 4: Triển khai từ `staging` lên `prod`](#giai-đoạn-4)
5. [Giai đoạn 5: Kịch bản mô phỏng sự cố khẩn cấp và quy trình Hotfix](#giai-đoạn-5)
6. [Giai đoạn 6: Đồng bộ ngược (Sync-back) từ `prod` sang `staging` & `dev`](#giai-đoạn-6)

---

## Giai đoạn 1: Khởi tạo 3 nhánh chính
Từ nhánh gốc `main`, chúng ta thiết lập 3 nhánh tương ứng với 3 tầng môi trường:
```bash
# Tạo nhánh prod từ main
git checkout -b prod

# Tạo nhánh staging từ prod
git checkout -b staging

# Tạo nhánh dev từ staging
git checkout -b dev
```

---

## Giai đoạn 2: Phát triển tính năng `feat/homepage`
- **Nghiệp vụ**: User Story `#MH-101` - Xây dựng giao diện trang chủ Meridian Horizon.
- **Quy tắc**: Checkout từ `dev`, commit có tiền tố `feat:` kèm `#MH-101`.

```bash
# 1. Tạo nhánh feature từ dev
git checkout dev
git checkout -b feat/homepage

# 2. Thêm file frontend/index.html
# 3. Commit chuẩn
git add frontend/index.html
git commit -m "feat(homepage): add initial landing page layout #MH-101"

# 4. Giả lập Code Review & Merge vào dev
git checkout dev
git merge --no-ff feat/homepage -m "merge: PR #1 from feat/homepage into dev (closes #MH-101)"

# 5. Xóa nhánh feature cục bộ sau khi hoàn thành
git branch -d feat/homepage
```

---

## Giai đoạn 3: Chuyển giao sang `staging` (QA & Demo)
Sau khi Sprint hoàn thành các tính năng trên `dev`:
```bash
git checkout staging
git merge --no-ff dev -m "chore(release): promote sprint increment from dev to staging for QA test #MH-REL-01"
```

---

## Giai đoạn 4: Triển khai Production (`prod`)
Sau khi QA nghiệm thu và PO chấp thuận:
```bash
git checkout prod
git merge --no-ff staging -m "chore(release): deploy release v1.0.0 to prod #MH-REL-01"
git tag -a v1.0.0 -m "Release v1.0.0 official"
```

---

## Giai đoạn 5: Kịch bản mô phỏng sự cố & Hotfix khẩn cấp
- **Tình huống sự cố**: Trên `prod` phát hiện lỗi tiêu đề và nút CTA dẫn sai link nghiêm trọng ảnh hưởng người dùng cuối (Issue `#MH-HOTFIX-01`).
- **Quy tắc**: Tách nhánh `hotfix/fix-homepage-title` từ `prod`.

```bash
# 1. Tách nhánh từ prod
git checkout prod
git checkout -b hotfix/fix-homepage-title

# 2. Sửa file và commit chuẩn fix:
git add frontend/index.html
git commit -m "fix(homepage): correct company brand title and cta action #MH-HOTFIX-01"

# 3. Duyệt khẩn cấp và merge vào prod
git checkout prod
git merge --no-ff hotfix/fix-homepage-title -m "merge: hotfix/fix-homepage-title into prod #MH-HOTFIX-01"
git tag -a v1.0.1 -m "Patch release v1.0.1 hotfix"

# 4. Xóa nhánh hotfix
git branch -d hotfix/fix-homepage-title
```

---

## Giai đoạn 6: Đồng bộ ngược (Sync-back) 3 môi trường
Bước quan trọng nhất để tránh trôi lệch mã nguồn (Code Drift):

```bash
# 1. Đồng bộ vào staging
git checkout staging
git merge prod -m "sync: back-merge hotfix v1.0.1 from prod to staging #MH-HOTFIX-01"

# 2. Đồng bộ vào dev
git checkout dev
git merge prod -m "sync: back-merge hotfix v1.0.1 from prod to dev #MH-HOTFIX-01"
```

✅ **Kết quả**: Cả 3 nhánh `prod`, `staging`, `dev` đều đồng nhất lịch sử mã nguồn mà không làm mất bất kỳ commit nào!
