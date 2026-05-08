-- ============================================================
--  RESORT MANAGEMENT - DATABASE SCRIPT (CHUẨN OOP & BASE ENTITY)
--  Khớp hoàn toàn với các Java Entity trong Spring Boot project
-- ============================================================

-- 1. XÓA DATABASE CŨ VÀ TẠO MỚI
DROP DATABASE IF EXISTS resort_management;
CREATE DATABASE resort_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resort_management;


-- ============================================================
-- 2. BẢNG ĐỘC LẬP & LỚP CHA
-- ============================================================

CREATE TABLE room_types (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(100) NOT NULL,
    description     TEXT,                                          
    price_per_night DECIMAL(18,2) NOT NULL CHECK (price_per_night > 0),
    capacity        INT NOT NULL CHECK (capacity > 0),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- [OOP] KẾ THỪA: Gộp Customers và Users thành Persons
CREATE TABLE persons (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    phone          VARCHAR(20),
    email          VARCHAR(100),
    person_type    VARCHAR(31) NOT NULL,        -- Discriminator: 'CUSTOMER' hoặc 'EMPLOYEE'
    -- Cột dành riêng cho Customer
    loyalty_points INT DEFAULT 0,               
    -- Cột dành riêng cho Employee
    position       VARCHAR(100),                
    salary         DECIMAL(18,2),               
    -- Từ BaseEntity
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price        DECIMAL(18,2) NOT NULL CHECK (price > 0),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. BẢNG CÓ KHÓA NGOẠI
-- ============================================================

CREATE TABLE rooms (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    room_number  VARCHAR(20) NOT NULL UNIQUE,
    room_type_id INT NOT NULL,
    floor_number INT,
    status       VARCHAR(50) NOT NULL DEFAULT 'Trống'
                 CHECK (status IN ('Trống', 'Đang ở', 'Bảo trì')),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id),
    INDEX idx_room_type (room_type_id)
);

CREATE TABLE bookings (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    customer_id    INT NOT NULL, -- Trỏ về id của persons (với person_type = 'CUSTOMER')
    check_in_date  DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'Chờ'           
                   CHECK (status IN ('Chờ', 'Đã xác nhận', 'Đang ở', 'Đã hủy', 'Đã trả phòng')),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES persons(id),
    CHECK (check_out_date > check_in_date),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
);


-- ============================================================
-- 4. BẢNG TRUNG GIAN & PHỤ TRỢ (Thanh toán, Dịch vụ)
-- ============================================================

CREATE TABLE booking_rooms (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id    INT NOT NULL,
    price      DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE booking_services (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity   INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- [OOP] ĐA HÌNH: Bảng Payments chuẩn OOP (@OneToOne)
CREATE TABLE payments (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    booking_id     INT NOT NULL UNIQUE,         -- UNIQUE vì là quan hệ @OneToOne
    amount         DECIMAL(18,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(31) NOT NULL,        -- Discriminator: 'CASH' hoặc 'CARD'
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_payment (booking_id)
);


-- ============================================================
-- 5. DỮ LIỆU MẪU (INSERT)
-- ============================================================

INSERT INTO room_types (type_name, description, price_per_night, capacity) VALUES
    ('Standard',  'Phòng tiêu chuẩn, đầy đủ tiện nghi cơ bản',    500000,  2),
    ('Deluxe',    'Phòng cao cấp với view biển hoặc hồ bơi',      1000000, 2),
    ('Suite',     'Phòng suite sang trọng với phòng khách riêng', 2500000, 4),
    ('Family',    'Phòng gia đình rộng rãi, 2 phòng ngủ',         1800000, 6),
    ('Couple',    'Phòng 2 người rộng rãi lãng mạn',              600000,  2);

INSERT INTO rooms (room_number, room_type_id, floor_number, status) VALUES
    ('101', 1, 1, 'Trống'),
    ('102', 1, 1, 'Trống'),
    ('201', 2, 2, 'Trống'),
    ('202', 2, 2, 'Đang ở'),
    ('301', 3, 3, 'Trống'),
    ('401', 4, 4, 'Bảo trì');

-- Thêm Dữ liệu vào bảng Persons (Đại diện cho cả Khách và Nhân viên)
INSERT INTO persons (full_name, phone, email, person_type, loyalty_points, position, salary) VALUES
    -- Khách hàng (loyalty_points có giá trị, position/salary để null)
    ('Nguyen Van A', '0901234567', 'a@gmail.com', 'CUSTOMER', 100, NULL, NULL),           
    ('Tran Thi B',   '0912345678', 'b@gmail.com', 'CUSTOMER', 50,  NULL, NULL),
    ('Le Van C',     '0923456789', 'c@gmail.com', 'CUSTOMER', 0,   NULL, NULL),
    -- Nhân viên (position/salary có giá trị, loyalty_points để null)
    ('Admin Chung',  '0999999999', 'admin@resort.com', 'EMPLOYEE', NULL, 'Admin Quản trị', 20000000),
    ('Le Tan D',     '0888888888', 'letan1@resort.com', 'EMPLOYEE', NULL, 'Lễ tân Ca sáng', 8000000);

INSERT INTO services (service_name, price) VALUES
    ('Ăn sáng buffet', 150000),
    ('Thuê xe đưa đón', 300000),
    ('Massage & Spa',  500000),
    ('Giặt ủi',         80000);