package resort_management.service;

import resort_management.dto.request.UserRequest;
import resort_management.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> getAll();
    UserResponse getById(Long id);
    UserResponse create(UserRequest request, String creatorRole);
    UserResponse toggleLock(Long id); // Khóa/mở tài khoản
    void delete(Long id);
}