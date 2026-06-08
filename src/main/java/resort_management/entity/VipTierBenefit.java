package resort_management.entity;

import jakarta.persistence.*;
import lombok.*;
import resort_management.enums.VipTier;

@Entity
@Table(name = "vip_tier_benefits")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class VipTierBenefit extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "vip_tier", length = 10, nullable = false)
    private VipTier vipTier;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;
}