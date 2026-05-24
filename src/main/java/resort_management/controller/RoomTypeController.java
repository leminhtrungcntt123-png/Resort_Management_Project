package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.dto.request.RoomTypeRequest;
import resort_management.dto.response.RoomTypeResponse;
import resort_management.service.RoomTypeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @GetMapping
    public List<RoomTypeResponse> getAll() {
        return roomTypeService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roomTypeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(@Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        roomTypeService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa hạng phòng ID: " + id));
    }
}