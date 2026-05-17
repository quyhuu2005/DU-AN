# US-8.1: Báo cáo doanh thu chi nhánh

**1. Vấn đề (Problem):**
Manager cần nắm bắt doanh số bán hàng trong ngày, tuần để báo cáo lên cấp trên hoặc điều chỉnh hoạt động.

**2. Giá trị Nghiệp vụ (Business Value):**
Phân tích dữ liệu, đánh giá hiệu suất nhân viên và tình hình kinh doanh của một chi nhánh.

**3. Đối tượng (Actor):**
Manager.

**4. User Story Statement:**
*Là Quản lý chi nhánh, tôi muốn xem thống kê tổng doanh thu và số lượng đơn hàng đã bán theo ngày/tuần/tháng để đánh giá hiệu quả kinh doanh của cửa hàng mình.*

**5. Kịch bản (Scenarios):**

**5.1. Luồng chính:**
1. Manager truy cập menu "Báo cáo doanh thu".
2. Chọn khoảng thời gian "Tháng này" và bấm "Xem báo cáo".
3. Hệ thống chạy lệnh SQL SUM(total_amount) từ bảng orders. (Điều kiện: status = 'Completed' VÀ branch_id = ID của manager).
4. Hiển thị con số Tổng doanh thu và Biểu đồ cột theo từng ngày.

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Lọc dữ liệu**
  - **Given**: Manager xem báo cáo.
  - **Then**: Các đơn hàng có trạng thái "Đang phục vụ" hoặc "Đã hủy" tuyệt đối không được cộng vào tổng doanh thu.
