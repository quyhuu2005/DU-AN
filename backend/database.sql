
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
IF OBJECT_ID('product_recipes', 'U') IS NOT NULL DROP TABLE product_recipes;
IF OBJECT_ID('inventory_transactions', 'U') IS NOT NULL DROP TABLE inventory_transactions;
IF OBJECT_ID('inventory_items', 'U') IS NOT NULL DROP TABLE inventory_items;
IF OBJECT_ID('reservations', 'U') IS NOT NULL DROP TABLE reservations;
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

-- 6.5. Bảng Đặt Bàn (Reservations)
CREATE TABLE reservations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    table_id BIGINT NULL,
    customer_name NVARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    party_size INT NOT NULL,
    reserved_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, SEATED, CANCELLED, NO_SHOW
    note NVARCHAR(MAX),
    created_by BIGINT,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_res_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    CONSTRAINT fk_res_table FOREIGN KEY (table_id) REFERENCES dining_tables(id),
    CONSTRAINT fk_res_user FOREIGN KEY (created_by) REFERENCES users(id)
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

-- 9. Bảng Kho nguyên liệu (Inventory Items) - Sprint 3
CREATE TABLE inventory_items (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    branch_id   BIGINT         NOT NULL,
    name        NVARCHAR(200)  NOT NULL,
    unit        NVARCHAR(50)   NOT NULL,              -- kg, lít, cái, hộp, gói...
    quantity    FLOAT          NOT NULL DEFAULT 0,    -- Tồn kho hiện tại
    min_stock   FLOAT          NOT NULL DEFAULT 0,    -- Ngưỡng cảnh báo sắp hết
    expiry_date DATETIME2,                            -- Dự kiến hạn sử dụng
    updated_at  DATETIME2      DEFAULT GETDATE(),
    created_at  DATETIME2      DEFAULT GETDATE(),
    CONSTRAINT fk_inv_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);
CREATE INDEX idx_inventory_items_branch ON inventory_items (branch_id);
GO

-- 10. Bảng Lịch sử xuất/nhập kho (Inventory Transactions) - Sprint 3
CREATE TABLE inventory_transactions (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    inventory_item_id BIGINT         NOT NULL,
    type              VARCHAR(10)    NOT NULL,         -- IMPORT | EXPORT
    quantity          FLOAT          NOT NULL,
    reason            NVARCHAR(200),                   -- Tiêu thụ hàng ngày, Hàng hỏng...
    note              NVARCHAR(500),
    performed_by      BIGINT,                          -- users.id
    performed_by_name NVARCHAR(200),
    created_at        DATETIME2      DEFAULT GETDATE(),
    CONSTRAINT fk_inv_tx_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);
CREATE INDEX idx_inventory_tx_item ON inventory_transactions (inventory_item_id, created_at);
GO

-- 11. Bảng Công thức món ăn (Product Recipes) - Recipe/BOM
CREATE TABLE product_recipes (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id        BIGINT         NOT NULL,
    ingredient_name   NVARCHAR(200)  NOT NULL,
    quantity_required FLOAT          NOT NULL,
    unit              NVARCHAR(50)   NOT NULL,
    CONSTRAINT fk_recipe_product FOREIGN KEY (product_id) REFERENCES products(id)
);
GO

-- =============================================
-- Bước 3: CHÈN DỮ LIỆU MẪU (SEED DATA)
-- =============================================

-- 1. Chèn 10 chi nhánh
INSERT INTO branches (name, address, phone) VALUES 
(N'ProPOS Quận 1', N'123 Lê Lợi, Q.1, TP.HCM', '0123456789'),
(N'ProPOS Quận 2', N'456 Song Hành, Q.2, TP.HCM', '0987654321'),
(N'ProPOS Quận 3', N'789 Nguyễn Đình Chiểu, Q.3, TP.HCM', '0111222333'),
(N'ProPOS Bình Thạnh', N'12 Điện Biên Phủ, Bình Thạnh, TP.HCM', '0222333444'),
(N'ProPOS Gò Vấp', N'34 Quang Trung, Gò Vấp, TP.HCM', '0333444555'),
(N'ProPOS Tân Bình', N'56 Cộng Hòa, Tân Bình, TP.HCM', '0444555666'),
(N'ProPOS Phú Nhuận', N'78 Phan Xích Long, Phú Nhuận, TP.HCM', '0555666777'),
(N'ProPOS Quận 7', N'90 Nguyễn Thị Thập, Q.7, TP.HCM', '0666777888'),
(N'ProPOS Thủ Đức', N'23 Võ Văn Ngân, Thủ Đức, TP.HCM', '0777888999'),
(N'ProPOS Quận 10', N'45 Đường 3/2, Q.10, TP.HCM', '0888999000');
GO

