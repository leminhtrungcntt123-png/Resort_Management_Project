package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(callSuper = true) // FIX: kế thừa BaseEntity
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity { // FIX: thêm kế thừa BaseEntity

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    private Booking booking;

    @PositiveOrZero(message = "Số tiền không được âm")
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 10, nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
}
