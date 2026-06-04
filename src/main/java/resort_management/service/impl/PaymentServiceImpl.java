package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;
import resort_management.exception.BusinessException;
import resort_management.exception.ResourceNotFoundException;
import resort_management.repository.PaymentRepository;
import resort_management.service.PaymentService;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hóa đơn cho booking ID: " + bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenue(String period) {
        String normalized = period == null ? "month" : period.trim().toLowerCase();
        if (!List.of("day", "month", "year").contains(normalized))
            throw new BusinessException("period chỉ nhận: day, month, year");

        List<Object[]> results = switch (normalized) {
            case "day" -> paymentRepository.getRevenueByDay();
            case "year" -> paymentRepository.getRevenueByYear();
            default -> paymentRepository.getRevenueByMonth();
        };

        return results.stream()
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("period", row[0]);
                    item.put("revenue", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse markAsPaid(Long id) {
        return paymentRepository.findById(id).map(p -> {
            if (PaymentStatus.PAID == p.getPaymentStatus())
                throw new BusinessException("Hóa đơn này đã được thanh toán rồi!");
            p.setPaymentStatus(PaymentStatus.PAID);
            p.setPaymentDate(java.time.LocalDateTime.now());
            return PaymentResponse.from(paymentRepository.save(p));
        }).orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy hóa đơn ID: " + id));
    }

    @Override
    @Transactional
    public PaymentResponse update(Long id, PaymentRequest request) {
        return paymentRepository.findById(id).map(p -> {
            p.setAmount(request.getAmount());
            try {
                p.setPaymentMethod(PaymentMethod.valueOf(
                        request.getPaymentMethod().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BusinessException(
                        "Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: CASH, CARD");
            }
            if (PaymentStatus.PAID == p.getPaymentStatus())
                p.setPaymentDate(java.time.LocalDateTime.now());
            return PaymentResponse.from(paymentRepository.save(p));
        }).orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy hóa đơn ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getAllPaged(Pageable pageable) {
        return PageResponse.of(
                paymentRepository.findAll(pageable).map(PaymentResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending() {
        return paymentRepository.countPending();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getPendingPaged(Pageable pageable) {
        return PageResponse.of(
                paymentRepository.findAllPending(pageable).map(PaymentResponse::from));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!paymentRepository.existsById(id))
            throw new ResourceNotFoundException("Không tìm thấy hóa đơn ID: " + id);
        paymentRepository.deleteById(id);
    }
}