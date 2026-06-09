package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_rooms")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"booking", "room"}) // Chặn loop hashcode
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY) // ĐÃ SỬA: Chuyển sang LAZY
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude // Chặn Lombok bóp hiệu năng
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY) // ĐÃ SỬA: Chuyển sang LAZY
    @JoinColumn(name = "room_id", nullable = false)
    @ToString.Exclude
    private Room room;

    @Positive(message = "Giá phòng phải lớn hơn 0")
    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;
}