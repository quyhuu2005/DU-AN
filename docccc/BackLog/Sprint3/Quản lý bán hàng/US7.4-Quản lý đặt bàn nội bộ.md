# US-9.1: Quản lý đặt bàn nội bộ (Staff-driven Reservation)

**1. Vấn đề (Problem):**
Nhà hàng nhận đặt bàn qua điện thoại, tin nhắn hoặc khách walk-in nhưng hiện tại chưa có hệ thống ghi nhận. Việc quản lý bằng sổ tay dễ gây sai sót, trùng lặp giờ hoặc quên chuẩn bị bàn.

**2. Giá trị Nghiệp vụ (Business Value):**
Giúp nhân viên và quản lý nắm bắt trước lượng khách, sắp xếp bàn hợp lý, tránh tình trạng khách đến không có bàn hoặc bàn bị bỏ trống lãng phí. Nâng cao tính chuyên nghiệp trong phục vụ.

**3. Đối tượng (Actor):**
Manager (Quản lý) và Staff (Nhân viên).

**4. User Story Statement:**
*Là một Nhân viên/Quản lý, tôi muốn có thể tạo và quản lý các lịch đặt bàn của khách hàng ngay trên hệ thống nội bộ để dễ dàng theo dõi và giữ bàn cho khách.*

**5. Kịch bản (Scenarios):**

**5.1. Luồng tạo đặt bàn:**
1. Nhân viên nhận thông tin đặt bàn từ khách (Tên, SĐT, Số lượng khách, Ngày giờ đến).
2. Nhân viên vào chức năng "Đặt bàn" trên hệ thống Admin.
3. Nhân viên điền thông tin và chọn 1 bàn còn trống trong khung giờ đó (hoặc để trống "Chưa xếp bàn").
4. Hệ thống lưu lại Reservation với trạng thái `CONFIRMED`.
5. Bàn được chọn sẽ chuyển sang trạng thái `RESERVED` trên Sơ đồ bàn.

**5.2. Luồng nhận bàn (Tại POS):**
1. Đến giờ khách tới, nhân viên vào màn hình POS.
2. Bàn đã đặt hiển thị màu vàng (RESERVED).
3. Nhân viên click vào bàn, xem thông tin đặt chỗ và bấm "Nhận bàn".
4. Hệ thống chuyển trạng thái bàn thành `OCCUPIED`, tự động tạo một Order mới cho bàn đó và chuyển trạng thái Reservation thành `SEATED`.

**5.3. Luồng khách không đến (No-show):**
1. Quá giờ đặt 15 phút, khách chưa tới.
2. Nhân viên có thể click vào bàn RESERVED và chọn "No-show" (hoặc "Hủy").
3. Bàn được giải phóng về trạng thái `EMPTY`, Reservation chuyển sang `NO_SHOW` hoặc `CANCELLED`.

**6. Tiêu chí Chấp nhận (Acceptance Criteria):**

- **AC-01: Kiểm tra bàn trống**
  - **Given**: Khách muốn đặt Bàn 01 vào 19:00 - 20:30.
  - **When**: Nhân viên chọn Bàn 01 cho khoảng thời gian này.
  - **Then**: Hệ thống chỉ cho phép lưu nếu Bàn 01 không có Reservation nào khác trùng/giao cắt (overlap) khung giờ đó.

- **AC-02: Đồng bộ POS**
  - **Given**: Một bàn đang ở trạng thái `RESERVED` do có lịch đặt.
  - **When**: Nhân viên bấm "Nhận bàn" trên màn hình POS.
  - **Then**: Bàn chuyển sang `OCCUPIED`, hiển thị Order mới. Không ai có thể mở thêm Order đè lên.
