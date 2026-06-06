package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.dto.request.ChangePasswordRequest;
import resort_management.dto.request.UserRequest;
import resort_management.dto.response.UserResponse;
import resort_management.service.UserService;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(
            @Valid @RequestBody UserRequest request,
            Authentication authentication) { // ← lấy thông tin người đang đăng nhập
        // Lấy role của người tạo để kiểm tra phương án C
        String creatorRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
        return ResponseEntity.ok(ApiResponse.success(
                "Tạo tài khoản thành công!",
                userService.create(request, creatorRole)));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<UserResponse>> toggleLock(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật trạng thái tài khoản thành công!",
                userService.toggleLock(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tài khoản ID: " + id));
    }

    // PATCH /api/users/change-password
    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        // Lấy username từ JWT token hiện tại
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!"));
    }
}