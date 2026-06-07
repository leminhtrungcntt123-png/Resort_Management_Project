package resort_management.repository;

import resort_management.entity.Booking;
import resort_management.enums.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

        List<Booking> findByStatus(BookingStatus status);

        List<Booking> findByCustomerId(Long customerId);

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

        Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
}