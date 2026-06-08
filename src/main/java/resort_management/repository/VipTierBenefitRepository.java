package resort_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import resort_management.entity.VipTierBenefit;
import resort_management.enums.VipTier;

import java.util.List;

public interface VipTierBenefitRepository extends JpaRepository<VipTierBenefit, Long> {

    // Lấy tất cả benefit của 1 tier
    List<VipTierBenefit> findByVipTier(VipTier vipTier);

    // Kiểm tra service này có miễn phí với tier này không
    boolean existsByVipTierAndServiceId(VipTier vipTier, Long serviceId);
}