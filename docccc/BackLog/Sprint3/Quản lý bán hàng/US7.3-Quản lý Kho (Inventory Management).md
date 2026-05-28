# US-8.1: Quản lý Kho (Inventory Management)

## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Trong vận hành nhà hàng hàng ngày, việc quản lý nguyên liệu/hàng hóa trong kho thường gặp nhiều bất cập:
- Không biết chính xác tồn kho hiện tại của từng nguyên liệu, dẫn đến tình trạng hết nguyên liệu giữa chừng mà không hay biết.
- Nhập kho thủ công bằng giấy tờ dễ gây nhầm lẫn, thất lạc hóa đơn nhập hàng.
- Không có lịch sử xuất/nhập kho để kiểm tra khi có sai lệch hàng tồn.
- Kết nối giữa bếp và kho lỏng lẻo: Bếp hết nguyên liệu nhưng thủ kho không biết để nhập bổ sung kịp thời.
- Khó phát hiện thất thoát nguyên liệu (hao hụt bất thường giữa lượng nhập và lượng tiêu thụ thực tế).

### **Giá trị Nghiệp vụ (Business Value):**

- **Kiểm soát chi phí:** Manager nắm rõ lượng tồn kho thực tế, tránh nhập hàng dư thừa gây lãng phí hoặc thiếu hụt gây mất doanh thu.
- **Cảnh báo tồn kho thấp:** Hệ thống tự động cảnh báo khi nguyên liệu xuống dưới mức tối thiểu (minimum stock), giúp Thủ kho/Manager lên kế hoạch nhập hàng kịp thời.
- **Minh bạch hóa vận hành:** Toàn bộ lịch sử xuất/nhập kho được ghi lại có audit trail (ai làm, khi nào, số lượng bao nhiêu), phục vụ đối soát khi có sai lệch.
- **Kết nối với bếp:** Khi Chef báo "Hết món" trên KDS, hệ thống tự động ghi nhận nguyên liệu đó cần được bổ sung, tạo liên kết chặt giữa bếp và kho.
- **Báo cáo tiêu thụ:** Manager có thể xem báo cáo nguyên liệu tiêu thụ theo ngày/tháng để dự đoán nhu cầu nhập hàng.

### **Đối tượng (Actor):**

- **Primary Actor:** Quản lý chi nhánh (Manager) / Thủ kho
  - Xem danh sách hàng tồn kho của chi nhánh.
  - Thực hiện nhập kho (nhận hàng từ nhà cung cấp).
  - Thực hiện xuất kho thủ công (ghi nhận tiêu thụ hoặc điều chỉnh).
  - Cấu hình mức tồn kho tối thiểu (minimum stock level) để nhận cảnh báo.
- **Secondary Actors:**
  - Đầu bếp (Chef): Khi đánh dấu "Hết món" trên KDS, gián tiếp tạo cảnh báo cho Thủ kho.
  - Boss: Xem báo cáo tổng quan tồn kho và chi phí nguyên liệu của toàn bộ hệ thống.

### **User Story Statement**

Là Quản lý chi nhánh, tôi muốn có một hệ thống quản lý kho đơn giản để theo dõi số lượng tồn kho của từng nguyên liệu/hàng hóa, thực hiện nhập/xuất kho và nhận cảnh báo khi hàng sắp hết, nhằm đảm bảo vận hành bếp luôn đủ nguyên liệu và kiểm soát được chi phí.

---

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Xem danh sách hàng tồn kho**

1. Manager đăng nhập vào hệ thống, điều hướng đến menu **"Quản lý Kho"**.
2. Hệ thống hiển thị danh sách các mặt hàng trong kho của chi nhánh hiện tại.
3. Các thông tin hiển thị trong bảng danh sách:
   - Tên nguyên liệu / hàng hóa.
   - Đơn vị tính (kg, lít, hộp, gói,...).
   - Số lượng tồn kho hiện tại.
   - Mức tồn kho tối thiểu (min stock).
   - Trạng thái: **Đủ hàng** (xanh) / **Sắp hết** (vàng) / **Hết hàng** (đỏ).
   - Ngày cập nhật gần nhất.
4. Manager có thể tìm kiếm theo tên nguyên liệu.
5. Manager có thể lọc theo trạng thái tồn kho.

### **2.2. Luồng: Thêm mặt hàng vào kho (Tạo mới)**

1. Manager nhấn **"+ Thêm mặt hàng"**.
2. Popup hiện ra với các trường:
   - Tên nguyên liệu (bắt buộc).
   - Đơn vị tính (bắt buộc: kg, lít, cái, hộp,...).
   - Số lượng tồn kho ban đầu (mặc định: 0).
   - Mức tồn kho tối thiểu (để nhận cảnh báo).
3. Nhấn **"Lưu"** → Hệ thống tạo mặt hàng mới vào bảng `inventory_items` của chi nhánh đó.
4. Thông báo "Thêm mặt hàng thành công".

### **2.3. Luồng: Nhập kho (Nhận hàng từ nhà cung cấp)**

