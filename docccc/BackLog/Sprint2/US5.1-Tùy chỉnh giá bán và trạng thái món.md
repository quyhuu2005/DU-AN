# US-5.1: Tùy chỉnh giá bán và trạng thái món

## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Mặc dù hệ thống có Thực đơn gốc (Master Menu) để đảm bảo tính đồng nhất thương hiệu, nhưng trong vận hành thực tế tại từng chi nhánh, Quản lý (Manager) thường gặp các tình huống:
- Chi phí vận hành (mặt bằng, nhân công) tại các khu vực khác nhau dẫn đến nhu cầu điều chỉnh giá bán khác nhau (Ví dụ: Chi nhánh tại Sân bay có giá cao hơn chi nhánh thông thường).
- Tình trạng nguồn hàng tại địa phương không ổn định (ví dụ: Chi nhánh Đà Nẵng hết Hải sản nhưng Chi nhánh HCM vẫn còn).
- Các chương trình khuyến mãi hoặc thử nghiệm giá bán riêng biệt của từng chi nhánh.

Nếu sử dụng chung một thực đơn cứng từ trung tâm, các chi nhánh sẽ không thể linh hoạt trong kinh doanh và xử lý tình huống phát sinh tại chỗ.

### **Giá trị Nghiệp vụ (Business Value):**

- **Tối ưu hóa lợi nhuận:** Cho phép từng chi nhánh tự định giá phù hợp với thị trường ngách và chi phí vận hành mà không làm ảnh hưởng đến dữ liệu gốc của chuỗi.
- **Vận hành linh hoạt:** Manager có thể chủ động "Đóng/Mở" món ăn ngay lập tức khi phát hiện hết nguyên liệu, giúp giảm thiểu trải nghiệm xấu của khách hàng khi gọi món xong mới báo hết.
- **Đảm bảo tính chính xác:** Giá bán tại máy POS luôn được lấy từ cấu hình riêng của chi nhánh đó (`local_price`), đảm bảo hóa đơn luôn phản ánh đúng giá trị giao dịch.

### **Đối tượng (Actor):**

- **Primary Actor:** Quản lý chi nhánh (Manager)
  - Quản lý danh sách món ăn được phép bán tại chi nhánh mình.
  - Tùy chỉnh giá bán và trạng thái kinh doanh của món.
- **Secondary Actors:** 
  - Nhân viên phục vụ (Staff): Thấy được sự thay đổi về giá và trạng thái món trên máy POS.
  - Boss: Theo dõi sự chênh lệch giá giữa các chi nhánh để có chiến lược kinh doanh tổng thể.

### **User Story Statement**

Là Quản lý chi nhánh, tôi muốn có giao diện quản lý thực đơn riêng tại chi nhánh của mình để tùy chỉnh mức giá bán và trạng thái (Đang bán/Ngừng bán) cho từng món ăn, nhằm tối ưu hóa hoạt động kinh doanh tại địa phương.

---

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Xem danh sách thực đơn tại chi nhánh**

1. Manager đăng nhập vào hệ thống với quyền Manager của chi nhánh tương ứng.
2. Điều hướng đến menu "Quản lý thực đơn" > "Thực đơn chi nhánh".
3. Hệ thống hiển thị danh sách các món ăn đã được đồng bộ từ Thực đơn gốc.
4. Các thông tin hiển thị trên bảng danh sách:
   - Hình ảnh món ăn.
   - Tên món & Danh mục.
   - **Giá gốc (Base Price)**: Giá chuẩn từ hệ thống (chỉ để tham khảo).
   - **Giá chi nhánh (Local Price)**: Giá đang áp dụng tại chi nhánh (có thể sửa).
   - **Trạng thái (Status)**: Toggle Đang bán / Ngừng bán.

### **2.2. Luồng: Cập nhật giá bán và Trạng thái**

1. Manager tìm món ăn cần thay đổi (ví dụ: "Cà phê sữa").
2. Nhấn vào ô nhập liệu tại cột "Giá chi nhánh" (hoặc nhấn nút "Sửa").
3. Nhập mức giá mới (ví dụ: thay đổi từ 30.000đ lên 35.000đ).
4. Sử dụng Toggle để chuyển trạng thái từ "Ngừng bán" sang "Đang bán" (hoặc ngược lại).
5. Nhấn "Lưu".
6. Hệ thống:
   - Cập nhật bảng `branch_menu` cho bản ghi tương ứng với `branch_id` và `menu_item_id`.
   - Hiển thị thông báo "Cập nhật thực đơn chi nhánh thành công".
   - Tự động đồng bộ giá mới và trạng thái lên tất cả các máy POS thuộc chi nhánh này.

### **2.3. Luồng: Tìm kiếm và Lọc món ăn**

1. Manager nhập tên món vào ô tìm kiếm (Debounce 300ms).
2. Manager sử dụng bộ lọc Danh mục (ví dụ: chỉ xem "Đồ uống").
3. Manager sử dụng bộ lọc trạng thái (ví dụ: chỉ xem các món đang "Ngừng bán").
4. Hệ thống hiển thị kết quả lọc tương ứng.

---

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Tính độc lập về dữ liệu (Data Isolation)**
Given: Manager Chi nhánh A cập nhật giá món "Phở Bò" thành 65.000đ.
When: Manager Chi nhánh B xem thực đơn của mình.
Then: Món "Phở Bò" tại Chi nhánh B vẫn giữ nguyên mức giá cũ (ví dụ: 60.000đ). Hành động tại nhánh A tuyệt đối không ảnh hưởng đến nhánh B.

### **AC-02: Ràng buộc giá bán (Validation)**
Given: Manager đang chỉnh sửa giá `local_price`.
When: Manager nhập giá trị nhỏ hơn 0 hoặc ký tự không phải số.
Then: Hệ thống chặn hành động lưu và báo lỗi: "Giá bán không hợp lệ. Vui lòng nhập số dương".

### **AC-03: Tác động tức thì đến máy POS (Real-time impact)**
Given: Manager vừa chuyển trạng thái món "Bia Sài Gòn" sang "Ngừng bán".
When: Nhân viên Staff tại quầy thực hiện gọi món ngay sau đó.
Then: Món "Bia Sài Gòn" phải bị làm mờ (disabled) trên màn hình POS và không thể thêm vào hóa đơn.

### **AC-04: Đồng bộ hóa khi có món mới (Auto-sync)**
Given: Boss thêm một món ăn mới vào Thực đơn gốc.
When: Manager truy cập vào "Thực đơn chi nhánh".
Then: Món ăn mới đó phải tự động xuất hiện trong danh sách với trạng thái mặc định là "Ngừng bán" (để Manager duyệt giá trước khi bán).

### **AC-05: Ghi nhận lịch sử thay đổi (Audit Log)**
Given: Manager thực hiện thay đổi giá hoặc trạng thái.
When: Nhấn "Lưu" thành công.
Then: Hệ thống phải ghi lại nhật ký: Người thực hiện, Thời gian, Tên món, Giá cũ -> Giá mới, Trạng thái cũ -> Trạng thái mới.
