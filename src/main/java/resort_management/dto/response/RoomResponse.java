package resort_management.dto.response;

import lombok.*;
import resort_management.entity.Room;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private Long id;
    private String roomNumber;
    private Integer floorNumber;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nhúng thông tin hạng phòng gọn — không trả cả List<Room> lồng vào
    private RoomTypeInfo roomType;

    public static RoomResponse from(Room room) {
        RoomResponse dto = new RoomResponse();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setFloorNumber(room.getFloorNumber());
        dto.setStatus(room.getStatus() != null ? room.getStatus().name() : null);
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        if (room.getRoomType() != null) {
            dto.setRoomType(new RoomTypeInfo(
                    room.getRoomType().getId(),
                    room.getRoomType().getTypeName(),
                    room.getRoomType().getPricePerNight(),
                    room.getRoomType().getCapacity()));
        }
        return dto;
    }

    // Inner class — thông tin tóm tắt hạng phòng, không lồng vô tận
    @Data
    @AllArgsConstructor
    public static class RoomTypeInfo {
        private Long id;
        private String typeName;
        private BigDecimal pricePerNight;
        private Integer capacity;
    }
}