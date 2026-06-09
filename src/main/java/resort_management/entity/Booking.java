package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import resort_management.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "bookings")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"customer", "bookingRooms", "bookingServices", "payment"})
@NoArgsConstructor
@AllArgsConstructor
public class Booking extends BaseEntity {

    @NotNull(message = "Ngày check-in không được để trống")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @ToString.Exclude
    private Customer customer;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100) // 🔥 GOM LỆNH TRUY VẤN: Xử lý triệt để N+1 cho Room
    @ToString.Exclude
    private List<BookingRoom> bookingRooms;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100) // 🔥 GOM LỆNH TRUY VẤN: Xử lý triệt để N+1 cho Service
    @JsonIgnore
    @ToString.Exclude
    private List<BookingService> bookingServices;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private Payment payment;
}