package resort_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Số tiền không được để trống")
    @PositiveOrZero(message = "Số tiền không được âm")
    private Double amount;

    // CASH | CARD
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
}