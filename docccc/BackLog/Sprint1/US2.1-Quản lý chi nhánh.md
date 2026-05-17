## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Hiện tại, hệ thống chuỗi nhà hàng cần quản lý danh sách các điểm kinh doanh thực tế một cách tập trung và thống nhất để:
- Lưu trữ và cập nhật thông tin chi nhánh (tên chi nhánh, địa chỉ, số điện thoại, trạng thái hoạt động).
- Đảm bảo các hoạt động kinh doanh (tạo nhân viên, phân bổ thực đơn, hóa đơn) được gắn đúng với chi nhánh tương ứng.
- Có cái nhìn tổng quan về quy mô và khả năng mở rộng chuỗi.

Pain Points hiện tại:
- Hệ thống phân tán, khó kiểm soát thông tin liên lạc và địa điểm của từng chi nhánh khi có sự thay đổi.
- Chưa có giao diện chuẩn hóa để thêm/sửa chi nhánh, dẫn đến sai sót dữ liệu cơ sở (Master Data).
- Khi một chi nhánh đóng cửa, nếu xóa cứng dữ liệu sẽ làm mất toàn bộ lịch sử hóa đơn bán hàng và phá vỡ tính toàn vẹn dữ liệu kế toán.

### **Giá trị Nghiệp vụ (Business Value):**

- **Quản lý tập trung chi nhánh:** Cung cấp giao diện quản lý Master Data từ một nguồn duy nhất, giúp Boss dễ dàng theo dõi, thêm mới và cập nhật các điểm kinh doanh.
- **Bảo toàn dữ liệu kế toán:** Cung cấp cơ chế "xóa mềm" (Ngừng hoạt động) thay vì xóa cứng, giúp hệ thống giữ lại lịch sử kinh doanh cũ để báo cáo thống kê, nhưng ngăn chặn các giao dịch mới.
- **Hỗ trợ vận hành:** Cung cấp thông tin nền tảng để khởi tạo tài khoản nhân sự và đồng bộ thực đơn xuống từng chi nhánh.

### **Đối tượng (Actor):**

- **Primary Actor:** Boss (Quản trị viên hệ thống / Chủ chuỗi nhà hàng)
  - Quản lý danh sách toàn bộ chi nhánh trong hệ thống (tạo mới, xem, cập nhật, ngừng hoạt động).
  - Đảm bảo dữ liệu cơ sở của chuỗi luôn chính xác.
- **Secondary Actors:** 
  - Quản lý chi nhánh (Manager) / Nhân viên (Staff): Chịu tác động từ trạng thái của chi nhánh (không thể đăng nhập nếu chi nhánh bị ngừng hoạt động).

### **User Story Statement**

Là Boss, tôi muốn có một màn hình quản lý chi nhánh tập trung (tạo, xem, cập nhật, vô hiệu hóa) để kiểm soát các điểm kinh doanh trong hệ thống và đảm bảo tính toàn vẹn dữ liệu khi chi nhánh ngừng hoạt động.

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Quản lý danh sách chi nhánh**

1. Boss đăng nhập vào hệ thống.
2. Điều hướng đến trang "Quản lý Chi nhánh" (hoặc "Quản lý hệ thống" > "Chi nhánh").
3. Hệ thống hiển thị danh sách chi nhánh với các thông tin:
   - ID
   - Tên chi nhánh
   - Địa chỉ
   - Số điện thoại
   - Trạng thái (Hoạt động / Ngừng hoạt động)
4. Mỗi dòng chi nhánh có các hành động:
   - "Chỉnh sửa": mở form/modal chỉnh sửa thông tin chi nhánh.
   - "Khóa/Xóa" (Toggle trạng thái): thay đổi trạng thái hoạt động.

### **2.2. Luồng: Tạo chi nhánh mới**

1. Từ trang "Quản lý Chi nhánh", Boss click nút "Thêm chi nhánh".
2. Hệ thống hiển thị form/modal "Thêm chi nhánh" với các trường:
   - Tên chi nhánh (bắt buộc)
   - Địa chỉ (bắt buộc)
   - Số điện thoại (bắt buộc, có validation định dạng)
3. Boss điền thông tin và click "Lưu".
4. Hệ thống validate:
   - Các trường bắt buộc không được để trống.
   - Số điện thoại hợp lệ (không chứa chữ cái).
5. Nếu hợp lệ:
   - Hệ thống tạo bản ghi chi nhánh mới trong Database.
   - Trạng thái tự động được gán là "Active" (Hoạt động).
   - Đóng form, hiển thị thông báo thành công: "Thêm chi nhánh thành công".
   - Refresh danh sách chi nhánh (không reload toàn trang).
6. Nếu không hợp lệ:
   - Hiển thị thông báo lỗi cụ thể dưới từng trường bị sai/thiếu.
   - Không gọi API lưu.
   - Giữ lại dữ liệu đã nhập trong form để chỉnh sửa.

### **2.3. Luồng: Cập nhật thông tin chi nhánh**

1. Từ trang "Quản lý Chi nhánh", Boss tìm chi nhánh cần chỉnh sửa.
2. Click nút "Sửa" trên dòng tương ứng.
3. Hệ thống hiển thị form/modal "Chỉnh sửa chi nhánh" với dữ liệu cũ đã được điền sẵn:
   - Tên chi nhánh
   - Địa chỉ
   - Số điện thoại
