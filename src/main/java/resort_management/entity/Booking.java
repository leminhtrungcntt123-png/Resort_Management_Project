package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Booking extends BaseEntity { // FIX: kế thừa BaseEntity (bỏ createdAt tự quản)

    @NotNull(message = "Ngày check-in không được để trống")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    // FIX: đồng bộ đủ 5 trạng thái với SQL và BookingManagementService
    // Chờ | Đã xác nhận | Đang ở | Đã hủy | Đã trả phòng
    @Column(name = "status", length = 50, nullable = false)
    private String status = "Chờ";

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingRoom> bookingRooms;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<BookingService> bookingServices;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;
}