-- 2. Chèn tài khoản BOSS (Tổng quản trị)
INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES 
('admin', 'password', N'Tổng Quản Trị', 'BOSS', NULL, 'ACTIVE');
GO

-- Chèn tài khoản Manager, Chef, Staff cho 10 chi nhánh bằng vòng lặp
DECLARE @bId INT = 1;
WHILE @bId <= 10
BEGIN
    DECLARE @bName NVARCHAR(5) = CAST(@bId AS NVARCHAR(5));
    -- Manager
    INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES
    ('manager' + CAST(@bId AS VARCHAR(5)), 'password', N'Quản lý Chi nhánh ' + @bName, 'MANAGER', @bId, 'ACTIVE');
    
    -- Chef
    INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES
    ('chef' + CAST(@bId AS VARCHAR(5)), 'password', N'Bếp trưởng Chi nhánh ' + @bName, 'CHEF', @bId, 'ACTIVE');
    
    -- Staff 1
    INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES
    ('staff' + CAST(@bId AS VARCHAR(5)) + '_1', 'password', N'Nhân viên ' + @bName + ' A', 'STAFF', @bId, 'ACTIVE');
    
    -- Staff 2
    INSERT INTO users (username, password, full_name, role, branch_id, status) VALUES
    ('staff' + CAST(@bId AS VARCHAR(5)) + '_2', 'password', N'Nhân viên ' + @bName + ' B', 'STAFF', @bId, 'ACTIVE');

    SET @bId = @bId + 1;
END;
GO

-- 3. Chèn 3 danh mục bắt buộc
INSERT INTO categories (name) VALUES 
(N'Món chính'), 
(N'Đồ uống'), 
(N'Tráng miệng');
GO

-- 4. Chèn 30 món ăn gốc
INSERT INTO products (category_id, name, base_price, image_url) VALUES 
-- Món chính (Category 1: 10 Món)
(1, N'Bò Né Sốt Tiêu Đen', 125000, '/images/anh1_1.jpg'),
(1, N'Gà Quay Nướng Lu Sốt Mật Ong', 185000, '/images/anh1_2.jpg'),
(1, N'Sườn Heo Nướng BBQ', 165000, '/images/anh1_3.jpg'),
(1, N'Tôm Hùm Đút Lò Phô Mai', 550000, '/images/anh1_4.jpg'),
(1, N'Cá Chẽm Chiên Sốt Chanh Dây', 220000, '/images/anh1_5.jpg'),
(1, N'Mì Ý Hải Sản Sốt Cà Chua', 115000, '/images/anh1_6.jpg'),
(1, N'Lẩu Thái Hải Sản', 290000, '/images/anh1_7.jpg'),
(1, N'Cơm Chiên Hải Sản Hoàng Kim', 135000, '/images/anh1_8.jpg'),
(1, N'Vịt Quay Bắc Kinh', 380000, '/images/anh1_9.jpg'),
(1, N'Bò Kho Đi Kèm Bánh Mì', 95000, '/images/anh1_10.jpg'),

-- Đồ uống (Category 2: 10 Món)
(2, N'Trà Trái Cây Nhiệt Đới', 45000, '/images/anh2_1.jpg'),
(2, N'Nước Ép Thơm Mint (Dứa & Bạc Hà)', 38000, '/images/anh2_2.jpg'),
(2, N'Sinh Tố Bơ Dừa', 55000, '/images/anh2_3.jpg'),
(2, N'Trà Sữa Trân Châu Hoàng Kim', 42000, '/images/anh2_4.jpg'),
(2, N'Matcha Latte', 48000, '/images/anh2_5.jpg'),
(2, N'Mojito Chanh Dây Bạc Hà', 40000, '/images/anh2_6.jpg'),
(2, N'Cà Phê Muối', 35000, '/images/anh2_7.jpg'),
(2, N'Nước Ép Lựu Đỏ Nguyên Chất', 48000, '/images/anh2_8.jpg'),
(2, N'Soda Việt Quất', 38000, '/images/anh2_9.jpg'),
(2, N'Trà Hoa Cúc Mật Ong', 35000, '/images/anh2_10.jpg'),

