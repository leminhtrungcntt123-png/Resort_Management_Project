USE master;
GO

IF DB_ID('QuanLyResort') IS NOT NULL
BEGIN
    ALTER DATABASE QuanLyResort SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyResort;
END
GO

CREATE DATABASE QuanLyResort;
GO
USE QuanLyResort;
GO

-- Xóa bảng con trước
DROP TABLE IF EXISTS BookingServices;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS BookingRooms;

-- Xóa bảng trung gian
DROP TABLE IF EXISTS Bookings;

-- Xóa bảng liên quan
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS RoomTypes;

-- Xóa người dùng & khách
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Customers;

-- Cuối cùng
DROP TABLE IF EXISTS Services;
DROP TABLE IF EXISTS Roles;

--I.Bảng
CREATE TABLE Roles (
    Id INT IDENTITY PRIMARY KEY,
    RoleName NVARCHAR(100)
);

CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    RoleId INT NOT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

CREATE TABLE RoomTypes (
    Id INT IDENTITY PRIMARY KEY,
    TypeName NVARCHAR(100) NOT NULL,
    PricePerNight DECIMAL(18,2) CHECK (PricePerNight > 0),
    MaxGuest INT CHECK (MaxGuest > 0)
);

CREATE TABLE Rooms (
    Id INT IDENTITY PRIMARY KEY,
    RoomNumber NVARCHAR(20) NOT NULL UNIQUE,
    RoomTypeId INT NOT NULL,
    FloorNumber INT,
    Status NVARCHAR(50) NOT NULL 
        CHECK (Status IN (N'Trống', N'Đang ở', N'Bảo trì')),
    FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(Id)
);

CREATE TABLE Customers (
    Id INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100)
);

CREATE TABLE Bookings (
    Id INT IDENTITY PRIMARY KEY,
    CustomerId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Status NVARCHAR(50) DEFAULT N'Chờ xác nhận'
        CHECK (Status IN (N'Chờ', N'Đã xác nhận', N'Đã hủy')),
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CHECK (CheckOutDate > CheckInDate)
);

CREATE TABLE BookingRooms (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT,
    RoomId INT,
    Price DECIMAL(18,2) CHECK (Price > 0),
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id)
);

CREATE TABLE Services (
    Id INT IDENTITY PRIMARY KEY,
    ServiceName NVARCHAR(100) NOT NULL,
    Price DECIMAL(18,2) CHECK (Price > 0)
);

CREATE TABLE BookingServices (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT,
    ServiceId INT,
    Quantity INT CHECK (Quantity > 0),
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    FOREIGN KEY (ServiceId) REFERENCES Services(Id)
);

CREATE TABLE Payments (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT,
    Amount DECIMAL(18,2) CHECK (Amount >= 0),
    PaymentStatus NVARCHAR(50) DEFAULT N'Chưa thanh toán'
        CHECK (PaymentStatus IN (N'Chưa thanh toán', N'Đã thanh toán', N'Thất bại')),
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE
);

GO
DROP TRIGGER IF EXISTS TRG_PreventDoubleBooking;
GO

CREATE TRIGGER TRG_PreventDoubleBooking
ON BookingRooms
AFTER INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM BookingRooms br
        JOIN inserted i ON br.RoomId = i.RoomId AND br.Id <> i.Id
        JOIN Bookings b1 ON i.BookingId = b1.Id
        JOIN Bookings b2 ON br.BookingId = b2.Id
        WHERE 
            b1.CheckInDate < b2.CheckOutDate
            AND b1.CheckOutDate > b2.CheckInDate
    )
    BEGIN
        RAISERROR(N'Phòng bị trùng lịch!',16,1);
        ROLLBACK;
    END
END;
GO

--II.Dữ liệu

INSERT INTO Roles VALUES
(N'Quản trị'),(N'Lễ tân'),(N'Nhân viên'),(N'Quản lý'),(N'Kế toán'),
(N'Kỹ thuật'),(N'Bảo vệ'),(N'Lao công'),(N'IT'),(N'CSKH'),
(N'Giám sát'),(N'Bếp'),(N'Phục vụ'),(N'Tài xế'),(N'Bellman'),
(N'Nhân sự'),(N'Điều hành'),(N'Hỗ trợ'),(N'Thực tập'),(N'Chủ resort');

