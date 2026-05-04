package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "room_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên hạng phòng không được để trống")
    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @NotNull(message = "Sức chứa không được để trống")
    @Positive(message = "Sức chứa phải lớn hơn 0")
    @Column(nullable = false)
    private Integer capacity;

    // Ẩn danh sách phòng khi trả về JSON để tránh vòng lặp vô tận
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Room> rooms;
}
