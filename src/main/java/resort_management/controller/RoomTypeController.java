package resort_management.controller;

import resort_management.entity.RoomType;
import resort_management.repository.RoomTypeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/room-types")
public class RoomTypeController {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @GetMapping
    public List<RoomType> getAll() {
        return roomTypeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getById(@PathVariable Long id) {
        return roomTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody RoomType roomType) {
        return ResponseEntity.ok(roomTypeRepository.save(roomType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody RoomType details) {
        return roomTypeRepository.findById(id).map(rt -> {
            rt.setTypeName(details.getTypeName());
            rt.setDescription(details.getDescription());
            rt.setPricePerNight(details.getPricePerNight());
            rt.setCapacity(details.getCapacity());
            return ResponseEntity.ok(roomTypeRepository.save(rt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!roomTypeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roomTypeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa hạng phòng ID: " + id));
    }
}
