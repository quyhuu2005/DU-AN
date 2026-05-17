# US-3.2: Quản lý món ăn gốc

**1. Vấn đề (Problem):**
Hệ thống chuỗi cần sự đồng nhất về sản phẩm. Cần một nơi duy nhất để định nghĩa công thức, hình ảnh và mức giá tiêu chuẩn của món ăn. Các món ăn cũng cần được cập nhật thông tin hoặc xóa bỏ khi không còn kinh doanh.

**2. Giá trị Nghiệp vụ (Business Value):**
Chuẩn hóa Master Data, tiết kiệm thời gian cho các chi nhánh (không cần tự tạo món), quản lý hình ảnh thương hiệu đồng nhất. Dọn dẹp Master Data hợp lý mà vẫn bảo vệ tính toàn vẹn dữ liệu kế toán.

**3. Đối tượng (Actor):**
Boss.

**4. User Story Statement:**
*Là Boss, tôi muốn quản lý danh sách món ăn gốc (Xem, Thêm mới, Sửa, Xóa) để hệ thống phân bổ xuống các chi nhánh và cập nhật thực đơn toàn hệ thống.*

**5. Kịch bản (Scenarios):**

**5.1. Xem danh sách món ăn gốc**
1. Boss truy cập "Thực đơn gốc".
2. Hệ thống hiển thị danh sách các món ăn gốc (Gồm: Hình ảnh, Tên, Danh mục, Giá chuẩn).

**5.2. Thêm món ăn mới**
1. Nhấn nút "Thêm món ăn".
2. Boss nhập thông tin: Tên món, Chọn Danh mục, Hình ảnh, Giá gốc (`base_price`), Mô tả.
3. Boss nhấn "Lưu".
4. Hệ thống insert dữ liệu vào bảng `menu_item`.
5. **[Auto-Trigger ngầm]:** Hệ thống tự động quét tất cả các chi nhánh đang có, tạo ra các record trong bảng `branch_menu`. Các record này được tự động gán `local_price = base_price` và `is_available = false`.

**5.3. Sửa thông tin món ăn gốc**
1. Boss vào "Thực đơn gốc" và bấm "Sửa" tại dòng món ăn cần cập nhật.
2. Form hiển thị với thông tin cũ.
3. Boss thay đổi Hình ảnh, Tên, hoặc cập nhật Giá gốc (`base_price`).
4. Nhấn "Lưu".
5. Hệ thống update dữ liệu trong bảng `menu_item`.

**5.4. Xóa món ăn gốc**
1. Boss vào "Thực đơn gốc" và bấm "Xóa" tại dòng món ăn bị tạo nhầm (chưa từng được bán).
2. Hệ thống hiển thị popup: "Xác nhận xóa món ăn này?".
3. Nhấn "Đồng ý".
4. Hệ thống xóa khỏi bảng `menu_item` và tự động xóa các record tương ứng trong bảng `branch_menu` của tất cả chi nhánh.

**5.5. Luồng phụ: Bỏ trống tên món khi Thêm/Sửa**
1. Boss xóa tên món ăn, để trống.
2. Nhấn "Lưu".
3. Hệ thống chặn lại và báo lỗi "Tên món ăn không được để trống".

**5.6. Luồng phụ: Không thể xóa do dính dữ liệu**
1. Boss bấm "Xóa" một món đã từng được bán (đã có trong `order_detail`).
2. Hệ thống chặn lại và hiển thị cảnh báo: "Không thể xóa do món này đã phát sinh hóa đơn. Vui lòng sử dụng tính năng Ẩn món."

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Auto-sync xuống chi nhánh khi Thêm mới**
  - **Given**: Boss vừa tạo thành công món "Bò Bít Tết" (base_price = 100k).
  - **When**: Manager của Chi nhánh A đăng nhập vào kho menu của nhánh mình.
  - **Then**: Manager A thấy món "Bò Bít Tết" xuất hiện với giá 100k nhưng ở trạng thái "Ngừng bán" (Chờ duyệt).

- **AC-02: Không tự động đè giá chi nhánh khi Sửa giá gốc**
  - **Given**: Boss sửa giá `base_price` của món "Bò Bít Tết" từ 100k lên 120k.
  - **When**: Nhấn lưu thành công.
  - **Then**: Chỉ cập nhật bảng `menu_item`. Tuyệt đối KHÔNG tự động đè (`update`) lại giá `local_price` của các chi nhánh trong bảng `branch_menu` (để bảo vệ chiến lược giá riêng của chi nhánh).

- **AC-03: Bảo vệ toàn vẹn dữ liệu kế toán khi Xóa**
  - **Given**: Boss cố tình xóa một món đã nằm trong Hóa đơn của khách.
  - **When**: Nhấn xóa.
  - **Then**: Hệ thống phải bắt được lỗi Foreign Key từ CSDL (`order_detail`), từ chối hành động xóa và hiển thị thông báo thân thiện cho người dùng.
