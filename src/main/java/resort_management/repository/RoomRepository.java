package resort_management.repository;

import resort_management.entity.Room;
import resort_management.enums.RoomStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByRoomTypeId(Long roomTypeId);
    boolean existsByRoomNumber(String roomNumber);
}
