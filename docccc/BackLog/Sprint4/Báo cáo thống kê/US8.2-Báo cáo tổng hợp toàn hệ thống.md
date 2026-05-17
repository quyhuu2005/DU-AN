# US-8.2: Báo cáo tổng hợp toàn hệ thống

**1. Vấn đề (Problem):**
Boss điều hành nhiều điểm bán cần so sánh trực quan hiệu suất giữa các chi nhánh để thưởng phạt hoặc phân bổ vốn.

**2. Giá trị Nghiệp vụ (Business Value):**
Hỗ trợ ra quyết định chiến lược cấp cao.

**3. Đối tượng (Actor):**
Boss.

**4. User Story Statement:**
*Là Boss, tôi muốn xem biểu đồ so sánh doanh thu giữa tất cả các chi nhánh để có cái nhìn toàn cảnh về chuỗi.*

**5. Kịch bản (Scenarios):**

**5.1. Luồng chính:**
1. Boss đăng nhập, vào trang "Dashboard Tổng".
2. Chọn thời gian "Năm nay".
3. Hệ thống GROUP BY doanh thu theo branch_id.
4. Render biểu đồ tròn (Pie Chart) thể hiện phần trăm tỷ trọng doanh thu của từng chi nhánh so với tổng chuỗi.

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Quyền hạn**
  - **Given**: Một Manager cố tình đổi URL để truy cập trang báo cáo của Boss.
  - **Then**: Hệ thống từ chối truy cập (HTTP 403 Forbidden).
