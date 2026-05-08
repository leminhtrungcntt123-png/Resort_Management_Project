package resort_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;
}