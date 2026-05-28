package resort_management.dto.response;

import lombok.Builder;
import lombok.Getter;
import resort_management.entity.User;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String role;
    private Boolean isActive;
    private String employeeName; // Tên nhân viên liên kết

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .employeeName(user.getEmployee() != null
                        ? user.getEmployee().getFullName() : null)
                .build();
    }
}