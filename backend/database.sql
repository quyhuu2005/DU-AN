-- =============================================
-- DATABASE SETUP & RESET SCRIPT FOR PROPOS SYSTEM
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'propos_db')
BEGIN
    CREATE DATABASE propos_db;
END
GO

USE propos_db;
GO

-- =============================================
-- Bước 1: XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI (RESET)
-- Thứ tự xóa phải ngược lại với thứ tự tạo (bảng con xóa trước, bảng cha xóa sau)
-- =============================================
IF OBJECT_ID('order_items', 'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('orders', 'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('branch_menus', 'U') IS NOT NULL DROP TABLE branch_menus;
IF OBJECT_ID('dining_tables', 'U') IS NOT NULL DROP TABLE dining_tables;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('branches', 'U') IS NOT NULL DROP TABLE branches;
GO

-- =============================================
-- Bước 2: TẠO LẠI CÁC BẢNG TỪ ĐẦU
-- =============================================

-- 1. Bảng Chi nhánh (Branches)
CREATE TABLE branches (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' -- ACTIVE, INACTIVE
);
GO

-- 2. Bảng Người dùng (Users)
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100),
    role VARCHAR(20) NOT NULL, -- BOSS, MANAGER, STAFF, CHEF
    branch_id BIGINT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_user_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);
GO

-- 3. Bảng Danh mục món ăn (Categories)
CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE'
);
GO

-- 4. Bảng Món ăn gốc (Master Menu / Products)
CREATE TABLE products (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_id BIGINT,
    name NVARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    base_price DECIMAL(18, 2) NOT NULL,
    description NVARCHAR(MAX),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- 5. Bảng Thực đơn Chi nhánh (Branch Menu)
CREATE TABLE branch_menus (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    local_price DECIMAL(18, 2), -- Giá bán tại chi nhánh (có thể khác giá gốc)
    is_available BIT DEFAULT 1, -- 1: Còn món, 0: Hết món
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_bm_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    CONSTRAINT fk_bm_product FOREIGN KEY (product_id) REFERENCES products(id)
);
GO

-- 6. Bảng Bàn (Dining Tables)
CREATE TABLE dining_tables (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    name NVARCHAR(50) NOT NULL,
    zone NVARCHAR(50), -- Khu vực (Tầng 1, Sân vườn...)
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'EMPTY', -- EMPTY, OCCUPIED, RESERVED
    CONSTRAINT fk_table_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);
GO

-- 7. Bảng Đơn hàng (Orders)
CREATE TABLE orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    table_id BIGINT,
    staff_id BIGINT,
    total_price DECIMAL(18, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COOKING, SERVED, PAID, CANCELLED
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_order_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    CONSTRAINT fk_order_table FOREIGN KEY (table_id) REFERENCES dining_tables(id),
    CONSTRAINT fk_order_staff FOREIGN KEY (staff_id) REFERENCES users(id)
);
GO

-- 8. Bảng Chi tiết đơn hàng (Order Items)
CREATE TABLE order_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(18, 2) NOT NULL,
    note NVARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COOKING, READY, SERVED
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id)
);
GO

-- =============================================
-- Bước 3: CHÈN DỮ LIỆU MẪU (SEED DATA)
-- =============================================

-- 1. Chèn chi nhánh
INSERT INTO branches (name, address, phone) VALUES 
(N'ProPOS Center', N'Quận 1, TP.HCM', '0123456789'),
(N'ProPOS East', N'Quận 2, TP.HCM', '0987654321');

-- 2. Chèn tài khoản admin và nhân viên
INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES 
('admin', 'password', N'Tổng Quản Trị', 'BOSS', NULL, 'ACTIVE'),
('manager1', 'password', N'Quản lý Chi nhánh 1', 'MANAGER', 1, 'ACTIVE'),
('staff1', 'password', N'Nhân viên Phục vụ 1', 'STAFF', 1, 'ACTIVE');

-- 3. Chèn danh mục
INSERT INTO categories (name) VALUES 
(N'Khai vị'), 
(N'Món chính'), 
(N'Đồ uống');

-- 4. Chèn món ăn gốc
INSERT INTO products (category_id, name, base_price) VALUES 
(1, N'Gỏi ngó sen', 85000),
(2, N'Cơm chiên hải sản', 120000),
(3, N'Trà đào cam sả', 45000);

-- 5. Chèn thực đơn chi nhánh 1
INSERT INTO branch_menus (branch_id, product_id, local_price, is_available) VALUES 
(1, 1, 90000, 1),
(1, 2, 120000, 1),
(1, 3, 40000, 0);

-- 6. Chèn bàn mẫu cho chi nhánh 1
INSERT INTO dining_tables (branch_id, name, zone, capacity) VALUES 
(1, 'Bàn 01', 'Khu A', 4),
(1, 'Bàn 02', 'Khu A', 6),
(1, 'Bàn 03', 'Khu B', 2);
GO