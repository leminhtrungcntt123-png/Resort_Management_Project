package resort_management.controller;

import resort_management.entity.Customer;
import resort_management.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Customer> search(@RequestParam String name) {
        return customerRepository.findByFullNameContainingIgnoreCase(name);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Customer customer) {
        if (customer.getEmail() != null && !customer.getEmail().isEmpty()
                && customerRepository.existsByEmail(customer.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email '" + customer.getEmail() + "' đã tồn tại"));
        }
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Customer details) {
        return customerRepository.findById(id).map(c -> {
            c.setFullName(details.getFullName());
            c.setPhone(details.getPhone());
            c.setEmail(details.getEmail());
            return ResponseEntity.ok(customerRepository.save(c));
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
