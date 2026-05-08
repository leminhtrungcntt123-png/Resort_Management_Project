package resort_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    private Integer floorNumber;

    // Trống | Đang ở | Bảo trì
    private String status = "Trống";

    @NotNull(message = "Hạng phòng không được để trống")
    private Long roomTypeId; // Chỉ nhận ID, không nhận cả object RoomType
}