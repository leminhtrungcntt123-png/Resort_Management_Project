package resort_management.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Số tiền không được để trống")
    @PositiveOrZero(message = "Số tiền không được âm")
    private BigDecimal amount;

    // CASH | CARD
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
}