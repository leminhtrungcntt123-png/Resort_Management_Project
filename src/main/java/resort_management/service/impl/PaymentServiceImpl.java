package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;
import resort_management.repository.PaymentRepository;
import resort_management.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(PaymentResponse::from)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hóa đơn cho booking ID: " + bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenue(String period) {
        String normalized = period == null ? "month" : period.trim().toLowerCase();
        if (!List.of("day", "month", "year").contains(normalized))
            throw new RuntimeException("period chỉ nhận: day, month, year");

        DateTimeFormatter formatter = switch (normalized) {
            case "day"  -> DateTimeFormatter.ofPattern("yyyy-MM-dd");
            case "year" -> DateTimeFormatter.ofPattern("yyyy");
            default     -> DateTimeFormatter.ofPattern("yyyy-MM");
        };

        Map<String, BigDecimal> revenueMap = new TreeMap<>();
        paymentRepository.findAll().stream()
                .filter(p -> PaymentStatus.PAID == p.getPaymentStatus()) // ← so sánh Enum
                .filter(p -> p.getPaymentDate() != null)
                .forEach(p -> {
                    String key = formatter.format(p.getPaymentDate());
                    revenueMap.merge(key, p.getAmount(), BigDecimal::add); // ← BigDecimal::add
                });

        return revenueMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("period", e.getKey());
                    item.put("revenue", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse markAsPaid(Long id) {
        return paymentRepository.findById(id).map(p -> {
            if (PaymentStatus.PAID == p.getPaymentStatus()) // ← so sánh Enum
                throw new RuntimeException("Hóa đơn này đã được thanh toán rồi!");
            p.setPaymentStatus(PaymentStatus.PAID);         // ← gán Enum
            p.setPaymentDate(LocalDateTime.now());
            return PaymentResponse.from(paymentRepository.save(p));
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + id));
    }

    @Override
    @Transactional
    public PaymentResponse update(Long id, PaymentRequest request) {
        return paymentRepository.findById(id).map(p -> {
            p.setAmount(request.getAmount()); // BigDecimal → BigDecimal ✅
            // Convert String → PaymentMethod Enum
            try {
                p.setPaymentMethod(PaymentMethod.valueOf(
                        request.getPaymentMethod().trim().toUpperCase()
                ));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(
                        "Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: CASH, CARD");
            }
            if (PaymentStatus.PAID == p.getPaymentStatus()) // ← so sánh Enum
                p.setPaymentDate(LocalDateTime.now());
            return PaymentResponse.from(paymentRepository.save(p));
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + id));
    }
}