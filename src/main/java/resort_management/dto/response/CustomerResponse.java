package resort_management.dto.response;

import lombok.*;
import resort_management.entity.Customer;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String email;   
    private Integer loyaltyPoints;
    private LocalDateTime createdAt;

    // Factory method: chuyển Entity → DTO (không để controller tự map thủ công)
    public static CustomerResponse from(Customer customer) {
        CustomerResponse dto = new CustomerResponse();
        dto.setId(customer.getId());
        dto.setFullName(customer.getFullName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setLoyaltyPoints(customer.getLoyaltyPoints());
        dto.setCreatedAt(customer.getCreatedAt());
        return dto;
    }
}