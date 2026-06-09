package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import resort_management.enums.RoomStatus;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@EqualsAndHashCode(callSuper = true) // FIX: kế thừa BaseEntity
@NoArgsConstructor
@AllArgsConstructor
public class Room extends BaseEntity { // FIX: thêm kế thừa

    @NotBlank(message = "Số phòng không được để trống")
    @Column(name = "room_number", nullable = false, unique = true, length = 20)
    private String roomNumber;

    @Column(name = "floor_number")
    private Integer floorNumber;

    // Trống | Đang ở | Bảo trì
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

// 1. Thêm fetch = FetchType.LAZY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    // 2. Thêm fetch = FetchType.LAZY
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BookingRoom> bookingRooms;
}
