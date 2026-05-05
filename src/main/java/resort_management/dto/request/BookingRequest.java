package resort_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Khách hàng không được để trống")
    private Long customerId; // Chỉ nhận ID

    @NotNull(message = "Ngày check-in không được để trống")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    private LocalDate checkOutDate;

    // Danh sách ID phòng muốn đặt
    @NotEmpty(message = "Phải chọn ít nhất 1 phòng")
    private List<Long> roomIds;

    // Danh sách dịch vụ kèm theo (có thể null)
    private List<BookingServiceRequest> services;

    // Phương thức thanh toán: CASH | CARD
    private String paymentMethod = "CASH";

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingServiceRequest {
        @NotNull
        private Long serviceId;

        @Positive(message = "Số lượng phải lớn hơn 0")
        private Integer quantity = 1;
    }
}