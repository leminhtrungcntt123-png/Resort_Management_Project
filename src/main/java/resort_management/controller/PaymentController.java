package resort_management.controller;

import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.repository.PaymentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getByBooking(@PathVariable Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(PaymentResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thanh toán nhanh: chỉ đổi status → "Đã thanh toán"
    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        return paymentRepository.findById(id).map(p -> {
            if ("Đã thanh toán".equals(p.getPaymentStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Hóa đơn này đã được thanh toán rồi!"));
            }
            p.setPaymentStatus("Đã thanh toán");
            p.setPaymentDate(LocalDateTime.now());
            return ResponseEntity.ok(PaymentResponse.from(paymentRepository.save(p)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Cập nhật đầy đủ: dùng PaymentRequest DTO (không nhận Map<> thô nữa)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return paymentRepository.findById(id).map(p -> {
            p.setAmount(request.getAmount());
            p.setPaymentMethod(request.getPaymentMethod());
            if ("Đã thanh toán".equals(p.getPaymentStatus())) {
                p.setPaymentDate(LocalDateTime.now());
            }
            return ResponseEntity.ok(PaymentResponse.from(paymentRepository.save(p)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
