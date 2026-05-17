

========================================
I. Frontend
========================================

-- React JS (Vite + TypeScript + Tailwind CSS v4) --

react-frontend/
├── .husky/                     # Pre-commit hook (kiểm tra lint, type-check trước khi commit)
├── public/                     # Tài nguyên tĩnh (favicon, robots.txt, logo)
├── src/
│   ├── assets/                 # Tài nguyên đi qua build (images, svg, local fonts)
│   ├── components/             # Các component dùng chung
│   │   ├── base/               # Các UI component cơ bản (Button, Table, Input, Modal...)
│   │   └── features/           # Component nghiệp vụ (VD: POSCart, KDSOrderCard...)
│   ├── pages/                  # Các màn hình chính (Phân chia theo Module/Sprint)
│   │   ├── Auth/               # Xác thực (LoginPage.tsx)
│   │   ├── Branch/             # Quản lý chi nhánh (BranchListPage.tsx)
│   │   ├── Menu/               # Quản lý thực đơn gốc & danh mục (CategoryPage.tsx, MasterMenuPage.tsx)
│   │   ├── POS/                # Hệ thống bán hàng (POSPage.tsx)
│   │   └── KDS/                # Hệ thống hiển thị bếp (KDSPages.tsx)
│   ├── layouts/                # Bộ khung giao diện UI
│   │   ├── AdminLayout.tsx     # Layout có Sidebar cho Boss/Manager
│   │   ├── POSLayout.tsx       # Layout thu gọn full màn hình cho Staff
│   │   └── AuthLayout.tsx      # Layout cho màn hình đăng nhập
│   ├── routes/                 # Định tuyến (react-router-dom)
│   ├── hooks/                  # Custom Hooks (VD: useAuth, useCart)
│   ├── store/                  # Quản lý state toàn cục (Zustand)
│   ├── services/               # Cấu hình gọi API (Axios, React Query)
│   ├── schemas/                # Validate dữ liệu đầu vào (Zod)
│   ├── utils/                  # Hàm tiện ích (Format tiền tệ, thời gian)
│   ├── constants/              # Các hằng số (Quyền, Trạng thái đơn hàng)
│   ├── types/                  # Định nghĩa TypeScript interfaces/types
│   ├── App.tsx                 # Root Component (Chứa Router Provider)
│   ├── main.tsx                # Điểm neo vào index.html
│   └── index.css               # Chứa `@import "tailwindcss";` (Tailwind v4)
│
├── index.html
├── eslint.config.js            # Cấu hình kiểm tra mã nguồn khắt khe
├── postcss.config.js           # Cấu hình PostCSS (Sử dụng plugin @tailwindcss/postcss)
├── tailwind.config.js          # (Tùy chọn ở v4) Cấu hình ghi đè biến giao diện Tailwind
├── tsconfig.json               # Cấu hình TypeScript (Strict Mode)
├── vite.config.ts              # Cấu hình build Vite
└── .env                        # Biến môi trường (API_URL)


========================================
II. Backend Java
========================================

Có thể lựa chọn 1 trong 2 kiến trúc Monolith phổ biến sau.

----------------------------------------
1. Layered Architecture
----------------------------------------

backend-layered/
├── src/main/java/com/ioc/internship/
│   ├── Application.java                        # File chạy chính của Spring Boot
│   │
│   ├── common/                                 # Các tiện ích và class cốt lõi dùng chung
│   │   ├── constants/                          # Hằng số (ErrorCodes, SystemConstants, RegexConstants)
│   │   ├── exception/                          # Xử lý lỗi toàn hệ thống
│   │   │   ├── GlobalExceptionHandler.java     # (@RestControllerAdvice bắt lỗi tập trung)
│   │   │   └── CustomBusinessException.java    # Định nghĩa lỗi nghiệp vụ riêng
│   │   └── utils/                              # Các hàm phụ trợ (JwtUtils, DateUtils, PasswordEncoder)
│   │
│   ├── config/                                 # Cấu hình Framework
│   │   ├── SecurityConfig.java                 # Cấu hình phân quyền, chặn API, CORS
│   │   ├── OpenApiConfig.java                  # Cấu hình tài liệu Swagger API
│   │   └── DatabaseConfig.java                 # Cấu hình kết nối nhiều DB (nếu cần)
│   │
│   ├── controller/                             # TẦNG API (Giao tiếp HTTP)
│   │   ├── admin/                              # Nhóm API cho Admin (ví dụ: AdminUserController)
│   │   └── student/                            # Nhóm API cho Sinh viên (ví dụ: StudentProjectController)
│   │
│   ├── dto/                                    # DATA TRANSFER OBJECT (Chứa object gửi/nhận)
│   │   ├── request/                            # Dữ liệu Client gửi lên (UserCreateReq, LoginReq) - chứa @Valid
│   │   └── response/                           # Dữ liệu trả về (UserDetailRes, PaginatedRes)
│   │
│   ├── entity/                                 # TẦNG MAP VỚI DATABASE (JPA)
│   │   ├── UserEntity.java                     # Map với bảng users
│   │   └── ProjectEntity.java                  # Map với bảng projects
│   │
│   ├── repository/                             # TẦNG TRUY VẤN DỮ LIỆU
│   │   ├── custom/                             # Nơi chứa interface gọi Stored Procedure / Native SQL phức tạp
│   │   └── UserRepository.java                 # Kế thừa JpaRepository cho các câu lệnh đơn giản
│   │
│   └── service/                                # TẦNG NGHIỆP VỤ LÕI
│       ├── impl/                               # Thư mục bắt buộc chứa code thực thi thật
│       │   └── UserServiceImpl.java            # Xử lý logic, tính toán, gọi Repository
│       └── UserService.java                    # Chỉ chứa Interface (Định nghĩa hành động)
│
└── resources/
    ├── application.yml                         # Cấu hình port, database credentials
    ├── text/                                   # Cấu hình ResourceBundle để lưu text, không hard text vào code
    └── db/migration/                           # Nơi viết các thay đổi DB
        └── V1__Init_Tables.sql                 # Script tạo bảng CSDL
