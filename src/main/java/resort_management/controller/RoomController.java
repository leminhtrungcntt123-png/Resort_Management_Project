package resort_management.controller;

import resort_management.entity.Room;
import resort_management.repository.RoomRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public List<Room> getAll() {
        return roomRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Room> getByStatus(@PathVariable String status) {
        return roomRepository.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Số phòng '" + room.getRoomNumber() + "' đã tồn tại"));
        }
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Room details) {
        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(details.getRoomNumber());
            room.setFloorNumber(details.getFloorNumber());
            room.setStatus(details.getStatus());
            room.setRoomType(details.getRoomType());
            return ResponseEntity.ok(roomRepository.save(room));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return roomRepository.findById(id).map(room -> {
            room.setStatus(body.get("status"));
            return ResponseEntity.ok(roomRepository.save(room));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        // 1. Tìm phòng trong cơ sở dữ liệu để lấy thông tin
        Optional<Room> roomOptional = roomRepository.findById(id);

        // Nếu không tìm thấy phòng thì báo lỗi 404 Not Found
        if (roomOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = roomOptional.get();

        // 2. CHỐT CHẶN NGHIỆP VỤ: Kiểm tra xem phòng có đang "Đang ở" không
        if ("Đang ở".equalsIgnoreCase(room.getStatus())) {
            // Trả về lỗi 400 (Bad Request) kèm câu chửi để Frontend hiện lên Toast
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "❌ Phòng này đang có khách, tuyệt đối không được xóa!"));
        }

        // 3. Nếu phòng không có khách (Trống, Đang dọn...) thì cho phép xóa bình thường
        roomRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa phòng ID: " + id));
    }
}
