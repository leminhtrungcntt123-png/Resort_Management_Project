package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import resort_management.enums.RoomStatus;
import resort_management.service.RoomService;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import resort_management.common.PageResponse;
import resort_management.common.ApiResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success(
                roomService.getAllPaged(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getByStatus(
            @PathVariable RoomStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success(
                roomService.getByStatus(status, PageRequest.of(page, size))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success(roomService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success(roomService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RoomResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                roomService.updateStatus(id, body.get("status"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phòng ID: " + id));
    }

    @GetMapping("/floor/{floorNumber}")
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getByFloor(
            @PathVariable Integer floorNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) RoomStatus status) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success(
                roomService.getByFloor(floorNumber, status, PageRequest.of(page, size, sort))));
    }

    @GetMapping("/floors")
    public ResponseEntity<ApiResponse<List<Integer>>> getFloorNumbers() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getFloorNumbers()));
    }
}