package resort_management.controller;

import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import resort_management.entity.Room;
import resort_management.entity.RoomType;
import resort_management.repository.RoomRepository;
import resort_management.repository.RoomTypeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;

    @GetMapping
    public List<RoomResponse> getAll() {
        return roomRepository.findAll()
                .stream()
                .map(RoomResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(RoomResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<RoomResponse> getByStatus(@PathVariable String status) {
        return roomRepository.findByStatus(status)
                .stream()
                .map(RoomResponse::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Số phòng '" + request.getRoomNumber() + "' đã tồn tại"));
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElse(null);
        if (roomType == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));
        }

        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(request.getStatus());
        room.setRoomType(roomType);

        return ResponseEntity.ok(RoomResponse.from(roomRepository.save(room)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElse(null);
        if (roomType == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));
        }

        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(request.getRoomNumber());
            room.setFloorNumber(request.getFloorNumber());
            room.setStatus(request.getStatus());
            room.setRoomType(roomType);
            return ResponseEntity.ok(RoomResponse.from(roomRepository.save(room)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        List<String> validStatuses = List.of("Trống", "Đang ở", "Bảo trì");
        String newStatus = body.get("status");
        if (!validStatuses.contains(newStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trạng thái không hợp lệ: " + newStatus));
        }
        return roomRepository.findById(id).map(room -> {
            room.setStatus(newStatus);
            return ResponseEntity.ok(RoomResponse.from(roomRepository.save(room)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return roomRepository.findById(id).map(room -> {
            if ("Đang ở".equalsIgnoreCase(room.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Phòng này đang có khách, không được xóa!"));
            }
            roomRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa phòng ID: " + id));
        }).orElse(ResponseEntity.notFound().build());
    }
}
