package resort_management.repository;

import resort_management.entity.Room;
import resort_management.enums.RoomStatus;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