INSERT INTO Users VALUES
(N'Nguyễn Văn An','an@gmail.com','123','0901',1),
(N'Trần Văn Bình','binh@gmail.com','123','0902',2),
(N'Lê Văn Cường','cuong@gmail.com','123','0903',3),
(N'Phạm Văn Dũng','dung@gmail.com','123','0904',4),
(N'Hoàng Văn Hùng','hung@gmail.com','123','0905',5),
(N'Nguyễn Thị Lan','lan@gmail.com','123','0906',2),
(N'Trần Thị Mai','mai@gmail.com','123','0907',2),
(N'Lê Thị Hạnh','hanh@gmail.com','123','0908',3),
(N'Phạm Thị Hoa','hoa@gmail.com','123','0909',3),
(N'Hoàng Thị Ngọc','ngoc@gmail.com','123','0910',4),
(N'Đặng Minh Quân','quan@gmail.com','123','0911',5),
(N'Bùi Thanh Tùng','tung@gmail.com','123','0912',6),
(N'Phan Quốc Khánh','khanh@gmail.com','123','0913',7),
(N'Võ Văn Lâm','lam@gmail.com','123','0914',8),
(N'Đỗ Anh Tuấn','tuan@gmail.com','123','0915',9),
(N'Nguyễn Quốc Việt','viet@gmail.com','123','0916',10),
(N'Phạm Minh Hiếu','hieu@gmail.com','123','0917',3),
(N'Trần Văn Long','long@gmail.com','123','0918',4),
(N'Lê Quang Huy','huy@gmail.com','123','0919',5),
(N'Hoàng Gia Bảo','bao@gmail.com','123','0920',6);

INSERT INTO RoomTypes VALUES
(N'Phòng đơn',300000,1),(N'Phòng đôi',600000,2),(N'Phòng gia đình',1200000,4),
(N'Phòng VIP',2000000,2),(N'Phòng hướng biển',2500000,2),
(N'Phòng deluxe',800000,2),(N'Phòng suite',3000000,4),
(N'Bungalow',1800000,2),(N'Phòng king',1000000,2),(N'Phòng twin',700000,2),
(N'Phòng connecting',1400000,4),(N'Phòng dorm',250000,8),
(N'Phòng tiêu chuẩn',400000,2),(N'Phòng cao cấp',900000,2),
(N'Phòng sang trọng',1500000,2),(N'Phòng resort view',2000000,2),
(N'Phòng hồ bơi',1800000,2),(N'Phòng vườn',1200000,2),
(N'Phòng mini',250000,1),(N'Phòng siêu VIP',5000000,4);

INSERT INTO Rooms VALUES
('101',1,1,N'Trống'),('102',2,1,N'Trống'),('103',3,1,N'Đang ở'),
('104',4,1,N'Trống'),('105',5,1,N'Bảo trì'),
('201',6,2,N'Trống'),('202',7,2,N'Đang ở'),('203',8,2,N'Trống'),
('204',9,2,N'Trống'),('205',10,2,N'Trống'),
('301',11,3,N'Trống'),('302',12,3,N'Trống'),
('303',13,3,N'Trống'),('304',14,3,N'Trống'),('305',15,3,N'Trống'),
('401',16,4,N'Trống'),('402',17,4,N'Trống'),
('403',18,4,N'Trống'),('404',19,4,N'Trống'),('405',20,4,N'Trống');

