## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Trong quá trình vận hành nhà hàng, Nhân viên (Staff) cần một hệ thống POS (Point of Sale) phản hồi nhanh để xử lý quy trình phục vụ khách hàng. Hiện tại, chưa có hệ thống tập trung dẫn đến:
- Khó kiểm soát bàn nào đang trống, bàn nào có khách.
- Ghi order bằng tay dễ gây nhầm lẫn, sót món hoặc sai giá.
- Quy trình tính tiền và trả bàn chậm, dẫn đến trải nghiệm khách hàng kém.
- Không theo dõi được nhân viên nào chịu trách nhiệm cho hóa đơn nào (để audit).

Pain Points hiện tại:
- Nhân viên mất nhiều thời gian chạy giữa bàn, quầy thu ngân và bếp.
- Sai sót trong việc cộng tiền, quên trừ tiền các món khách đã hủy trước khi thanh toán.
- Bàn đã khách về nhưng chưa được cập nhật trạng thái "Trống" cho khách sau vào.

### **Giá trị Nghiệp vụ (Business Value):**

- **Quản lý quy trình phục vụ xuyên suốt:** Từ lúc khách vào (xếp bàn), gọi món, thay đổi món, đến lúc thanh toán đều nằm trên một màn hình đồng bộ.
- **Tự động hóa tính toán:** Hệ thống tự động tính tổng tiền (total amount) theo đúng giá cấu hình tại chi nhánh (local price), tránh sai sót.
- **Đảm bảo tính toàn vẹn (Data Integrity):** Hóa đơn sau khi thanh toán sẽ bị khóa không cho sửa đổi, trạng thái bàn được tự động giải phóng. Có lưu lại dấu vết (audit) nhân viên thực hiện.

### **Đối tượng (Actor):**

- **Primary Actor:** Nhân viên / Thu ngân (Staff)
  - Thao tác trực tiếp trên máy POS để mở bàn, gọi món và thanh toán.
- **Secondary Actors:** 
  - Quản lý (Manager): Có thể xem báo cáo doanh thu từ các giao dịch này hoặc thực hiện hủy hóa đơn nếu có lỗi (nếu được phân quyền).

### **User Story Statement**

Là Nhân viên, tôi muốn sử dụng một màn hình POS tập trung để xem sơ đồ bàn, tạo đơn hàng, quản lý món ăn và thanh toán hóa đơn nhằm phục vụ khách hàng một cách chính xác và nhanh chóng.

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Xem trạng thái sơ đồ bàn**

1. Staff đăng nhập, vào màn hình "Trang chủ / POS".
2. Hệ thống tải danh sách bàn (`dining_table`) của chi nhánh hiện tại.
3. Hiển thị sơ đồ dưới dạng các khối hộp (cards).
4. Phân biệt trạng thái qua màu sắc:
   - Bàn Trống (Màu Xanh).
   - Bàn Đang phục vụ (Màu Đỏ).

### **2.2. Luồng: Mở bàn và Tạo đơn hàng**

1. Khách vào quán, Staff click vào một Bàn Màu Xanh (Trống).
2. Nhấn "Mở bàn / Bắt đầu phục vụ".
3. Hệ thống sinh 1 bản ghi mới trong bảng `orders` (trạng thái = Đang phục vụ, table_id = ID bàn).
4. Cập nhật `dining_table.status` = 'Đang phục vụ'.
5. Bàn đổi sang Màu Đỏ và UI chuyển thẳng sang Màn hình Gọi món.
   *(Nếu click vào bàn Màu Đỏ, hệ thống lấy Order đang mở của bàn đó và chuyển sang Gọi món).*

### **2.3. Luồng: Gọi món (Thêm vào hóa đơn)**

