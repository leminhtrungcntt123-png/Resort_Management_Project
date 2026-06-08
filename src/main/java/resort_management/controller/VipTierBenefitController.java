package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.entity.VipTierBenefit;
import resort_management.enums.VipTier;
import resort_management.repository.VipTierBenefitRepository;

import java.util.List;

@RestController
@RequestMapping("/api/vip-benefits")
@RequiredArgsConstructor
public class VipTierBenefitController {

    private final VipTierBenefitRepository vipTierBenefitRepository;

    // Lấy tất cả benefit của 1 tier
    // GET /api/vip-benefits?tier=VIP_2
    @GetMapping
    public ResponseEntity<ApiResponse<List<VipTierBenefit>>> getByTier(
            @RequestParam VipTier tier) {
        return ResponseEntity.ok(
            ApiResponse.success(vipTierBenefitRepository.findByVipTier(tier))
        );
    }

    // Thêm benefit mới
    // POST /api/vip-benefits
    @PostMapping
    public ResponseEntity<ApiResponse<VipTierBenefit>> create(
            @RequestBody @Valid VipTierBenefit benefit) {
        return ResponseEntity.ok(
            ApiResponse.success(vipTierBenefitRepository.save(benefit))
        );
    }

    // Xóa benefit
    // DELETE /api/vip-benefits/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        vipTierBenefitRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}