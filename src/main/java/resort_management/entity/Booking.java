package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Ngày check-in không được để trống")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    // FIX: Đồng bộ với CHECK constraint trong SQL ('Chờ','Đã xác nhận','Đã hủy')
    @Column(name = "status", length = 50, nullable = false)
    private String status = "Chờ";  // Các giá trị: Chờ, Đã xác nhận, Đang ở, Đã hủy, Đã trả phòng

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // THAY THẾ @ManyToMany bằng entity trung gian để lưu được giá phòng
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingRoom> bookingRooms;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<BookingService> bookingServices;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;
}
