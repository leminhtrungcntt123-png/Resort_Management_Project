package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import resort_management.dto.request.ChangePasswordRequest;
import resort_management.dto.request.UserRequest;
import resort_management.dto.response.UserResponse;
import resort_management.entity.Employee;
import resort_management.entity.User;
import resort_management.enums.Role;
import resort_management.exception.BusinessException;
import resort_management.exception.DuplicateResourceException;
import resort_management.exception.ResourceNotFoundException;
import resort_management.repository.EmployeeRepository;
import resort_management.repository.UserRepository;
import resort_management.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder; // BCrypt từ SecurityConfig

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản ID: " + id));
    }

    @Override
    @Transactional
    public UserResponse create(UserRequest request, String creatorRole) {
        // Kiểm tra username trùng
        if (userRepository.existsByUsername(request.getUsername()))
            throw new DuplicateResourceException(
                    "Username '" + request.getUsername() + "' đã tồn tại");

        // Parse role từ String → Enum
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                    "Role không hợp lệ. Chỉ chấp nhận: ADMIN, MANAGER, RECEPTIONIST");
        }

        // MANAGER chỉ được tạo RECEPTIONIST — Phương án C
        if ("MANAGER".equals(creatorRole) && role != Role.RECEPTIONIST)
            throw new BusinessException(
                    "Manager chỉ được tạo tài khoản RECEPTIONIST!");

        // Liên kết nhân viên nếu có
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy nhân viên ID: " + request.getEmployeeId()));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // ← BCrypt tự động
        user.setRole(role);
        user.setIsActive(true);
        user.setEmployee(employee);

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse toggleLock(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản ID: " + id));

        // Đảo trạng thái: active → locked, locked → active
        user.setIsActive(!user.getIsActive());
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id))
            throw new ResourceNotFoundException(
                    "Không tìm thấy tài khoản ID: " + id);
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + username));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))
            throw new BusinessException("Mật khẩu cũ không đúng!");

        // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword()))
            throw new BusinessException("Mật khẩu mới không được trùng mật khẩu cũ!");

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}