INSERT INTO Customers VALUES
(N'Nguyễn Minh Tuấn','0912000001','tuan@gmail.com'),
(N'Trần Quốc Bảo','0912000002','bao@gmail.com'),
(N'Lê Hoàng Nam','0912000003','nam@gmail.com'),
(N'Phạm Gia Huy','0912000004','huy@gmail.com'),
(N'Hoàng Đức Anh','0912000005','anh@gmail.com'),
(N'Nguyễn Thị Thu','0912000006','thu@gmail.com'),
(N'Trần Thị Linh','0912000007','linh@gmail.com'),
(N'Lê Thị Trang','0912000008','trang@gmail.com'),
(N'Phạm Thị Yến','0912000009','yen@gmail.com'),
(N'Hoàng Thị Mai','0912000010','mai@gmail.com'),
(N'Đỗ Văn Sơn','0912000011','son@gmail.com'),
(N'Bùi Văn Hải','0912000012','hai@gmail.com'),
(N'Phan Văn Phúc','0912000013','phuc@gmail.com'),
(N'Võ Minh Đức','0912000014','duc@gmail.com'),
(N'Đặng Quốc Trung','0912000015','trung@gmail.com'),
(N'Nguyễn Văn Phong','0912000016','phong@gmail.com'),
(N'Trần Minh Nhật','0912000017','nhat@gmail.com'),
(N'Lê Thanh Tâm','0912000018','tam@gmail.com'),
(N'Phạm Quốc Dũng','0912000019','dung@gmail.com'),
(N'Hoàng Văn Sơn','0912000020','son2@gmail.com');

INSERT INTO Bookings VALUES
(1,'2026-04-01','2026-04-03',N'Đã xác nhận'),
(2,'2026-04-02','2026-04-04',N'Chờ'),
(3,'2026-04-03','2026-04-06',N'Đã xác nhận'),
(4,'2026-04-04','2026-04-07',N'Đã hủy'),
(5,'2026-04-05','2026-04-08',N'Đã xác nhận'),
(6,'2026-04-06','2026-04-09',N'Đã xác nhận'),
(7,'2026-04-07','2026-04-10',N'Chờ'),
(8,'2026-04-08','2026-04-11',N'Đã xác nhận'),
(9,'2026-04-09','2026-04-12',N'Đã xác nhận'),
(10,'2026-04-10','2026-04-13',N'Đã xác nhận'),
(11,'2026-04-11','2026-04-14',N'Đã xác nhận'),
(12,'2026-04-12','2026-04-15',N'Chờ'),
(13,'2026-04-13','2026-04-16',N'Đã xác nhận'),
(14,'2026-04-14','2026-04-17',N'Đã xác nhận'),
(15,'2026-04-15','2026-04-18',N'Đã xác nhận'),
(16,'2026-04-16','2026-04-19',N'Đã xác nhận'),
(17,'2026-04-17','2026-04-20',N'Chờ'),
(18,'2026-04-18','2026-04-21',N'Đã xác nhận'),
(19,'2026-04-19','2026-04-22',N'Đã xác nhận'),
(20,'2026-04-20','2026-04-23',N'Đã xác nhận');

INSERT INTO BookingRooms VALUES
(1,1,300000),(2,2,600000),(3,3,1200000),(4,4,2000000),(5,5,2500000),
(6,6,800000),(7,7,3000000),(8,8,1800000),(9,9,1000000),(10,10,700000),
(11,11,1400000),(12,12,250000),(13,13,400000),(14,14,900000),
(15,15,1500000),(16,16,2000000),(17,17,1800000),(18,18,1200000),
(19,19,250000),(20,20,5000000);

INSERT INTO Services VALUES
(N'Ăn sáng',100000),(N'Spa',300000),(N'Đưa đón sân bay',200000),
(N'Giặt ủi',50000),(N'Gym',100000),
(N'Hồ bơi',80000),(N'Ăn tối',200000),(N'Massage',400000),
(N'Karaoke',200000),(N'BBQ',300000),
(N'Thuê xe máy',150000),(N'Thuê xe hơi',500000),
(N'Tour du lịch',800000),(N'Đặt vé máy bay',100000),
(N'Đặt vé tàu',80000),(N'Chăm sóc trẻ',200000),
(N'Trông hành lý',50000),(N'Dọn phòng',100000),
(N'Gọi taxi',50000),(N'Đặt nhà hàng',70000);

