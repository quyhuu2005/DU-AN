# US-1.1: Đăng nhập hệ thống

**1. Vấn đề (Problem):**
Hệ thống quản lý nhà hàng chứa các dữ liệu nhạy cảm về doanh thu, hóa đơn và thông tin nhân viên. Cần một cơ chế xác thực để bảo vệ hệ thống.

**2. Giá trị Nghiệp vụ (Business Value):**
- Tính bảo mật: Ngăn chặn truy cập trái phép.
- Cá nhân hóa: Hiển thị đúng giao diện và chức năng dựa trên vai trò.

**3. Đối tượng (Actor):**
- Primary Actor: Quản lý chi nhánh (Store Manager).
- Secondary Actor: Nhân viên (Staff), Quản trị viên hệ thống (Admin).

**4. User Story Statement:**
*Là một Người dùng, tôi muốn đăng nhập vào hệ thống bằng tài khoản được cấp, để truy cập vào các tính năng tương ứng với quyền hạn của tôi.*

**5. Kịch bản (Scenarios):**

**5.1. Luồng chính: Đăng nhập thành công**
1. Người dùng truy cập vào trang Login của hệ thống RMS.
2. Hệ thống hiển thị form đăng nhập gồm: Tên đăng nhập/Email và Mật khẩu.
3. Người dùng nhập thông tin chính xác và nhấn "Đăng nhập".
4. Hệ thống kiểm tra thông tin:
   - Nếu là Boss: Vào Admin Panel.
   - Nếu là Quản lý: Vào trang Dashboard của chi nhánh.
   - Nếu là Nhân viên: Vào trang Màn hình bán hàng (POS).

**5.2. Luồng phụ: Xử lý lỗi xác thực**
1. Người dùng nhập sai Tên đăng nhập hoặc Mật khẩu.
2. Hệ thống hiển thị thông báo: "Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại."
3. Form giữ lại Tên đăng nhập nhưng xóa trắng trường Mật khẩu.

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Kiểm tra tính đầy đủ của dữ liệu**
  - **Given**: Người dùng để trống một trong hai trường hoặc cả hai.
  - **When**: Click nút "Đăng nhập".
  - **Then**: Hiển thị lỗi ngay dưới field tương ứng (Ví dụ: "Vui lòng nhập mật khẩu").

- **AC-02: Bảo mật mật khẩu**
  - **Given**: Người dùng nhập mật khẩu vào ô Input.
  - **When**: Đang nhập liệu.
  - **Then**: Hệ thống phải mã hóa hiển thị (dạng •••••) và có icon "Mắt" để ẩn/hiện mật khẩu.

- **AC-03: Điều hướng theo vai trò (Role-based Routing)**
  - **Given**: Người dùng đăng nhập thành công.
  - **Then**: Store Manager phải vào trang quản lý doanh thu, Staff chỉ được vào màn hình phục vụ/order.

- **AC-04: Giới hạn số lần đăng nhập sai**
  - **Given**: Người dùng nhập sai mật khẩu quá 5 lần liên tiếp.
  - **Then**: Hệ thống tạm khóa đăng nhập trong 5 phút để ngăn chặn Brute-force.
