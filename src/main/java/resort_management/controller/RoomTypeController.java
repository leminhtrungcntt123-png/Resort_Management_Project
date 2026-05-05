package resort_management.controller;

import resort_management.dto.request.RoomTypeRequest;
import resort_management.dto.response.RoomTypeResponse;
import resort_management.entity.RoomType;
import resort_management.repository.RoomTypeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/room-types")
public class RoomTypeController {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @GetMapping
    public List<RoomTypeResponse> getAll() {
        return roomTypeRepository.findAll()
                .stream()
                .map(RoomTypeResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> getById(@PathVariable Long id) {
        return roomTypeRepository.findById(id)
                .map(RoomTypeResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(@Valid @RequestBody RoomTypeRequest request) {
        RoomType roomType = new RoomType();
        roomType.setTypeName(request.getTypeName());
        roomType.setDescription(request.getDescription());
        roomType.setPricePerNight(request.getPricePerNight());
        roomType.setCapacity(request.getCapacity());
        return ResponseEntity.ok(RoomTypeResponse.from(roomTypeRepository.save(roomType)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody RoomTypeRequest request) {
        return roomTypeRepository.findById(id).map(rt -> {
            rt.setTypeName(request.getTypeName());
            rt.setDescription(request.getDescription());
            rt.setPricePerNight(request.getPricePerNight());
            rt.setCapacity(request.getCapacity());
            return ResponseEntity.ok(RoomTypeResponse.from(roomTypeRepository.save(rt)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!roomTypeRepository.existsById(id))
            return ResponseEntity.notFound().build();
        roomTypeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa hạng phòng ID: " + id));
    }
}