1. Ở Màn hình gọi món, Staff bấm vào hình ảnh/tên của món ăn (Ví dụ: "Phở Bò").
2. Popup chọn số lượng hiện ra -> Staff nhập/chọn số lượng (Ví dụ: "2").
3. Nhấn "Thêm vào hóa đơn".
4. Hệ thống insert vào `order_detail` lấy đúng giá `local_price` từ `branch_menu`.
5. Tính toán realtime: subtotal = Số lượng x `local_price`. Cộng dồn vào `total_amount` của bảng `orders`.
6. Cập nhật danh sách món bên cột Hóa đơn.

### **2.4. Luồng: Chỉnh sửa và Hủy món trong đơn (Trước thanh toán)**

1. Trên cột hóa đơn, khách hàng muốn đổi ý định, Staff bấm nút "Sửa số lượng" hoặc "Xóa (Thùng rác)" cạnh món ăn.
2. Nếu Xóa, hệ thống hiển thị popup: "Xác nhận xóa món này khỏi hóa đơn?".
3. Nhấn "Đồng ý".
4. Hệ thống xóa bản ghi trong `order_detail` (hoặc cập nhật số lượng).
5. Tự động tính toán lại và trừ số tiền của món đó khỏi `total_amount` trong `orders`.
6. Làm mới lại danh sách hóa đơn trên UI.

### **2.5. Luồng: Thanh toán và Đóng hóa đơn**

1. Staff bấm nút "Thanh Toán" trên màn hình order khi khách yêu cầu tính tiền.
2. Hệ thống hiển thị Popup Thanh toán (Tổng tiền cần thu, ô nhập Tiền khách đưa, Tiền thối lại).
3. Nhập số tiền khách đưa -> Bấm "Xác nhận & In bill".
4. Hệ thống update `orders.status` = 'Completed'.
5. Hệ thống update `dining_table.status` = 'Trống'.
6. Điều hướng người dùng về màn hình Sơ đồ bàn (Bàn vừa rồi đã trở lại trạng thái Trống/Màu Xanh).

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Tính trực quan của sơ đồ bàn**
Given: Staff truy cập màn hình POS.
When: Sơ đồ bàn hiển thị.
Then: Các bàn ăn phải hiện rõ Tên bàn, Sức chứa và Trạng thái màu sắc phân biệt rõ ràng (Trống/Đang phục vụ).

### **AC-02: Ghi nhận Audit (Trách nhiệm nhân viên)**
Given: Staff thực hiện Mở bàn hoặc Thanh toán.
When: Bản ghi order được lưu/cập nhật.
Then: Hệ thống bắt buộc phải ghi lại `employee_id` của Staff đã thực hiện thao tác vào Order để phục vụ đối soát.

### **AC-03: Lọc dữ liệu Thực đơn (Sẵn có)**
Given: Staff đang ở màn hình gọi món.
When: Danh sách món ăn được tải ra.
Then: Các món có `is_available = false` trong `branch_menu` của chi nhánh đó phải bị làm mờ và không thể click chọn.

### **AC-04: Tính chính xác của Đơn giá**
Given: Staff thêm một món ăn vào hóa đơn.
When: Hệ thống lưu vào `order_detail`.
Then: Đơn giá (`unit_price`) bắt buộc phải lấy từ bảng `branch_menu` (`local_price`), tuyệt đối KHÔNG lấy từ bảng gốc `menu_item`.

### **AC-05: Ràng buộc tính toàn vẹn (Data Integrity) khi Thanh toán**
Given: Staff bấm "Xác nhận & In bill".
When: Tiến trình cập nhật CSDL diễn ra.
Then: Cập nhật đồng thời trạng thái Order và trạng thái Bàn trong cùng một Database Transaction. Nếu một tiến trình lỗi, phải rollback toàn bộ để tránh treo bàn.

### **AC-06: Ràng buộc khóa Order sau thanh toán**
Given: Hóa đơn đã ở trạng thái "Completed" (Đã thanh toán).
When: Staff cố gắng mở lại và nhấn nút Xóa món hoặc Thêm món.
Then: Hệ thống chặn lại, không hiển thị nút Xóa/Sửa, đảm bảo hóa đơn đóng băng hoàn toàn.
