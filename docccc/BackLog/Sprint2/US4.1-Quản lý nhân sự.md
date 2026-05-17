# US-4.1: Quản lý nhân sự

## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Hệ thống chuỗi nhà hàng cần có cơ chế quản lý nhân sự phân cấp rõ ràng giữa Quản trị viên cấp cao (Boss), Quản lý chi nhánh (Manager) và Nhân viên phục vụ/thu ngân (Staff) để:
- Lưu trữ và cập nhật hồ sơ nhân viên (Tên, Email, Mật khẩu, Vai trò, Chi nhánh trực thuộc).
- Phân quyền hợp lý: Boss quản lý các Manager, Manager quản lý Staff của chi nhánh mình.
- Định danh rõ ràng nhân viên nào đang thực hiện thao tác trên hệ thống (ví dụ: thu ngân nào xuất hóa đơn).

Pain Points hiện tại:
- Quá trình cấp phát tài khoản bị thủ công, Boss phải tự tạo tài khoản cho tất cả nhân viên các chi nhánh dẫn đến quá tải.
- Không có sự cách ly dữ liệu (Data Isolation), Manager chi nhánh này có thể vô tình nhìn thấy hoặc sửa dữ liệu nhân sự của chi nhánh khác.
- Thiếu tính năng khóa tài khoản khi nhân sự nghỉ việc, gây nguy cơ bảo mật.

### **Giá trị Nghiệp vụ (Business Value):**

- **Quản lý tập trung và phân cấp:** Giảm tải cho Boss bằng cách ủy quyền quản lý nhân sự cục bộ cho Manager.
- **Bảo mật và Cách ly dữ liệu:** Đảm bảo đúng người được truy cập đúng dữ liệu kinh doanh; Manager chỉ có quyền xem và can thiệp vào nhân sự của chi nhánh mình.
- **Quy trách nhiệm (Audit):** Mỗi nhân viên có một tài khoản riêng để theo dõi ca làm việc và các giao dịch POS.

### **Đối tượng (Actor):**

- **Primary Actor 1:** Boss (Quản trị viên hệ thống)
  - Xem toàn bộ danh sách nhân sự trên hệ thống.
  - Tạo, cập nhật, khóa tài khoản Manager và chỉ định họ thuộc về một chi nhánh cụ thể.
- **Primary Actor 2:** Manager (Quản lý chi nhánh)
  - Xem danh sách nhân sự thuộc chi nhánh của mình.
  - Tạo, cập nhật, khóa tài khoản Staff (nhân viên phục vụ/thu ngân) cho chi nhánh đó.

### **User Story Statement**

Là Boss/Manager, tôi muốn có một màn hình quản lý nhân sự (tạo, xem, cập nhật, vô hiệu hóa) để kiểm soát tài khoản đăng nhập của nhân viên dựa trên vai trò và chi nhánh, đảm bảo vận hành nhà hàng an toàn và hiệu quả.

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Quản lý danh sách nhân sự**

1. Người dùng (Boss hoặc Manager) đăng nhập và truy cập trang "Quản lý Nhân sự".
2. Hệ thống kiểm tra quyền (Role) và hiển thị danh sách nhân sự:
   - Nếu là Boss: Hiển thị toàn bộ nhân sự của tất cả chi nhánh. Có thêm bộ lọc theo "Chi nhánh" và "Vai trò" (Manager/Staff).
   - Nếu là Manager: Chỉ load dữ liệu nhân sự có `branch_id` trùng với `branch_id` của Manager.
3. Danh sách hiển thị các thông tin: ID, Tên hiển thị, Email, Vai trò, Chi nhánh trực thuộc, Trạng thái.
4. Mỗi dòng nhân sự có các nút: "Chỉnh sửa", "Khóa/Mở khóa tài khoản".

### **2.2. Luồng: Boss tạo tài khoản Manager**