-- Tráng miệng (Category 3: 10 Món)
(3, N'Bánh Tiramisu', 48000, '/images/anh3_1.jpg'),
(3, N'Panna Cotta Sốt Dâu', 35000, '/images/anh3_2.jpg'),
(3, N'Chè Khúc Bạch', 38000, '/images/anh3_3.jpg'),
(3, N'Bánh Creme Brulee', 45000, '/images/anh3_4.jpg'),
(3, N'Kem Dừa Côn Đảo', 45000, '/images/anh3_5.jpg'),
(3, N'Bánh Flan Trân Châu Ca Cao', 32000, '/images/anh3_6.jpg'),
(3, N'Rau Câu Trái Cây 3 Lớp', 28000, '/images/anh3_7.jpg'),
(3, N'Bánh Mousse Xoài', 42000, '/images/anh3_8.jpg'),
(3, N'Chè Sương Sa Hạt Lựu', 35000, '/images/anh3_9.jpg'),
(3, N'Trái Cây Đĩa Theo Mùa', 60000, '/images/anh3_10.jpg');
GO

-- 5. Chèn Thực đơn cho cả 10 chi nhánh (bán đủ 30 món, is_available = 1)
INSERT INTO branch_menus (branch_id, product_id, local_price, is_available)
SELECT b.id, p.id, p.base_price, 1
FROM branches b
CROSS JOIN products p;
GO

-- 6. Chèn 15 bàn mỗi chi nhánh (đa dạng khu vực tầng/VIP)
DECLARE @brId INT = 1;
WHILE @brId <= 10
BEGIN
    DECLARE @tNum INT = 1;
    WHILE @tNum <= 15
    BEGIN
        DECLARE @tName NVARCHAR(50) = N'Bàn ' + RIGHT('0' + CAST(@tNum AS NVARCHAR(5)), 2);
        DECLARE @zone NVARCHAR(50);
        DECLARE @cap INT;
        
        IF @tNum <= 5 
        BEGIN 
            SET @zone = N'Tầng Trệt'; 
            SET @cap = CASE WHEN @tNum % 2 = 0 THEN 4 ELSE 2 END; 
        END
        ELSE IF @tNum <= 10 
        BEGIN 
            SET @zone = N'Lầu 1'; 
            SET @cap = CASE WHEN @tNum % 2 = 0 THEN 6 ELSE 4 END; 
        END
        ELSE IF @tNum <= 13 
        BEGIN 
            SET @zone = N'Sân Vườn'; 
            SET @cap = 4; 
        END
        ELSE 
        BEGIN 
            SET @zone = N'Khu VIP'; 
            SET @cap = CASE WHEN @tNum = 14 THEN 8 ELSE 10 END; 
        END

        INSERT INTO dining_tables (branch_id, name, zone, capacity, status)
        VALUES (@brId, @tName, @zone, @cap, 'EMPTY');

        SET @tNum = @tNum + 1;
    END
    SET @brId = @brId + 1;
END;
GO

-- 7. Chèn Nguyên liệu trong kho (Inventory) số lượng nhiều cho tất cả chi nhánh
CREATE TABLE #TempIngredients (
    name NVARCHAR(200),
    unit NVARCHAR(50),
    quantity FLOAT,
    min_stock FLOAT
);

INSERT INTO #TempIngredients (name, unit, quantity, min_stock) VALUES
(N'Thịt bò',       N'kg',   500,  50),
(N'Thịt gà',       N'kg',   400,  40),
(N'Sườn heo',      N'kg',   300,  30),
(N'Tôm hùm',       N'con',  150,  15),
(N'Cá chẽm',       N'kg',   200,  20),
(N'Hải sản',       N'kg',   600,  60),
(N'Thịt vịt',      N'kg',   250,  25),
(N'Bánh mì',       N'cái',  800,  80),
(N'Gạo tẻ',        N'kg',   1000, 100),
(N'Mì Ý',          N'kg',   300,  30),
(N'Trứng gà',      N'cái',  2000, 200),
(N'Phô mai',       N'kg',   150,  15),
(N'Trái cây',      N'kg',   400,  40),
(N'Bột trà xanh',  N'kg',   50,   5),
(N'Bơ sáp',        N'kg',   150,  15),
(N'Sữa tươi',      N'lít',  500,  50),
(N'Dừa xiêm',      N'trái', 300,  30),
(N'Dâu tây',       N'kg',   100,  10),
(N'Cà phê hạt',    N'kg',   200,  20),
(N'Soda',          N'lon',  1500, 150),
(N'Việt quất',     N'kg',   80,   8),
(N'Hoa cúc khô',   N'kg',   30,   3),
(N'Mật ong',       N'lít',  100,  10),
(N'Đường cát',     N'kg',   500,  50),
(N'Sữa đặc',       N'lon',  600,  60),
(N'Bột rau câu',   N'kg',   100,  10),
(N'Lá dứa',        N'kg',   50,   5),
(N'Nước mắm',      N'chai', 200,  20),
(N'Dầu ăn',        N'lít',  600,  60);

