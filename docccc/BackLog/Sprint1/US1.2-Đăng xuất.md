# US-1.2: Đăng xuất hệ thống

**1. Vấn đề (Problem):**
Khi người dùng (đặc biệt là quản lý) rời khỏi thiết bị hoặc kết thúc ca làm việc, nếu không thoát tài khoản, người khác có thể sử dụng thiết bị để thao tác trái phép.

**2. Giá trị Nghiệp vụ (Business Value):**
Bảo vệ dữ liệu và đảm bảo tính minh bạch, quy trách nhiệm đúng người thao tác trên ca làm việc.

**3. Đối tượng (Actor):**
Tất cả người dùng (Boss, Manager, Staff).

**4. User Story Statement:**
*Là một Người dùng, tôi muốn đăng xuất khỏi hệ thống một cách an toàn, để đảm bảo không ai có thể sử dụng tài khoản của tôi khi tôi không có mặt.*

**5. Kịch bản (Scenarios):**

**5.1. Luồng chính: Đăng xuất thành công**
1. Người dùng nhấn vào avatar/tên của mình ở góc trên màn hình.
2. Chọn "Đăng xuất" từ menu thả xuống.
3. Hệ thống hiển thị popup xác nhận: "Bạn có chắc chắn muốn đăng xuất?".
4. Người dùng nhấn "Đồng ý".
5. Hệ thống xóa Token/Session lưu trữ trên trình duyệt.
6. Hệ thống điều hướng người dùng về trang Login.

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Xóa phiên đăng nhập**
  - **Given**: Người dùng đã nhấn Đăng xuất thành công và ở trang Login.
  - **When**: Người dùng nhấn nút "Back" trên trình duyệt.
  - **Then**: Hệ thống không cho phép truy cập lại trang nội bộ và bắt buộc phải đăng nhập lại.
