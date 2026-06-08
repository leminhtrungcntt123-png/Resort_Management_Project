package resort_management.dto.response;

import lombok.*;
import resort_management.entity.Customer;
import resort_management.enums.VipTier;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private BigDecimal totalSpent;
    private VipTier vipTier;
    private LocalDateTime createdAt;

    public static CustomerResponse from(Customer customer) {
        CustomerResponse dto = new CustomerResponse();
        dto.setId(customer.getId());
        dto.setFullName(customer.getFullName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setTotalSpent(customer.getTotalSpent());
        dto.setVipTier(customer.getVipTier());
        dto.setCreatedAt(customer.getCreatedAt());
        return dto;
    }
}