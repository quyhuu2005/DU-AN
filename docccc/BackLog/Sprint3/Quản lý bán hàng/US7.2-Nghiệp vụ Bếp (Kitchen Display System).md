## **1. Tổng quan & Bối cảnh (Overview & Context)**

### **Vấn đề (Problem):**

Trong vận hành nhà hàng, sự phối hợp giữa bộ phận Phục vụ và bộ phận Bếp thường gặp khó khăn nếu dùng phương pháp ghi giấy hoặc in bill thủ công:
- Thất lạc bill hoặc bill bị ướt/hỏng trong môi trường bếp.
- Đầu bếp khó theo dõi thứ tự ưu tiên món nào vào trước làm trước.
- Nhân viên phục vụ không biết khi nào món đã xong để ra lấy, dẫn đến món bị nguội.
- Khi hết nguyên liệu, Bếp khó thông báo kịp thời cho Phục vụ để ngừng nhận order món đó.

### **Giá trị Nghiệp vụ (Business Value):**

- **Tối ưu hóa quy trình chế biến:** Màn hình Bếp (KDS) giúp hiển thị danh sách món ăn cần làm theo thời gian thực, sắp xếp khoa học.
- **Giảm thời gian chờ của khách:** Cảnh báo món chờ lâu giúp Bếp điều tiết nhân lực hợp lý.
- **Đồng bộ hóa dữ liệu:** Trạng thái "Hết món" được cập nhật ngay lập tức lên toàn hệ thống POS, tránh tình trạng khách gọi món nhưng bếp không làm được.
- **Nâng cao chất lượng phục vụ:** Thông báo tự động cho nhân viên khi món hoàn thành giúp món ăn được phục vụ khách khi còn nóng hổi.

### **Đối tượng (Actor):**

- **Primary Actor:** Bếp trưởng / Đầu bếp (Chef)
  - Tiếp nhận order, cập nhật trạng thái chế biến.
  - Quản lý tình trạng còn/hết của món ăn tại bếp.
- **Secondary Actors:** 
  - Nhân viên phục vụ (Staff): Nhận thông báo khi món xong để đi trả món.
  - Quản lý (Manager): Theo dõi hiệu suất chế biến (thời gian trung bình hoàn thành món).

### **User Story Statement**

Là Đầu bếp, tôi muốn sử dụng màn hình hiển thị tại bếp (KDS) để tiếp nhận các yêu cầu món ăn từ máy POS theo thời gian thực và cập nhật trạng thái chế biến nhằm đảm bảo quy trình phục vụ diễn ra nhanh chóng và chính xác.

---

## **2. Luồng Người dùng (User Flow)**

### **2.1. Luồng chính: Xem danh sách món cần chế biến**

1. Chef đăng nhập vào hệ thống, chọn chế độ "Màn hình Bếp".
2. Hệ thống hiển thị danh sách các món ăn đang ở trạng thái "Chờ chế biến" hoặc "Đang nấu".
3. Các thông tin hiển thị trên mỗi "Thẻ món ăn":
   - Tên món
   - Số lượng
   - Số bàn
   - Thời gian đã chờ (đồng hồ đếm xuôi)
   - Ghi chú đặc biệt (ví dụ: "Không cay", "Ít hành")
4. Danh sách được sắp xếp mặc định theo thời gian gọi món (Món cũ nhất nằm trên đầu/bên trái).

### **2.2. Luồng: Cập nhật trạng thái chế biến**

1. Chef bắt đầu thực hiện một món ăn, nhấn vào nút **"Bắt đầu"** (Start) trên thẻ món.
2. Hệ thống chuyển trạng thái món sang **"Đang nấu"** (Cooking). Màu sắc thẻ thay đổi (ví dụ: sang màu Vàng).
3. Khi món đã làm xong, Chef nhấn nút **"Hoàn thành"** (Ready).
4. Hệ thống:
   - Chuyển trạng thái món sang **"Chờ cung ứng"** (Ready to Serve).
   - Gửi thông báo đến máy POS của nhân viên phụ trách bàn đó.
   - Thẻ món biến mất khỏi màn hình Bếp (hoặc chuyển sang danh sách "Đã xong").

### **2.3. Luồng: Gom món (Item Aggregation)**

1. Chef chuyển sang tab "Tổng hợp món".
2. Hệ thống liệt kê tổng số lượng theo từng loại món (ví dụ: "Phở Bò: 5 bát", "Cơm rang: 3 đĩa") thay vì hiển thị theo bàn.
3. Chef có thể nhấn "Hoàn thành 1 lượt" cho một số lượng món nhất định.
4. Hệ thống tự động cập nhật trạng thái "Hoàn thành" cho các bàn tương ứng theo thứ tự thời gian.

### **2.4. Luồng: Báo hết món (Out of Stock)**

1. Tại màn hình Bếp, Chef nhấn vào danh sách "Thực đơn".
2. Tìm món ăn đã hết nguyên liệu.
3. Nhấn Toggle **"Hết món"**.
4. Hệ thống:
   - Cập nhật trạng thái `is_available = false` trong bảng `branch_menu` của chi nhánh đó.
   - Nhân viên POS sẽ thấy món bị mờ và không thể click chọn để gọi món mới.

---

## **3. Tiêu chí Chấp nhận (Acceptance Criteria)**

### **AC-01: Cập nhật thời gian thực (Real-time)**
Given: Màn hình Bếp đang mở.
When: Nhân viên POS nhấn "Gửi bếp" cho một Order.
Then: Món ăn đó phải xuất hiện trên màn hình Bếp trong vòng dưới 2 giây mà không cần load lại trang.

### **AC-02: Hiển thị đầy đủ thông tin nghiệp vụ**
Given: Danh sách món hiển thị ở bếp.
When: Có một món có ghi chú đặc biệt (ví dụ: "Dị ứng lạc").
Then: Ghi chú này phải được hiển thị nổi bật (chữ đỏ hoặc in đậm) để Chef không bỏ sót.

### **AC-03: Cảnh báo thời gian chờ (SLA)**
Given: Một món ăn đang ở trạng thái "Chờ" hoặc "Đang nấu".
When: Thời gian chờ vượt quá ngưỡng cấu hình (ví dụ: > 15 phút).
Then: Thẻ món ăn phải đổi màu (ví dụ: viền đỏ nhấp nháy) để cảnh báo Chef về việc chậm trễ.

### **AC-04: Đồng bộ hóa trạng thái Hết món**
Given: Chef đánh dấu món "Cá hồi áp chảo" là "Hết món".
When: Nhân viên phục vụ mở màn hình gọi món trên máy POS.
Then: Món "Cá hồi áp chảo" phải hiển thị trạng thái "Hết hàng" và không cho phép thêm vào hóa đơn.

### **AC-05: Thông báo hoàn thành món**
Given: Chef nhấn "Hoàn thành" cho bàn số 5.
When: Trạng thái được cập nhật thành công.
Then: Hệ thống phải phát tín hiệu (âm báo hoặc thông báo popup) trên thiết bị của nhân viên phục vụ bàn số 5.

### **AC-06: Bảo toàn dữ liệu khi có sự cố mạng**
Given: Màn hình bếp đang hoạt động.
When: Mất kết nối internet và kết nối lại.
Then: Hệ thống phải tự động đồng bộ lại danh sách món mới nhất từ server, tránh bị sót order trong thời gian mất mạng.
