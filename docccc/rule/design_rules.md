# HƯỚNG DẪN QUY TẮC THIẾT KẾ GIAO DIỆN (UI/UX DESIGN GUIDELINES)

Tài liệu này định nghĩa hệ thống màu sắc, kiểu dáng (style), phông chữ, biểu tượng và các thành phần giao diện chuẩn được áp dụng thống nhất cho toàn bộ dự án **Frontend (React JS + Tailwind CSS v4)**. Việc tuân thủ các quy tắc này giúp giao diện nhất quán, chuyên nghiệp và mang lại trải nghiệm người dùng cao cấp (Premium UX/UI).

---

## I. HỆ THỐNG MÀU SẮC (COLOR SYSTEM)

Dự án sử dụng bộ biến CSS và cấu hình `@theme` của Tailwind CSS v4 trong file [index.css](file:///d:/Duannnn/react-frontend/src/index.css). Tuyệt đối **không hardcode** mã màu trực tiếp (ví dụ: `bg-[#F97316]`), hãy luôn sử dụng các class Tailwind tương ứng được ánh xạ từ theme.

### 1. Màu thương hiệu (Brand Colors)

| Tên biến CSS | Tên class Tailwind | Mã màu (Hex/RGBA) | Trực quan | Mô tả cách sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `--color-primary` | `bg-primary`, `text-primary` | `#F97316` | 🟧 | Màu cam chủ đạo (Vibrant Orange), dùng cho nút chính (CTA), điểm nhấn quan trọng, link chính. |
| `--color-primary-hover` | `hover:bg-primary-hover` | `#EA580C` | 🟧 | Màu cam đậm hơn khi di chuột (hover) vào các phần tử sử dụng màu Primary. |
| `--color-primary-light` | `bg-primary-light` | `#FFF7ED` | 🟨 | Màu nền cam cực nhạt, dùng làm nền cho dòng bảng được chọn, hover thanh điều hướng, hoặc nền thông báo nhẹ. |
| `--color-primary-text` | `text-primary-text` | `#FFFFFF` | ⬜ | Màu chữ hiển thị trên nền cam Primary (màu trắng). |
| `--color-primary-glow` | - | `rgba(249, 115, 22, 0.4)` | 🟧 | Hiệu ứng đổ bóng phát sáng (glow) xung quanh nút chính hoặc thẻ được active. |

---

### 2. Màu trung tính & Giao diện (Neutrals & Surface Colors)

| Tên biến CSS | Tên class Tailwind | Mã màu (Hex/RGBA) | Trực quan | Mô tả cách sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `--color-bg` | `bg-bg` | `#F1F5F9` | ⬜ | Màu nền mặc định của toàn trang (Body Background), xám nhẹ tạo cảm giác dễ chịu và nổi bật cho các thẻ nội dung. |
| `--color-surface` | `bg-surface` | `rgba(255, 255, 255, 0.95)` | ⬜ | Màu nền của các thẻ (Cards), hộp thoại (Modals), hoặc phần chứa nội dung nổi trên nền trang. Hỗ trợ hiệu ứng kính (Glassmorphism). |
| `--color-sidebar` | `bg-sidebar` | `#FFFFFF` | ⬜ | Màu nền của thanh Menu bên trái (Sidebar Navigation). |
| `--color-border` | `border-border` | `#E2E8F0` | ⬜ | Màu viền mặc định của bảng, các ô nhập liệu, đường phân cách giữa các phần. |
| `--color-border-hover` | `hover:border-border-hover` | `#CBD5E1` | ⬜ | Màu viền khi người dùng di chuột qua các thành phần nhập liệu hoặc viền thẻ. |

---

### 3. Màu văn bản (Text Colors)

Màu văn bản được chia làm 3 phân cấp để hướng sự chú ý của người dùng một cách tự nhiên (Visual Hierarchy):

*   **Chữ chính (`--color-text-primary` / `text-text-primary` - `#0F172A`):** Dùng cho tiêu đề lớn (h1, h2, h3), các dòng text chính, nhãn biểu mẫu quan trọng.
*   **Chữ phụ (`--color-text-secondary` / `text-text-secondary` - `#475569`):** Dùng cho mô tả phụ, thông tin chi tiết, nhãn biểu mẫu thông thường, text phụ trong bảng.
*   **Chữ giữ chỗ (`--color-text-placeholder` / `text-text-placeholder` - `#94A3B8`):** Dùng cho chữ ẩn gợi ý trong ô input (Placeholder), các trạng thái trống (empty state).

---

### 4. Màu chỉ thị trạng thái (Status Colors)

Mỗi trạng thái của hệ thống (ví dụ: Trạng thái hóa đơn, Trạng thái bàn ăn, Kết quả hành động) bắt buộc sử dụng đúng cặp màu quy định bên dưới:

| Trạng thái | Mã màu chữ (CSS / Tailwind Class) | Mã màu nền (CSS / Tailwind Class) | Trực quan | Ứng dụng thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **Thành công (Success)** | `#10B981` (`text-success`) | `#D1FAE5` (`bg-success-bg`) | 🟩 | Đã hoàn thành thanh toán, Đã gửi bếp, Hoạt động (Active). |
| **Lỗi/Nguy hiểm (Danger)** | `#EF4444` (`text-danger`) | `#FEE2E2` (`bg-danger-bg`) | 🟥 | Lỗi validate, Nút Xóa dữ liệu, Đơn bị hủy (Canceled). |
| **Cảnh báo (Warning)** | `#F59E0B` (`text-warning`) | `#FEF3C7` (`bg-warning-bg`) | 🟨 | Đang xử lý (Pending), Cần xác nhận, Bàn đã đặt trước. |
| **Không hoạt động (Inactive)** | `#64748B` (`text-inactive`) | `#F1F5F9` (`bg-inactive-bg`) | ⬛ | Tạm ngưng hoạt động, Bản nháp (Draft), Đã đóng cửa. |

> [!IMPORTANT]
> Luôn kết hợp mã màu nền trạng thái (`-bg`) nhạt với màu chữ trạng thái đậm để đảm bảo độ tương phản dễ đọc đạt chuẩn WCAG về Accessibility.

---

## II. HỆ THỐNG PHÔNG CHỮ & BIỂU TƯỢNG (TYPOGRAPHY & ICONS)

### 1. Phông chữ (Typography)
*   **Font-family chính:** `"Inter", system-ui, sans-serif` (được import trực tiếp từ Google Fonts).
*   **Cỡ chữ & Độ dày (Font Size & Weight):**
    *   **Page Title (Tiêu đề trang):** Cỡ chữ `text-3xl` (hoặc `text-4xl`), font-weight `font-extrabold` (800), căn lề khít `tracking-tight`.
    *   **Section Title / Modal Title:** Cỡ chữ `text-xl`, font-weight `font-bold` (700), `tracking-tight`.
    *   **Form Labels:** Cỡ chữ `text-sm`, font-weight `font-semibold` (600), `tracking-wide`.
    *   **Nội dung bảng / Chữ thường:** Cỡ chữ `text-sm`, font-weight `font-medium` (500) hoặc `font-normal` (400).
    *   **Chú thích / Badge:** Cỡ chữ `text-xs`, font-weight `font-bold` (700) hoặc `font-semibold` (600).

### 2. Biểu tượng (Icons)
*   **Thư viện sử dụng:** `Material Symbols Outlined` (được nhúng qua liên kết font trong `index.css`).
*   **Cách sử dụng chuẩn:**
    ```tsx
    <span className="material-symbols-outlined text-xl">home</span>
    ```
*   **Quy tắc kích thước icon:**
    *   Trong nút bấm nhỏ/Badge: `text-sm` (16px) hoặc `text-base` (18px).
    *   Trong nút bấm chuẩn/Thanh Menu: `text-xl` (20px) hoặc `text-2xl` (24px).
    *   Icon tiêu đề trang / Trạng thái trống lớn: `text-3xl` (30px) đến `text-5xl` (48px).

---

## III. QUY TẮC CẤU TRÚC PHẦN TỬ GIAO DIỆN (UI COMPONENTS)

Các class thành phần bên dưới đã được chuẩn hóa trong tầng `@layer components` của `index.css`. Lập trình viên nên sử dụng các class này thay vì viết lại các class Tailwind rời rạc.

### 1. Nút bấm (Buttons)
Mọi nút bấm phải có kích thước tiêu chuẩn, khoảng cách đệm (`px-5 py-2.5`), bo góc `rounded-xl`, kích thước chữ `text-sm font-semibold`, kèm các hiệu ứng tương tác (hover, active, transition).

*   **Primary Button (`.btn-primary`):** Nút chính của hành động (Ví dụ: Lưu, Thanh toán, Thêm mới).
    *   *Hiệu ứng:* Dùng dải màu gradient từ màu cam thường sang cam đậm, đổ bóng màu cam mờ. Khi hover sẽ dịch chuyển lên trên `-2px` và tăng độ sáng nhẹ. Khi click (active) sẽ co lại nhẹ `scale(0.98)`.
*   **Ghost Button (`.btn-ghost`):** Nút phụ, không muốn nổi bật quá mức (Ví dụ: Hủy, Quay lại).
    *   *Hiệu ứng:* Nền trong suốt, viền xám nhẹ. Khi hover sẽ đổi sang nền kính trắng đục, viền xám đậm hơn và dịch lên `-1px`.
*   **Danger Button (`.btn-danger`):** Nút cho các hành động nguy hiểm (Ví dụ: Xóa, Hủy đơn).
    *   *Hiệu ứng:* Nền đỏ nhạt, chữ màu đỏ đậm. Khi hover chuyển nền đỏ đậm hơn một chút và đổi bóng đỏ mờ.
*   **Icon Button (`.btn-icon`):** Nút tròn hoặc vuông nhỏ chỉ chứa Icon (Ví dụ: Nút đóng [x], nút chỉnh sửa nhanh).
    *   *Hiệu ứng:* Không viền. Khi hover chuyển nền cam cực nhạt (`var(--color-primary-light)`), icon chuyển màu cam, phóng to nhẹ `scale(1.1)`.

---

### 2. Ô nhập liệu (Form & Inputs)
*   **Input chuẩn (`.input`):** Bo góc `rounded-xl`, đệm `px-4 py-2.5`, nền trắng kính mờ, viền xám. Khi hover viền sẫm màu hơn. Khi focus, viền đổi thành màu cam chủ đạo, tạo hiệu ứng phát sáng mờ màu cam xung quanh (`box-shadow` rộng 4px màu cam mờ).
*   **Lỗi nhập liệu (`.input.error`):** Viền chuyển sang màu đỏ. Khi focus sẽ tạo hiệu ứng phát sáng mờ màu đỏ.
*   **Thông báo lỗi (`.field-error`):** Hiển thị ngay dưới ô nhập liệu lỗi, chữ màu đỏ `text-xs font-medium` kèm icon cảnh báo nhỏ, áp dụng hiệu ứng xuất hiện từ từ (fade-in).

---

### 3. Hộp nội dung (Cards)
*   **Quy cách thiết kế (`.card`):**
    *   Bo góc tròn mềm mại `rounded-2xl` với đệm `p-6`.
    *   Sử dụng hiệu ứng kính mờ (Glassmorphism): Nền màu Surface trong suốt nhẹ (`rgba(255, 255, 255, 0.95)`), kết hợp bộ lọc làm mờ phía sau `backdrop-filter: blur(12px)`.
    *   Đường viền màu trắng trong suốt siêu mỏng `border: 1px solid rgba(255, 255, 255, 0.5)` tạo hiệu ứng phản chiếu ánh sáng.
    *   **Hiệu ứng Hover:** Đổ bóng sâu hơn (`shadow-card-hover`), nhấc nhẹ lên trên `translate-y-[-2px]` tạo cảm giác nổi 3D.

---

### 4. Bảng dữ liệu (Tables)
*   **Quy cách thiết kế (`.table-wrapper`):**
    *   Khung bọc ngoài bảng phải có bo góc `rounded-2xl`, ẩn các phần thừa ra ngoài (`overflow-hidden`), bóng đổ card mượt.
    *   **Header (`<thead> th`):** Nền xám nhạt (`#F8FAFC`), chữ xám đậm, in hoa toàn bộ, cỡ chữ cực nhỏ `text-xs font-bold` tạo nét tinh tế.
    *   **Hàng dữ liệu (`<tbody> tr`):** Có đường phân cách dưới mỏng. Khi hover lên dòng, dòng đó sẽ tự động chuyển sang màu nền cam cực nhạt (`var(--color-primary-light)`) để người dùng dễ theo dõi dòng dữ liệu lớn.

---

### 5. Hộp thoại nổi (Modals)
*   **Phông nền phủ (`.modal-backdrop`):** Phủ toàn màn hình với màu tối dịu `rgba(15,23,42,0.5)`, kết hợp hiệu ứng làm mờ cảnh nền phía sau `backdrop-filter: blur(8px)` để người dùng tập trung hoàn toàn vào modal.
*   **Hộp Modal (`.modal-box`):** Bo góc tròn rất lớn `rounded-3xl`, p-8 (đệm rộng rãi), viền kính mỏng, đổ bóng modal rất sâu để tách biệt hoàn toàn khỏi các lớp bên dưới.

---

### 6. Thanh điều hướng (Navigation - Sidebar)
*   **Menu Item (`.nav-item`):**
    *   Thiết kế dạng thanh bo góc `rounded-xl`, chữ màu xám đậm.
    *   Sử dụng gờ chỉ thị màu cam dạng dải dọc mỏng ở mép trái (`::before` với độ dày `3px`), mặc định ẩn (scale Y = 0).
    *   Khi di chuột hoặc khi ở trạng thái kích hoạt (`.active`), phần tử sẽ chuyển sang màu chữ cam, nền cam nhạt, dịch chuyển nhẹ sang phải `translate-x-[4px]` và gờ chỉ thị màu cam hiện ra rõ ràng (scale Y = 1).

---

## IV. ĐỘ SÂU & HIỆU ỨNG ĐỘNG (DEPTH & ANIMATION)

Dự án nhấn mạnh vào tính chuyển động sinh động (Premium Design) thông qua các lớp animation mặc định:

1.  **Hiệu ứng hiện rõ dần (`.animate-fade-in`):** Xuất hiện mượt mà trong `0.3s`, dùng cho các ô gợi ý, thông báo lỗi, backdrop.
2.  **Hiệu ứng trượt từ dưới lên (`.animate-slide-up`):** Trượt nhẹ từ dưới lên `10px` kết hợp hiện rõ dần trong `0.4s` sử dụng đường cong gia tốc mượt (`cubic-bezier(0.16, 1, 0.3, 1)`). Thích hợp dùng cho tiêu đề trang, Cards, Tables, và danh sách sản phẩm lúc tải trang.
3.  **Hiệu ứng phóng to mượt (`.animate-scale-in`):** Phóng từ tỷ lệ `0.95` lên `1` trong `0.3s`, phù hợp nhất khi mở các hộp thoại Modal hoặc Menu thả xuống (Dropdown).

---

## V. TỔNG HỢP NGUYÊN TẮC PHÁT TRIỂN GIAO DIỆN (DEVELOPER CHECKLIST)

*   [ ] **Không hardcode màu sắc:** Không dùng các màu thô như `bg-red-500`, `text-blue-600`. Hãy luôn sử dụng `bg-danger`, `text-success`, `bg-primary`, `text-text-primary`,... để đồng bộ với cấu hình hệ thống.
*   [ ] **Bo góc nhất quán:**
    *   `rounded-full` cho Badge / Chip trạng thái.
    *   `rounded-xl` (12px) cho Button, Input, Dropdown.
    *   `rounded-2xl` (16px) cho Cards, Bảng dữ liệu, Sidebar items.
    *   `rounded-3xl` (24px) cho các khung Modal lớn.
*   [ ] **Độ tương phản:** Luôn kiểm tra màu chữ và màu nền để đảm bảo nội dung hiển thị rõ ràng, không sử dụng chữ màu nhạt trên nền sáng.
*   [ ] **Phản hồi tương tác (Interactive States):** Đảm bảo mọi thành phần người dùng có thể nhấp chuột vào (Nút, dòng bảng, thẻ sản phẩm, menu) đều có hiệu ứng thay đổi rõ ràng khi di chuột (`hover:`) và khi nhấn xuống (`active:`).
*   [ ] **Responsive:** Sử dụng hệ thống lưới (Grid / Flexbox) linh hoạt kết hợp tiền tố `sm:`, `md:`, `lg:`, `xl:` để giao diện hiển thị xuất sắc cả trên máy POS bán hàng, máy tính bảng và màn hình máy tính lớn.
