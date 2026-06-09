package resort_management.repository;

import resort_management.entity.Booking;
import resort_management.enums.BookingStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

        // ✅ Đã tối ưu: Nạp sẵn data khi xem toàn bộ danh sách phân trang (size=9999
        // hoặc thường)
        @Override
        @EntityGraph(attributePaths = { "customer", "bookingRooms", "bookingRooms.room" })
        Page<Booking> findAll(Pageable pageable);

        // 🔥 ĐÃ SỬA: Thêm EntityGraph vào đây vì giao diện rất hay lọc đơn hàng theo
        // Trạng thái
        @EntityGraph(attributePaths = { "customer", "bookingRooms", "bookingRooms.room" })
        Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

        List<Booking> findByStatus(BookingStatus status);

        List<Booking> findByCustomerId(Long customerId);

        // ✅ Thêm mới: Lấy danh sách phẳng hoàn toàn, ép EntityGraph gom data dưới DB
        // cực nhanh
        @EntityGraph(attributePaths = { "customer", "bookingRooms", "bookingRooms.room" })
        @Query("SELECT DISTINCT b FROM Booking b ORDER BY b.id DESC")
        List<Booking> findAllWithoutPage();
        
        // Tìm booking trùng lịch — loại trừ CANCELLED và CHECKED_OUT
        @Query("SELECT b FROM Booking b JOIN b.bookingRooms br " +
                        "WHERE br.room.id = :roomId " +
                        "AND b.status NOT IN (:excludedStatuses) " +
                        "AND b.checkInDate < :checkOutDate " +
                        "AND b.checkOutDate > :checkInDate")
        List<Booking> findOverlappingBookings(
                        @Param("roomId") Long roomId,
                        @Param("checkInDate") LocalDate checkInDate,
                        @Param("checkOutDate") LocalDate checkOutDate,
                        @Param("excludedStatuses") List<BookingStatus> excludedStatuses);
}