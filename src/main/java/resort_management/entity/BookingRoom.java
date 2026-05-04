package resort_management.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "booking_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // Lưu snapshot giá phòng tại thời điểm đặt (tránh bị thay đổi sau khi đã đặt)
    @Column(name = "price", nullable = false)
    private Double price;
}
