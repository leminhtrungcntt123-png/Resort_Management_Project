package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.dto.request.LoginRequest;
import resort_management.dto.response.AuthResponse;
import resort_management.entity.User;
import resort_management.repository.UserRepository;
import resort_management.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            // Xác thực username/password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Đúng → lấy thông tin user
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow();

            // Kiểm tra tài khoản có bị khóa không
            if (!user.getIsActive()) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Tài khoản đã bị khóa. Liên hệ Admin!"));
            }

            // Tạo token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getRole().name(),
                    86400000L // 24 giờ
            );

            return ResponseEntity.ok(
                    ApiResponse.success("Đăng nhập thành công!", authResponse));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Sai tên đăng nhập hoặc mật khẩu!"));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Đăng nhập thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        AuthResponse authResponse = new AuthResponse(
                null, // Không trả token mới
                user.getUsername(),
                user.getRole().name(),
                0L
        );
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }
}