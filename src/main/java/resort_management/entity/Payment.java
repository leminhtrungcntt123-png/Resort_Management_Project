package resort_management.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    private Booking booking;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_status", length = 50, nullable = false)
    private String paymentStatus = "Chưa thanh toán"; // Chưa thanh toán | Đã thanh toán | Thất bại

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
}