INSERT INTO Payments VALUES
(1,600000,N'Đã thanh toán'),(2,600000,N'Chưa thanh toán'),
(3,1200000,N'Đã thanh toán'),(4,0,N'Thất bại'),
(5,2500000,N'Đã thanh toán'),
(6,800000,N'Đã thanh toán'),(7,3000000,N'Chưa thanh toán'),
(8,1800000,N'Đã thanh toán'),(9,1000000,N'Đã thanh toán'),
(10,700000,N'Đã thanh toán'),
(11,1400000,N'Đã thanh toán'),(12,250000,N'Chưa thanh toán'),
(13,400000,N'Đã thanh toán'),(14,900000,N'Đã thanh toán'),
(15,1500000,N'Đã thanh toán'),
(16,2000000,N'Đã thanh toán'),(17,1800000,N'Chưa thanh toán'),
(18,1200000,N'Đã thanh toán'),
(19,250000,N'Đã thanh toán'),(20,5000000,N'Đã thanh toán');

INSERT INTO BookingServices (BookingId, ServiceId, Quantity) VALUES
(1,1,2),(2,2,1),(3,3,1),(4,4,2),(5,5,1),
(6,6,1),(7,7,2),(8,8,1),(9,9,1),(10,10,2),
(11,11,1),(12,12,2),(13,13,1),(14,14,1),(15,15,2),
(16,16,1),(17,17,1),(18,18,2),(19,19,1),(20,20,2);

--III.Truy vấn

-- 1. Danh sách phòng + loại phòng + giá
SELECT r.RoomNumber, rt.TypeName, rt.PricePerNight, r.Status
FROM Rooms r
JOIN RoomTypes rt ON r.RoomTypeId = rt.Id;

-- 2. Khách hàng + số lần đặt
SELECT c.FullName, COUNT(b.Id) AS SoLanDat
FROM Customers c
LEFT JOIN Bookings b ON c.Id = b.CustomerId
GROUP BY c.FullName
ORDER BY SoLanDat DESC;

-- 3. Tổng tiền từng booking
SELECT b.Id,
       SUM(br.Price * DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate)) AS TongTien
FROM Bookings b
JOIN BookingRooms br ON b.Id = br.BookingId
GROUP BY b.Id;

-- 4. Khách chi tiêu nhiều nhất
SELECT TOP 1 c.FullName,
       SUM(br.Price * DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate)) AS TongTien
FROM Customers c
JOIN Bookings b ON c.Id = b.CustomerId
JOIN BookingRooms br ON b.Id = br.BookingId
GROUP BY c.FullName
ORDER BY TongTien DESC;

-- 5. Phòng đang có khách
SELECT RoomNumber
FROM Rooms
WHERE Status = N'Đang ở';

-- 6. Booking chưa thanh toán
SELECT b.Id, c.FullName
FROM Bookings b
JOIN Customers c ON b.CustomerId = c.Id
JOIN Payments p ON b.Id = p.BookingId
WHERE p.PaymentStatus = N'Chưa thanh toán';

-- 7. Số booking theo trạng thái
SELECT Status, COUNT(*) AS SoLuong
FROM Bookings
GROUP BY Status;

-- 8. Doanh thu theo phòng
SELECT r.RoomNumber,
       SUM(br.Price * DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate)) AS DoanhThu
FROM Rooms r
JOIN BookingRooms br ON r.Id = br.RoomId
JOIN Bookings b ON br.BookingId = b.Id
GROUP BY r.RoomNumber
ORDER BY DoanhThu DESC;

-- 9. Chi tiết booking (ví dụ booking id = 1)
SELECT b.Id, c.FullName, r.RoomNumber, br.Price,
       DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate) AS SoNgay
FROM Bookings b
JOIN Customers c ON b.CustomerId = c.Id
JOIN BookingRooms br ON b.Id = br.BookingId
JOIN Rooms r ON br.RoomId = r.Id
WHERE b.Id = 1;

-- 10. Dịch vụ dùng nhiều nhất
SELECT TOP 1 s.ServiceName, SUM(bs.Quantity) AS SoLan
FROM Services s
JOIN BookingServices bs ON s.Id = bs.ServiceId
GROUP BY s.ServiceName
ORDER BY SoLan DESC;