CREATE TABLE room_types (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(100) NOT NULL,
    description     TEXT,                                          
    price_per_night DECIMAL(18,2) NOT NULL CHECK (price_per_night > 0),
    capacity        INT NOT NULL CHECK (capacity > 0),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO room_types (type_name, description, price_per_night, capacity) VALUES
    ('Standard',  'Phòng tiêu chuẩn, đầy đủ tiện nghi cơ bản',    500000,  2),
    ('Deluxe',    'Phòng cao cấp với view biển hoặc hồ bơi',      1000000, 2),
    ('Suite',     'Phòng suite sang trọng với phòng khách riêng', 2500000, 4),
    ('Family',    'Phòng gia đình rộng rãi, 2 phòng ngủ',         1800000, 6),
    ('Couple',    'Phòng 2 người rộng rãi lãng mạn',              600000,  2);
