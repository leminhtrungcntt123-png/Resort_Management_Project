package resort_management.controller;

import resort_management.dto.request.ServiceRequest;
import resort_management.dto.response.ServiceResponse;
import resort_management.entity.Service;
import resort_management.repository.ServiceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping
    public List<ServiceResponse> getAll() {
        return serviceRepository.findAll()
                .stream()
                .map(ServiceResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(ServiceResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        Service service = new Service();
        service.setServiceName(request.getServiceName());
        service.setPrice(request.getPrice());
        return ResponseEntity.ok(ServiceResponse.from(serviceRepository.save(service)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return serviceRepository.findById(id).map(s -> {
            s.setServiceName(request.getServiceName());
            s.setPrice(request.getPrice());
            return ResponseEntity.ok(ServiceResponse.from(serviceRepository.save(s)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!serviceRepository.existsById(id))
            return ResponseEntity.notFound().build();
        serviceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ ID: " + id));
    }
}