1. Boss click nút "Thêm nhân viên".
2. Hệ thống hiển thị form tạo mới: Tên hiển thị, Email, Mật khẩu, Vai trò (Mặc định chọn hoặc chỉ có tùy chọn Manager), Chi nhánh (Dropdown list các chi nhánh đang hoạt động).
3. Boss điền đầy đủ thông tin và chọn Chi nhánh tương ứng.
4. Nhấn "Lưu".
5. Hệ thống validate Email (đúng định dạng, không trùng lặp) và Chi nhánh (bắt buộc).
6. Nếu hợp lệ: Tạo bản ghi trong bảng `employee` với `role = 'Manager'` và `branch_id` được gán. Đóng form và thông báo "Tạo tài khoản Manager thành công".

### **2.3. Luồng: Manager tạo tài khoản Staff**

1. Manager click nút "Thêm nhân viên" tại chi nhánh của mình.
2. Hệ thống hiển thị form tạo mới: Tên hiển thị, Email, Mật khẩu. (Giao diện KHÔNG CÓ ô chọn Vai trò hay Chi nhánh).
3. Manager điền thông tin và nhấn "Lưu".
4. Hệ thống validate Email.
5. Nếu hợp lệ: Tự động tạo bản ghi trong `employee` với `role = 'Staff'` và `branch_id` tự động lấy theo `branch_id` của Manager hiện tại.
6. Thông báo "Tạo tài khoản Staff thành công".

### **2.4. Luồng: Cập nhật thông tin nhân sự**

1. Từ danh sách, người dùng nhấn "Sửa" trên một tài khoản.
2. Form hiển thị với dữ liệu cũ (Tên, Email).
3. Cập nhật thông tin và nhấn "Lưu".
4. Hệ thống kiểm tra trùng lặp Email (nếu có thay đổi) và lưu dữ liệu.
5. Thông báo "Cập nhật thành công".

### **2.5. Luồng: Khóa tài khoản nhân sự (Nghỉ việc)**

1. Khi một nhân sự nghỉ việc, người dùng nhấn nút "Khóa tài khoản" trên dòng của nhân sự đó.
2. Hệ thống hiển thị cảnh báo: "Tài khoản này sẽ không thể đăng nhập vào hệ thống nữa. Bạn có chắc chắn?".
3. Nhấn "Đồng ý".
4. Cập nhật trạng thái tài khoản thành "Inactive".
5. Nhân sự đó sẽ bị từ chối đăng nhập trong các lần tiếp theo.

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Data Isolation (Cách ly dữ liệu)**
Given: Manager của Chi nhánh A đăng nhập.
When: Truy cập trang danh sách Nhân sự.
Then: Bảng danh sách chỉ hiển thị các Staff thuộc Chi nhánh A. Tuyệt đối không được thấy Staff hoặc Manager của Chi nhánh B.

### **AC-02: Ràng buộc quyền tạo tài khoản (Role Binding)**
Given: Manager đang tạo tài khoản mới.
When: Nhấn "Lưu".
Then: Tài khoản được tạo ra bắt buộc phải có `role` là 'Staff' và `branch_id` của chính Manager đó. Manager không có quyền tạo tài khoản role 'Boss' hay 'Manager', và không thể gán nhân viên sang chi nhánh khác.

### **AC-03: Ràng buộc Chi nhánh đối với Boss**
Given: Boss đang tạo tài khoản Manager.
When: Boss để trống trường "Chi nhánh" và nhấn "Lưu".
Then: Hệ thống báo lỗi bắt buộc chọn chi nhánh và không cho phép tạo tài khoản.

### **AC-04: Ràng buộc duy nhất Email**
Given: Người dùng đang tạo hoặc cập nhật tài khoản.
When: Nhập Email đã tồn tại trong hệ thống (của bất kỳ chi nhánh nào).
Then: Hệ thống báo lỗi "Email này đã được sử dụng" và từ chối lưu.

### **AC-05: Khóa tài khoản (Vô hiệu hóa đăng nhập)**
Given: Nhân viên A đã bị chuyển trạng thái sang "Inactive".
When: Nhân viên A nhập đúng Email và Mật khẩu trên trang Đăng nhập.
Then: Hệ thống từ chối đăng nhập và hiển thị thông báo "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý."
