package resort_management.controller;

import resort_management.entity.Payment;
import resort_management.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping
    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getByBooking(@PathVariable Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        return paymentRepository.findById(id).map(p -> {
            p.setPaymentStatus("Đã thanh toán");
            p.setPaymentDate(LocalDateTime.now());
            return ResponseEntity.ok(paymentRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return paymentRepository.findById(id).map(p -> {
            if (body.containsKey("amount"))
                p.setAmount(Double.parseDouble(body.get("amount").toString()));
            if (body.containsKey("paymentStatus"))
                p.setPaymentStatus(body.get("paymentStatus").toString());
            if ("Đã thanh toán".equals(p.getPaymentStatus()))
                p.setPaymentDate(LocalDateTime.now());
            return ResponseEntity.ok(paymentRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }
}
