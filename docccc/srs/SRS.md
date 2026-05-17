# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)

**Dự án: Xây dựng Phần mềm Quản lý Chuỗi Nhà hàng (Restaurant Chain Management System)**

---

## 1. Giới thiệu

### 1.1 Mục đích

Mục đích của tài liệu đặc tả yêu cầu phần mềm này là cung cấp một cái nhìn tổng quan, chi tiết và dễ hiểu về các yêu cầu chức năng, phi chức năng và kiến trúc của hệ thống Quản lý Chuỗi Nhà hàng. Tài liệu là cầu nối giữa đội ngũ phát triển, người kiểm thử và chủ đầu tư để đảm bảo phần mềm đáp ứng đúng nghiệp vụ quản lý tập trung và vận hành phân tán.

### 1.2 Phạm vi

Phần mềm cung cấp giải pháp toàn diện để vận hành một chuỗi nhà hàng có nhiều chi nhánh, bao gồm:
- **Quản trị trung tâm (Headquarters):** Quản lý danh sách chi nhánh, quản lý thực đơn gốc (Master Menu), thống kê báo cáo toàn chuỗi.
- **Vận hành chi nhánh (Branches):** Tùy chỉnh thực đơn địa phương (giá bán, trạng thái), sơ đồ bàn, quản lý nhân sự tại chi nhánh.
- **Nghiệp vụ hằng ngày:** Hệ thống POS cho phục vụ/thu ngân và màn hình KDS (Kitchen Display System) cho khu vực Bếp.

### 1.3 Từ điển thuật ngữ

| Thuật ngữ / Viết tắt | Ý nghĩa |
| --- | --- |
| **SRS** | Đặc tả yêu cầu phần mềm (Software Requirements Specification). |
| **Boss / HQ** | Chủ chuỗi nhà hàng hoặc Quản trị viên cấp cao nhất. |
| **Manager** | Quản lý của một chi nhánh cụ thể. |
| **Master Menu** | Thực đơn gốc do Boss quản lý, định nghĩa món ăn chuẩn cho toàn hệ thống. |
| **Branch Menu** | Thực đơn tại chi nhánh, do Manager điều chỉnh giá bán và tình trạng hết/còn. |
| **POS** | Điểm bán hàng (Point of Sale) - Giao diện dành cho nhân viên phục vụ/thu ngân. |
| **KDS** | Hệ thống hiển thị tại bếp (Kitchen Display System) thay thế cho máy in bill truyền thống. |

---

## 2. Các yêu cầu chức năng

### 2.1 Các tác nhân (Actors)

Hệ thống được thiết kế với cơ chế phân quyền đa cấp, bao gồm 4 tác nhân chính:

1. **Boss (Chủ chuỗi):** Có toàn quyền trên hệ thống. Quản lý danh sách chi nhánh, Master Menu, và xem báo cáo tổng hợp toàn chuỗi.
2. **Manager (Quản lý chi nhánh):** Quyền hạn bị giới hạn trong phạm vi chi nhánh được giao. Quản lý nhân sự chi nhánh, sơ đồ bàn, Branch Menu, và báo cáo chi nhánh.
3. **Staff (Phục vụ / Thu ngân):** Thao tác trên máy POS để mở bàn, gọi món, thanh toán hóa đơn.
4. **Chef (Bếp trưởng / Đầu bếp):** Thao tác trên màn hình KDS để nhận order, cập nhật trạng thái món ăn.

### 2.2 Các chức năng chính (Modules)

1. **Module Quản trị Hệ thống & Chi nhánh:** Tạo mới, khóa/mở khóa các chi nhánh. Quản lý tài khoản và phân quyền.
2. **Module Quản lý Thực đơn (Dual-level):** 
   - Cấp Chuỗi: Quản lý danh mục và món ăn gốc.
   - Cấp Chi nhánh: Tùy chỉnh giá bán lẻ (`local_price`) và bật/tắt phục vụ.
3. **Module Quản lý Sơ đồ bàn:** Thiết kế và hiển thị sơ đồ bàn trực quan theo khu vực của từng chi nhánh.
4. **Module Bán hàng (POS):** Mở bàn, gọi món, đổi/hủy món, áp dụng khuyến mãi, thanh toán và in hóa đơn.
5. **Module Nghiệp vụ Bếp (KDS):** Hiển thị order realtime, gom món, cập nhật trạng thái (Đang nấu, Hoàn thành), báo hết nguyên liệu.
6. **Module Báo cáo Thống kê:** Dashboard doanh thu, thống kê món bán chạy, lịch sử giao dịch (có phân cấp theo quyền Boss/Manager).

---

## 3. Đặc tả các Use Case chi tiết

