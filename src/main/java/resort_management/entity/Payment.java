package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(callSuper = true)   // FIX: kế thừa BaseEntity
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity { // FIX: thêm kế thừa BaseEntity

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    private Booking booking;

    @PositiveOrZero(message = "Số tiền không được âm")
    @Column(nullable = false)
    private Double amount;

    // FIX: thêm field này cho khớp với cột payment_method NOT NULL trong SQL
    // Giá trị: 'CASH' | 'CARD'
    @Column(name = "payment_method", length = 31, nullable = false)
    private String paymentMethod = "CASH";

    // Chưa thanh toán | Đã thanh toán | Thất bại
    @Column(name = "payment_status", length = 50, nullable = false)
    private String paymentStatus = "Chưa thanh toán";

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
}
