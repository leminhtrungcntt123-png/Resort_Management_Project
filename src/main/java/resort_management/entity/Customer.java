package resort_management.entity;

import jakarta.persistence.*;
import lombok.*;
import resort_management.enums.VipTier;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.util.List;

@Entity
@DiscriminatorValue("CUSTOMER")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends Person {

    @Column(name = "total_spent", precision = 18, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "vip_tier", length = 10)
    private VipTier vipTier = VipTier.VIP_0;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Booking> bookings;

    @Override
    public String getRoleDescription() {
        return "Khách hàng " + vipTier + " - Tổng chi tiêu: " + totalSpent;
    }
}