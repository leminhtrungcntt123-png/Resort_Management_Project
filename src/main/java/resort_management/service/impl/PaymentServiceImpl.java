package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.entity.Booking;
import resort_management.entity.BookingRoom;
import resort_management.entity.Room;
import resort_management.enums.BookingStatus;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;
import resort_management.enums.RoomStatus;
import resort_management.exception.BusinessException;
import resort_management.exception.ResourceNotFoundException;
import resort_management.repository.BookingRepository;
import resort_management.repository.PaymentRepository;
import resort_management.repository.RoomRepository;
import resort_management.service.PaymentService;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;   // ← thêm mới
    private final RoomRepository roomRepository;         // ← thêm mới

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
            case "day"  -> paymentRepository.getRevenueByDay();
            case "year" -> paymentRepository.getRevenueByYear();
            default     -> paymentRepository.getRevenueByMonth();
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

            // Mark PAID
            p.setPaymentStatus(PaymentStatus.PAID);
            p.setPaymentDate(java.time.LocalDateTime.now());
            paymentRepository.save(p);

            // --- Thêm mới: tự động xử lý booking + phòng khi thanh toán ---
            Booking booking = p.getBooking();
            if (booking != null) {
                LocalDate today = LocalDate.now();

                // Nếu trả phòng sớm hơn ngày dự kiến → cập nhật checkOutDate về hôm nay
// Chỉ set nếu today > checkInDate để tránh vi phạm constraint DB
                if (booking.getStatus() == BookingStatus.CHECKED_OUT
                        && booking.getCheckOutDate().isAfter(today)
                        && today.isAfter(booking.getCheckInDate())) {
                    booking.setCheckOutDate(today);
                }

                // Đảm bảo phòng về AVAILABLE sau khi thanh toán xong
                if (booking.getBookingRooms() != null) {
                    for (BookingRoom br : booking.getBookingRooms()) {
                        Room room = br.getRoom();
                        if (room != null
                                && room.getStatus() != RoomStatus.AVAILABLE) {
                            room.setStatus(RoomStatus.AVAILABLE);
                            roomRepository.save(room);
                        }
                    }
                }

                bookingRepository.save(booking);
            }

            return PaymentResponse.from(p);
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

    @Override
    @Transactional(readOnly = true)
    public java.math.BigDecimal getRevenueToday() {
        java.math.BigDecimal result = paymentRepository.getRevenueToday();
        return result != null ? result : java.math.BigDecimal.ZERO;
    }
}