package resort_management.dto.response;

import lombok.Builder;
import lombok.Getter;
import resort_management.entity.Employee;

@Getter
@Builder
public class EmployeeResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String position;
    private Double salary;

    public static EmployeeResponse from(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .fullName(e.getFullName())
                .phone(e.getPhone())
                .email(e.getEmail())
                .position(e.getPosition())
                .salary(e.getSalary())
                .build();
    }
}