### UC01: Xác thực và Phân quyền đa cấp
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC01 |
| **Tác nhân** | Tất cả người dùng |
| **Mô tả** | Đăng nhập hệ thống và định tuyến giao diện dựa trên vai trò (Role) và chi nhánh trực thuộc. |
| **Luồng chính** | 1. Nhập SĐT/Email và Mật khẩu.<br>2. Hệ thống kiểm tra thông tin.<br>3. Nếu là Boss -> Vào Dashboard Tổng.<br>4. Nếu là Manager -> Vào Dashboard Chi nhánh.<br>5. Nếu là Staff -> Vào màn hình POS.<br>6. Nếu là Chef -> Vào màn hình KDS. |

### UC02: Quản lý Chi nhánh (Branch Management)
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC02 |
| **Tác nhân** | Boss |
| **Mô tả** | Xem, thêm mới, cập nhật thông tin hoặc đóng cửa (vô hiệu hóa) một chi nhánh. |
| **Luồng chính** | 1. Boss vào "Quản lý chi nhánh".<br>2. Thêm mới chi nhánh (Tên, Địa chỉ, SĐT).<br>3. Hệ thống tạo chi nhánh và tự động thiết lập Branch Menu trống chờ đồng bộ. |

### UC03: Quản lý Thực đơn gốc & Phân bổ (Master Menu)
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC03 |
| **Tác nhân** | Boss |
| **Mô tả** | Quản lý món ăn chuẩn. Khi thêm món mới, tự động đồng bộ xuống tất cả chi nhánh. |
| **Luồng chính** | 1. Boss thêm món ăn mới (Tên, Ảnh, Giá gốc).<br>2. Hệ thống lưu vào Master Menu.<br>3. Tự động tạo bản ghi ở tất cả Branch Menu với trạng thái mặc định "Ngừng bán" (chờ Manager duyệt). |

### UC04: Tùy chỉnh Thực đơn Chi nhánh (Branch Menu)
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC04 |
| **Tác nhân** | Manager |
| **Mô tả** | Tùy chỉnh giá bán lẻ và tình trạng phục vụ của món ăn tại địa phương. |
| **Luồng chính** | 1. Manager vào "Thực đơn chi nhánh".<br>2. Chọn món cần sửa giá hoặc bật/tắt phục vụ.<br>3. Lưu lại. Hệ thống lập tức đồng bộ thay đổi này lên các máy POS của chi nhánh đó. |

### UC05: Nghiệp vụ Bán hàng (POS)
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC05 |
| **Tác nhân** | Staff |
| **Mô tả** | Phục vụ khách hàng từ lúc vào bàn đến khi thanh toán. |
| **Luồng chính** | 1. Chọn bàn trống -> Mở bàn.<br>2. Gọi món -> Dữ liệu món lấy từ Branch Menu -> Nhấn "Gửi bếp".<br>3. Khi khách thanh toán -> In tạm tính -> Nhận tiền -> Chốt hóa đơn -> Giải phóng bàn. |

### UC06: Nghiệp vụ Bếp (KDS)
| Thông tin | Chi tiết |
| --- | --- |
| **Mã UC** | UC06 |
| **Tác nhân** | Chef |
| **Mô tả** | Quản lý thứ tự nấu món và cập nhật trạng thái cho POS. |
| **Luồng chính** | 1. Bếp nhận order realtime từ POS.<br>2. Bấm "Bắt đầu nấu".<br>3. Bấm "Hoàn thành" -> POS nhận thông báo để nhân viên ra lấy đồ.<br>4. Nếu hết nguyên liệu -> Bấm "Hết món" -> POS tự động khóa món này lại. |

---

## 4. Các yêu cầu phi chức năng

### 4.1 Giao diện người dùng (UI/UX)
- **Hệ thống POS & KDS:** Thiết kế tối ưu cho màn hình cảm ứng (Tablet/POS terminal). Giao diện tối/sáng tùy chỉnh, các nút bấm thao tác cực nhanh, hạn chế pop-up không cần thiết.
- **Hệ thống Quản trị (Admin/Manager):** Giao diện Web-based hiển thị tốt trên Desktop/Laptop. Dashboard hiển thị số liệu trực quan bằng biểu đồ.

### 4.2 Hiệu năng (Performance)
- Các thao tác "Gửi bếp" từ POS sang KDS phải phản hồi theo thời gian thực (Real-time, độ trễ < 2 giây).
- Dữ liệu hóa đơn và thực đơn phải có cơ chế cache offline/sync để chống lỗi khi mạng nội bộ chập chờn.

### 4.3 Tính toàn vẹn và Bảo mật
- **Data Isolation:** Dữ liệu chi nhánh nào chỉ chi nhánh đó được xem (Manager/Staff). Chỉ Boss mới xem được toàn chuỗi.
- **Xóa mềm (Soft Delete):** Không xóa cứng dữ liệu (Chi nhánh, Nhân sự, Món ăn) để bảo vệ toàn vẹn lịch sử hóa đơn kế toán.
- Ràng buộc dữ liệu chặt chẽ bằng Transaction trong CSDL khi thực hiện luồng thanh toán.