INSERT INTO inventory_items (branch_id, name, unit, quantity, min_stock, updated_at, created_at)
SELECT b.id, ti.name, ti.unit, ti.quantity, ti.min_stock, GETDATE(), GETDATE()
FROM branches b
CROSS JOIN #TempIngredients ti;

DROP TABLE #TempIngredients;
GO

-- 8. Chèn Công thức món ăn (Recipes) liên kết khấu hao tự động
INSERT INTO product_recipes (product_id, ingredient_name, quantity_required, unit) VALUES
-- Bò Né Sốt Tiêu Đen (Product ID = 1)
(1, N'Thịt bò',       0.2,  N'kg'),
(1, N'Dầu ăn',        0.02, N'lít'),

-- Gà Quay Nướng Lu Sốt Mật Ong (Product ID = 2)
(2, N'Thịt gà',       0.5,  N'kg'),
(2, N'Mật ong',       0.05, N'lít'),

-- Sườn Heo Nướng BBQ (Product ID = 3)
(3, N'Sườn heo',      0.4,  N'kg'),

-- Tôm Hùm Đút Lò Phô Mai (Product ID = 4)
(4, N'Tôm hùm',       1.0,  N'con'),
(4, N'Phô mai',       0.1,  N'kg'),

-- Cá Chẽm Chiên Sốt Chanh Dây (Product ID = 5)
(5, N'Cá chẽm',       0.6,  N'kg'),
(5, N'Dầu ăn',        0.1,  N'lít'),

-- Mì Ý Hải Sản Sốt Cà Chua (Product ID = 6)
(6, N'Mì Ý',          0.1,  N'kg'),
(6, N'Hải sản',       0.15, N'kg'),

-- Lẩu Thái Hải Sản (Product ID = 7)
(7, N'Hải sản',       0.3,  N'kg'),

-- Cơm Chiên Hải Sản Hoàng Kim (Product ID = 8)
(8, N'Gạo tẻ',        0.15, N'kg'),
(8, N'Trứng gà',      1.0,  N'cái'),
(8, N'Hải sản',       0.1,  N'kg'),

-- Vịt Quay Bắc Kinh (Product ID = 9)
(9, N'Thịt vịt',      0.8,  N'kg'),

-- Bò Kho Đi Kèm Bánh Mì (Product ID = 10)
(10, N'Thịt bò',       0.25, N'kg'),
(10, N'Bánh mì',       1.0,  N'cái'),

-- Trà Trái Cây Nhiệt Đới (Product ID = 11)
(11, N'Trái cây',      0.1,  N'kg'),

-- Sinh Tố Bơ Dừa (Product ID = 13)
(13, N'Bơ sáp',        0.2,  N'kg'),
(13, N'Sữa đặc',       0.05, N'lon'),

-- Mojito Chanh Dây Bạc Hà (Product ID = 16)
(16, N'Soda',          1.0,  N'lon'),

-- Cà Phê Muối (Product ID = 17)
(17, N'Cà phê hạt',    0.02, N'kg'),
(17, N'Sữa đặc',       0.03, N'lon'),

-- Panna Cotta Sốt Dâu (Product ID = 22)
(22, N'Sữa tươi',      0.1,  N'lít'),
(22, N'Dâu tây',       0.02, N'kg'),

-- Bánh Flan Trân Châu Ca Cao (Product ID = 26)
(26, N'Trứng gà',      1.0,  N'cái'),
(26, N'Sữa tươi',      0.05, N'lít');
GO