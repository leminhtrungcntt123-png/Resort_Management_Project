package resort_management.repository;

import resort_management.entity.Room;
import resort_management.enums.RoomStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(RoomStatus status);

    List<Room> findByRoomTypeId(Long roomTypeId);

    boolean existsByRoomNumber(String roomNumber);

    Page<Room> findAll(Pageable pageable);
    Page<Room> findByStatus(RoomStatus status, Pageable pageable);
    Page<Room> findByFloorNumber(Integer floorNumber, Pageable pageable);

    // --- Thêm mới: filter kết hợp floor + status ---
    Page<Room> findByFloorNumberAndStatus(Integer floorNumber, RoomStatus status, Pageable pageable);

    @Query("SELECT DISTINCT r.floorNumber FROM Room r ORDER BY r.floorNumber")
    List<Integer> findDistinctFloorNumbers();
    // Thêm hàm này vào cuối file để gom toàn bộ dữ liệu vào 1 câu lệnh SELECT
    @Query("SELECT DISTINCT r FROM Room r " +
           "LEFT JOIN FETCH r.roomType " +
           "LEFT JOIN FETCH r.bookingRooms br ")
    List<Room> findAllRoomsForDashboard();
}