package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.dto.request.ServiceRequest;
import resort_management.dto.response.ServiceResponse;
import resort_management.service.ResortServiceMgmt;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ResortServiceMgmt resortServiceMgmt;

    @GetMapping
    public List<ServiceResponse> getAll() {
        return resortServiceMgmt.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resortServiceMgmt.getById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(resortServiceMgmt.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(resortServiceMgmt.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        resortServiceMgmt.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ ID: " + id));
    }
}