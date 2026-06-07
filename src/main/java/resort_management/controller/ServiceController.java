package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.dto.request.ServiceRequest;
import resort_management.dto.response.ServiceResponse;
import resort_management.service.ResortServiceMgmt;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ResortServiceMgmt resortServiceMgmt;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(resortServiceMgmt.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resortServiceMgmt.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> create(
            @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resortServiceMgmt.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resortServiceMgmt.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resortServiceMgmt.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}