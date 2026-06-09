package resort_management.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import resort_management.security.JwtFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF vì dùng JWT (stateless)
                .csrf(csrf -> csrf.disable())

                // Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Không dùng Session — JWT tự quản lý
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(ex -> ex
                        // Không có token → 401
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(401);
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Vui lòng đăng nhập để tiếp tục!\"}");
                        })
                        // Có token nhưng không đủ quyền → 403
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(403);
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Bạn không có quyền thực hiện thao tác này!\"}");
                        }))

                // Quy tắc phân quyền endpoint
                .authorizeHttpRequests(auth -> auth

                        // Public — ai cũng vào được
                        .requestMatchers(
                                "/api/auth/login",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**")
                        .permitAll()

                        // Rooms — xóa chỉ ADMIN
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("ADMIN")
                        // Rooms — thêm/sửa: ADMIN + MANAGER
                        .requestMatchers(HttpMethod.POST, "/api/rooms/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/rooms/**").hasAnyRole("ADMIN", "MANAGER")

                        // Hạng phòng — thêm/sửa/xóa: ADMIN + MANAGER
                        .requestMatchers(HttpMethod.POST, "/api/room-types/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/room-types/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/room-types/**").hasAnyRole("ADMIN", "MANAGER")

                        // Dịch vụ — thêm/sửa/xóa: ADMIN + MANAGER
                        .requestMatchers(HttpMethod.POST, "/api/services/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/services/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/services/**").hasAnyRole("ADMIN", "MANAGER")

                        // Thêm dịch vụ vào booking — ADMIN + MANAGER + RECEPTIONIST
                        .requestMatchers(HttpMethod.POST, "/api/bookings/*/services").authenticated()

                        // Khách hàng — xóa chỉ ADMIN
                        .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("ADMIN")

                        // Booking — hủy chỉ ADMIN + MANAGER
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasAnyRole("ADMIN", "MANAGER")

                        // Doanh thu — ADMIN + MANAGER
                        .requestMatchers("/api/payments/revenue").hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasRole("ADMIN")

                        // Nhân viên — chỉ ADMIN
                        .requestMatchers("/api/employees/**").hasRole("ADMIN")

                        // Users — ADMIN tạo mọi role, MANAGER tạo RECEPTIONIST (xử lý trong Service)
                        .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "MANAGER")

                        // Tất cả còn lại — cần đăng nhập, mọi role
                        .anyRequest().authenticated())

                // Thêm JWT Filter vào trước filter mặc định của Spring
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Cấu hình CORS — thay thế @CrossOrigin("*") ở các Controller
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://clever-reverence-production-0210.up.railway.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // BCrypt để mã hóa password
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager để xác thực username/password
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}