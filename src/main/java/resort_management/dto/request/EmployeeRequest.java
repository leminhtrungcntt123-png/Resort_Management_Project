package resort_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String position;

    @PositiveOrZero(message = "Lương không được âm")
    private Double salary;
}