package resort_management.controller;

import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.repository.PaymentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
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

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue(@RequestParam(defaultValue = "month") String period) {
        String normalizedPeriod = period == null ? "month" : period.trim().toLowerCase();
        if (!List.of("day", "month", "year").contains(normalizedPeriod)) {
            return ResponseEntity.badRequest().body(Map.of("error", "period chỉ nhận day, month hoặc year"));
        }

        DateTimeFormatter formatter = switch (normalizedPeriod) {
            case "day" -> DateTimeFormatter.ofPattern("yyyy-MM-dd");
            case "year" -> DateTimeFormatter.ofPattern("yyyy");
            default -> DateTimeFormatter.ofPattern("yyyy-MM");
        };

        Map<String, Double> revenueByPeriod = new TreeMap<>();
        paymentRepository.findAll().stream()
                .filter(p -> "Đã thanh toán".equalsIgnoreCase(p.getPaymentStatus()))
                .filter(p -> p.getPaymentDate() != null)
                .forEach(p -> {
                    String key = formatter.format(p.getPaymentDate());
                    revenueByPeriod.merge(key, p.getAmount(), (a, b) -> a + b);
                });

        List<Map<String, Object>> response = revenueByPeriod.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("period", e.getKey());
                    item.put("revenue", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
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
