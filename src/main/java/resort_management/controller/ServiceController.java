package resort_management.controller;

import resort_management.entity.Service;
import resort_management.repository.ServiceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping
    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Service service) {
        return ResponseEntity.ok(serviceRepository.save(service));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Service details) {
        return serviceRepository.findById(id).map(s -> {
            s.setServiceName(details.getServiceName());
            s.setPrice(details.getPrice());
            return ResponseEntity.ok(serviceRepository.save(s));
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
