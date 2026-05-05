package resort_management.controller;

import resort_management.dto.request.CustomerRequest;
import resort_management.dto.response.CustomerResponse;
import resort_management.entity.Customer;
import resort_management.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<CustomerResponse> getAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(CustomerResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<CustomerResponse> search(@RequestParam String name) {
        return customerRepository.findByFullNameContainingIgnoreCase(name)
                .stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CustomerRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && customerRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email '" + request.getEmail() + "' đã tồn tại"));
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());

        return ResponseEntity.ok(CustomerResponse.from(customerRepository.save(customer)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return customerRepository.findById(id).map(c -> {
            c.setFullName(request.getFullName());
            c.setPhone(request.getPhone());
            c.setEmail(request.getEmail());
            return ResponseEntity.ok(CustomerResponse.from(customerRepository.save(c)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!customerRepository.existsById(id))
            return ResponseEntity.notFound().build();
        customerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa khách hàng ID: " + id));
    }
}
