# US-6.1: Quản lý sơ đồ bàn
## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Phần mềm cần ánh xạ chính xác mặt bằng vật lý của nhà hàng (Sơ đồ bàn) để Nhân viên (Staff) có thể quản lý luồng khách và gắn đơn hàng vào đúng vị trí.
- Lưu trữ danh sách các bàn theo chi nhánh (tên bàn, sức chứa, trạng thái).
- Hỗ trợ nhân viên thu ngân và phục vụ biết bàn nào trống, bàn nào đang có khách.

Pain Points hiện tại:
- Không có sơ đồ bàn chuẩn, nhân viên phải tự nhớ hoặc ghi tay ra giấy rất dễ gây nhầm lẫn bill giữa các bàn.
- Khó quản lý sức chứa của từng bàn để sắp xếp chỗ ngồi cho các nhóm khách đông người.
- Khi thay đổi cấu trúc nhà hàng (nhập 2 bàn làm 1, mở rộng thêm bàn mới), Manager không có công cụ để cập nhật lên hệ thống.

### **Giá trị Nghiệp vụ (Business Value):**

- **Trực quan hóa hoạt động:** Giúp nhân viên nhận diện ngay tình trạng phục vụ tại nhà hàng, tăng tốc độ điều phối và xếp bàn cho khách.
- **Tính toán năng lực phục vụ:** Giúp Manager biết được nhà hàng có khả năng phục vụ tối đa bao nhiêu khách cùng lúc.
- **Đồng bộ hóa dữ liệu POS:** Tất cả các máy POS và thiết bị order đều đồng bộ sử dụng chung một sơ đồ bàn, tránh xung đột hóa đơn.

### **Đối tượng (Actor):**

- **Primary Actor:** Manager (Quản lý chi nhánh)
  - Là người được cấp quyền để thiết lập, tùy chỉnh sơ đồ bàn (tạo mới, xem, sửa, xóa bàn) dựa trên mặt bằng thực tế của chi nhánh mình.
- **Secondary Actors:** 
  - Staff (Nhân viên phục vụ/Thu ngân): Người sử dụng sơ đồ bàn này trên màn hình POS để thao tác gọi món.

### **User Story Statement**

Là Quản lý chi nhánh (Manager), tôi muốn quản lý danh sách và sơ đồ bàn ăn (tạo, xem, sửa, xóa) để ánh xạ đúng mặt bằng thực tế của cửa hàng, giúp nhân viên phục vụ khách hàng chính xác và hiệu quả.

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Xem danh sách sơ đồ bàn**

1. Manager đăng nhập vào hệ thống quản lý của chi nhánh.
2. Điều hướng đến trang "Quản lý Sơ đồ bàn".
3. Hệ thống hiển thị danh sách (hoặc giao diện lưới dạng thẻ) các bàn hiện có thuộc chi nhánh của Manager này.
4. Thông tin hiển thị bao gồm: Tên/Số bàn, Sức chứa (Số người tối đa), Trạng thái hiện tại (Trống / Đang phục vụ).
5. Mỗi bàn có các nút hành động: "Sửa", "Xóa".

### **2.2. Luồng: Thêm bàn mới**

1. Từ trang "Quản lý Sơ đồ bàn", Manager click nút "Thêm bàn".
2. Hệ thống hiển thị popup/modal "Thêm bàn mới" với các trường:
   - Tên/Số bàn (VD: "Bàn 01", "Bàn VIP 2" - Bắt buộc).
   - Sức chứa (VD: 4, 6, 10 - Bắt buộc, định dạng số).
3. Manager nhập thông tin và nhấn "Lưu".
4. Hệ thống validate:
   - Không được để trống trường bắt buộc.
   - Sức chứa phải là số lớn hơn 0.
   - Tên bàn không được trùng lặp với các bàn đã có trong cùng chi nhánh.
5. Nếu hợp lệ:
   - Lưu bàn vào CSDL với trạng thái mặc định là "Trống".
   - Đóng popup và thông báo "Thêm bàn thành công".
   - Refresh lại danh sách bàn trên màn hình.

### **2.3. Luồng: Cập nhật thông tin bàn**

1. Manager bấm nút "Sửa" tại một bàn cụ thể.
2. Form chỉnh sửa hiện ra với dữ liệu cũ (Tên bàn, Sức chứa).
3. Manager thay đổi tên bàn (do dán lại số) hoặc thay đổi sức chứa (do kê thêm ghế) và nhấn "Lưu".
4. Hệ thống validate tương tự bước Thêm mới (Kiểm tra trùng lặp Tên bàn).
5. Nếu hợp lệ: Cập nhật dữ liệu vào bảng `dining_table` và thông báo thành công.

### **2.4. Luồng: Xóa bàn (Loại bỏ khỏi sơ đồ)**

1. Manager bấm nút "Xóa" tại một bàn (VD: Bàn bị hỏng hoặc dọn dẹp bỏ đi).
2. Hệ thống hiển thị popup cảnh báo: "Bạn có chắc chắn muốn xóa bàn này khỏi hệ thống không?".
3. Nhấn "Đồng ý".
4. Hệ thống kiểm tra trạng thái hiện tại của bàn:
   - Nếu bàn đang "Trống" và không dính hóa đơn chưa thanh toán: Thực hiện xóa bàn (Xóa cứng hoặc ẩn tùy logic DB) và báo thành công.
   - Nếu bàn đang có khách ("Đang phục vụ"): Chặn lại và báo lỗi "Không thể xóa bàn đang có khách".

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Ràng buộc duy nhất (Unique Constraint)**
Given: "Bàn 01" đã tồn tại ở Chi nhánh A.
When: Manager của Chi nhánh A cố gắng tạo thêm một bàn mới tên là "Bàn 01".
Then: Hệ thống từ chối lưu và báo lỗi: "Tên bàn này đã có tại chi nhánh". *(Lưu ý: Manager của Chi nhánh B vẫn được phép tạo "Bàn 01" thuộc Chi nhánh B do cách ly dữ liệu).*

### **AC-02: Ràng buộc dữ liệu Sức chứa**
Given: Manager đang Thêm hoặc Sửa bàn.
When: Nhập sức chứa là số âm, số 0 hoặc chứa ký tự chữ cái.
Then: Hệ thống validate lỗi trực tiếp trên giao diện: "Sức chứa phải là một số nguyên dương". Nút Lưu bị vô hiệu hóa hoặc không gọi API.

### **AC-03: Cách ly dữ liệu (Data Isolation)**
Given: Manager thuộc Chi nhánh A đăng nhập.
When: Truy cập "Quản lý Sơ đồ bàn".
Then: Hệ thống chỉ load và cho phép can thiệp vào danh sách bàn của Chi nhánh A. Không được thấy sơ đồ bàn của Chi nhánh B.

### **AC-04: Bảo vệ toàn vẹn dữ liệu vận hành (Xóa bàn)**
Given: Bàn 05 đang có khách (Trạng thái = 'Đang phục vụ', có Order chưa đóng).
When: Manager cố tình bấm Xóa bàn 05.
Then: Hệ thống phải bắt buộc từ chối thao tác Xóa để tránh làm treo Order của khách, đồng thời hiển thị thông báo "Không thể xóa bàn đang phục vụ khách".