4. Boss thay đổi nội dung thông tin và click "Lưu".
5. Hệ thống validate tương tự luồng tạo (không để trống, số điện thoại hợp lệ).
6. Nếu hợp lệ:
   - Cập nhật thông tin xuống bảng `branch`.
   - Đóng form, hiển thị thông báo thành công: "Cập nhật chi nhánh thành công".
   - Refresh danh sách.
7. Nếu Boss nhấn nút "Hủy" hoặc click ra ngoài form:
   - Hệ thống đóng form, không gọi API, giữ nguyên dữ liệu cũ.

### **2.4. Luồng: Xóa mềm chi nhánh (Vô hiệu hóa)**

1. Từ trang "Quản lý Chi nhánh", Boss click nút "Khóa/Xóa" hoặc gạt Toggle trạng thái của một chi nhánh sang "Inactive" (Ngừng hoạt động).
2. Hệ thống hiển thị popup cảnh báo: "Hành động này sẽ đóng cửa chi nhánh và ngăn nhân sự đăng nhập. Các dữ liệu hóa đơn cũ vẫn được giữ lại. Bạn có chắc chắn?".
3. Boss nhấn "Đồng ý".
4. Hệ thống gọi API thực hiện lệnh UPDATE trường `status` của chi nhánh thành "Inactive".
5. Hệ thống cập nhật trạng thái chi nhánh trên giao diện, hiển thị thông báo "Đã ngừng hoạt động chi nhánh".

### **2.5. Luồng: Tìm kiếm, lọc, phân trang danh sách chi nhánh (Tùy chọn)**

1. Boss truy cập trang "Quản lý Chi nhánh".
2. Boss nhập từ khóa tìm kiếm (tên chi nhánh, số điện thoại) vào ô tìm kiếm.
3. Hệ thống lọc danh sách theo từ khóa.
4. Boss có thể lọc theo trạng thái (Đang hoạt động, Ngừng hoạt động).
5. Hệ thống hiển thị kết quả với phân trang (Ví dụ: 10 bản ghi/trang).

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Hiển thị danh sách chi nhánh**

Given: Boss đã đăng nhập thành công.
When: Truy cập trang "Quản lý Chi nhánh".
Then:
- Hệ thống hiển thị danh sách các chi nhánh hiện có trong cơ sở dữ liệu.
- Mỗi dòng hiển thị đầy đủ thông tin: ID, Tên, Địa chỉ, Số điện thoại, Trạng thái.
- Có các hành động: "Chỉnh sửa", "Vô hiệu hóa".

### **AC-02: Tạo chi nhánh mới thành công**

Given: Boss đang ở form/modal "Thêm chi nhánh".
When: Nhập đầy đủ dữ liệu hợp lệ và click "Lưu".
Then:
- Form validate tất cả trường bắt buộc và định dạng thành công.
- Bản ghi mới được lưu trong database với trường status mặc định là "Active".
- Modal/Form đóng, hiển thị thông báo "Thêm chi nhánh thành công" và danh sách được cập nhật.

### **AC-03: Tạo chi nhánh thất bại - Thiếu thông tin hoặc sai định dạng**

Given: Boss mở form "Thêm chi nhánh" (hoặc "Sửa chi nhánh").
When: Bỏ trống "Tên chi nhánh", "Địa chỉ" HOẶC nhập số điện thoại chứa chữ cái (VD: 090abc) rồi nhấn "Lưu".
Then:
- Hệ thống chặn lưu, không gọi API.
- Hiển thị thông báo lỗi cụ thể (ví dụ: định dạng số điện thoại không hợp lệ) dưới ô bị lỗi.
- Giữ nguyên dữ liệu đã nhập trên form.

### **AC-04: Bảo toàn dữ liệu khi chỉnh sửa không thay đổi**

Given: Boss mở form "Sửa chi nhánh" nhưng không thay đổi bất kỳ trường nào.
When: Nhấn "Lưu".
Then:
- Hệ thống báo "Cập nhật thành công" (hoặc không có thay đổi).
- Không làm hỏng hoặc ghi đè sai lệch dữ liệu gốc trong database.

### **AC-05: Ràng buộc Xóa (Soft-delete constraint)**

Given: Boss đang thao tác khóa/xóa trên một chi nhánh.
When: Nhấn "Đồng ý" trên popup xác nhận.
Then:
- Ứng dụng tuyệt đối KHÔNG gọi lệnh `DELETE FROM branch` trong cơ sở dữ liệu.
- Bắt buộc phải sử dụng cơ chế UPDATE (ví dụ: `UPDATE branch SET status = 'Inactive'`).

### **AC-06: Impact của Xóa mềm (Từ chối truy cập)**

Given: Chi nhánh A đã bị chuyển sang trạng thái "Inactive" (Ngừng hoạt động).
When: Nhân viên (Staff hoặc Manager) thuộc Chi nhánh A cố gắng đăng nhập vào hệ thống.
Then:
- Hệ thống từ chối quyền truy cập.
- Hiển thị thông báo lỗi: "Chi nhánh của bạn đã ngừng hoạt động".
