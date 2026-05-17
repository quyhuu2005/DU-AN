# US-3.1: Quản lý danh mục

**1. Vấn đề (Problem):**
Thực đơn nhà hàng có thể có hàng chục đến hàng trăm món ăn. Cần có cách phân loại logic để nhân viên phục vụ dễ dàng tìm kiếm khi gọi món cho khách. Trong quá trình vận hành, Boss có thể cần thay đổi tên danh mục hoặc xóa bỏ các danh mục không còn sử dụng.

**2. Giá trị Nghiệp vụ (Business Value):**
Tối ưu hóa UI/UX cho màn hình POS, rút ngắn thời gian thao tác của nhân viên. Quản lý cấu trúc thực đơn linh hoạt, giữ cho Master Data luôn gọn gàng, hợp lý.

**3. Đối tượng (Actor):**
Boss.

**4. User Story Statement:**
*Là Boss, tôi muốn quản lý danh mục món ăn (Xem, Thêm, Sửa, Xóa) để nhóm các món ăn lại một cách có hệ thống và dễ dàng tùy biến khi menu thay đổi.*

**5. Kịch bản (Scenarios):**

**5.1. Xem danh sách danh mục**
1. Boss truy cập "Quản lý thực đơn" > "Danh mục".
2. Hệ thống hiển thị danh sách các danh mục hiện có, kèm theo số lượng món ăn đang thuộc về danh mục đó.

**5.2. Thêm danh mục mới**
1. Nhấn nút "Thêm danh mục".
2. Nhập Tên danh mục (VD: "Tráng miệng").
3. Nhấn "Lưu".
4. Hệ thống insert vào bảng `category` và làm mới danh sách.

**5.3. Sửa danh mục**
1. Boss bấm "Sửa" ở một danh mục trong danh sách.
2. Hệ thống hiển thị form với tên danh mục cũ.
3. Boss nhập tên mới và nhấn "Lưu".
4. Hệ thống cập nhật bảng `category` và thay đổi tên danh mục đó trên toàn hệ thống.

**5.4. Xóa danh mục**
1. Boss bấm "Xóa" ở một danh mục trong danh sách.
2. Hệ thống hiển thị popup: "Xác nhận xóa danh mục này?".
3. Nhấn "Đồng ý".
4. Hệ thống xóa danh mục khỏi bảng `category`.

**5.5. Luồng phụ: Trùng tên danh mục (Khi Thêm/Sửa)**
1. Boss nhập tên danh mục trùng với một danh mục đã tồn tại trong hệ thống.
2. Nhấn "Lưu".
3. Hệ thống kiểm tra DB, phát hiện trùng lặp và báo lỗi: "Danh mục này đã tồn tại". Không gọi API lưu.

**5.6. Luồng phụ: Không thể xóa danh mục đang có món ăn**
1. Boss cố gắng xóa một danh mục đang chứa các món ăn (Số lượng món > 0).
2. Hệ thống chặn lại và hiển thị cảnh báo: "Không thể xóa danh mục đang có món ăn. Vui lòng chuyển các món ăn sang danh mục khác trước khi xóa."

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Ràng buộc trùng lặp**
  - **Given**: Boss thêm mới hoặc sửa danh mục.
  - **When**: Nhập tên giống hệt một danh mục đang có.
  - **Then**: Không cho phép lưu và báo lỗi trực quan trên UI.

- **AC-02: Ràng buộc tính toàn vẹn (Foreign Key Constraint)**
  - **Given**: Boss thực hiện thao tác xóa danh mục.
  - **When**: Danh mục đó đang được tham chiếu bởi bảng `menu_item` (có món ăn thuộc danh mục này).
  - **Then**: Hệ thống bắt buộc phải từ chối thao tác xóa để bảo vệ dữ liệu, không làm các món ăn bị mất liên kết danh mục (orphaned data).

- **AC-03: Ràng buộc dữ liệu rỗng**
  - **Given**: Boss thêm mới hoặc sửa danh mục.
  - **When**: Để trống ô Tên danh mục.
  - **Then**: Nút "Lưu" bị vô hiệu hóa hoặc hệ thống báo lỗi không được để trống.
