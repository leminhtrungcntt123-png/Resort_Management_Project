package resort_management.dto.response;

import lombok.*;
import resort_management.entity.RoomType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {

    private Long id;
    private String typeName;
    private String description;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RoomTypeResponse from(RoomType roomType) {
        RoomTypeResponse dto = new RoomTypeResponse();
        dto.setId(roomType.getId());
        dto.setTypeName(roomType.getTypeName());
        dto.setDescription(roomType.getDescription());
        dto.setPricePerNight(roomType.getPricePerNight());
        dto.setCapacity(roomType.getCapacity());
        dto.setCreatedAt(roomType.getCreatedAt());
        dto.setUpdatedAt(roomType.getUpdatedAt());
        return dto;
    }
}