1. Manager tìm mặt hàng cần nhập → Nhấn nút **"Nhập kho"** (icon: `add_circle`).
2. Modal Nhập kho hiện ra:
   - Số lượng nhập (bắt buộc, > 0).
   - Ghi chú (tùy chọn: "Nhập từ nhà cung cấp A", "Nhập bù hàng trả lại",...).
3. Nhấn **"Xác nhận nhập"**.
4. Hệ thống:
   - Cộng thêm số lượng vào tồn kho hiện tại.
   - Ghi một bản ghi vào bảng `inventory_transactions` (loại: `IMPORT`, số lượng, ghi chú, người thực hiện, thời gian).
   - Cập nhật trạng thái tồn kho.
   - Thông báo "Nhập kho thành công".

### **2.4. Luồng: Xuất kho thủ công (Ghi nhận tiêu thụ/điều chỉnh)**

1. Manager tìm mặt hàng → Nhấn nút **"Xuất kho"** (icon: `remove_circle`).
2. Modal Xuất kho hiện ra:
   - Số lượng xuất (bắt buộc, > 0, không được lớn hơn tồn kho hiện tại).
   - Lý do (bắt buộc: Chọn từ list: "Tiêu thụ hàng ngày", "Hàng hỏng/hết hạn", "Điều chỉnh tồn kho", "Khác").
   - Ghi chú (tùy chọn).
3. Nhấn **"Xác nhận xuất"**.
4. Hệ thống:
   - Trừ số lượng khỏi tồn kho hiện tại.
   - Ghi một bản ghi vào `inventory_transactions` (loại: `EXPORT`).
   - Kiểm tra nếu tồn kho mới ≤ min stock → Hiển thị cảnh báo "Tồn kho nguyên liệu [Tên] đang thấp!".

### **2.5. Luồng: Xem lịch sử xuất/nhập kho**

1. Manager nhấn vào một mặt hàng → Chọn tab **"Lịch sử giao dịch"**.
2. Hệ thống hiển thị danh sách các giao dịch xuất/nhập theo thứ tự thời gian mới nhất lên trước.
3. Các thông tin hiển thị: Loại (Nhập/Xuất), Số lượng, Ghi chú, Người thực hiện, Thời gian.

### **2.6. Luồng: Cập nhật mức tồn kho tối thiểu**

1. Manager nhấn nút **"Sửa"** trên một mặt hàng.
2. Popup chỉnh sửa cho phép thay đổi:
   - Tên nguyên liệu.
   - Đơn vị tính.
   - Mức tồn kho tối thiểu (min stock).
3. Nhấn **"Lưu"** → Cập nhật ngay, thông báo thành công.

---

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Cách ly dữ liệu theo chi nhánh**
Given: Manager Chi nhánh A đăng nhập vào hệ thống.
When: Truy cập trang "Quản lý Kho".
Then: Hệ thống chỉ hiển thị danh sách kho của Chi nhánh A. Không thấy và không thể can thiệp vào kho của Chi nhánh B.

### **AC-02: Cảnh báo tồn kho thấp (Low Stock Alert)**
Given: Mặt hàng "Thịt bò" có mức min stock = 5 kg, tồn kho hiện tại = 10 kg.
When: Manager thực hiện xuất kho 6 kg.
Then: Sau khi xuất, tồn kho còn 4 kg (< 5 kg). Hệ thống phải hiển thị cảnh báo trực quan (màu đỏ/vàng, icon cảnh báo) ngay trên dòng mặt hàng đó.

### **AC-03: Ràng buộc xuất kho không âm**
Given: Mặt hàng "Muối" có tồn kho hiện tại = 2 kg.
When: Manager cố gắng xuất kho 5 kg.
Then: Hệ thống chặn thao tác và hiển thị lỗi: "Số lượng xuất vượt quá tồn kho hiện tại (2 kg). Vui lòng kiểm tra lại."

### **AC-04: Audit Trail đầy đủ**
Given: Manager thực hiện nhập kho 10 kg "Gạo".
When: Bản ghi được lưu thành công.
Then: Hệ thống phải ghi lại vào `inventory_transactions`: Loại giao dịch (IMPORT), Số lượng (10), Người thực hiện (ID của Manager), Thời gian (timestamp), Ghi chú (nếu có). Dữ liệu này không thể bị xóa hay sửa.

### **AC-05: Lịch sử giao dịch đúng thứ tự**
Given: Có 5 giao dịch xuất/nhập đã được ghi lại cho mặt hàng "Dầu ăn".
When: Manager xem lịch sử giao dịch của mặt hàng đó.
Then: Danh sách phải được sắp xếp theo thứ tự thời gian giảm dần (giao dịch mới nhất lên trên đầu).

### **AC-06: Validation dữ liệu nhập kho/xuất kho**
Given: Manager đang điền form nhập/xuất kho.
When: Nhập số lượng <= 0 hoặc để trống.
Then: Hệ thống chặn và hiển thị lỗi ngay trên trường nhập: "Số lượng phải là số dương lớn hơn 0."
