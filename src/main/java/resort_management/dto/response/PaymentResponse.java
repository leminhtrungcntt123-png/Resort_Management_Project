package resort_management.dto.response;

import lombok.*;
import resort_management.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private BigDecimal discountAmount; 

    // --- Thêm mới: thông tin booking đính kèm ---
    private BookingResponse bookingDetail;

    public static PaymentResponse from(Payment payment) {
        PaymentResponse dto = new PaymentResponse();
        dto.setId(payment.getId());
        dto.setBookingId(payment.getBooking() != null ? payment.getBooking().getId() : null);
        dto.setAmount(payment.getAmount());
        dto.setDiscountAmount(payment.getDiscountAmount());
        dto.setPaymentStatus(payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null);
        dto.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setCreatedAt(payment.getCreatedAt());

        // Map booking detail nếu có
        if (payment.getBooking() != null) {
            dto.setBookingDetail(BookingResponse.from(payment.getBooking()));
        }

        return dto;
    }
}