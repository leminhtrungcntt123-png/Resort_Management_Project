
package resort_management.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum VipTier {

    VIP_0(BigDecimal.ZERO, 0, Set.of()),
    VIP_1(BigDecimal.valueOf(5_000_000), 0, Set.of("GYM", "BREAKFAST")),
    VIP_2(BigDecimal.valueOf(20_000_000), 1, Set.of("GYM", "BREAKFAST", "POOL")),
    VIP_3(BigDecimal.valueOf(100_000_000), 4, Set.of("GYM", "BREAKFAST", "POOL")),
    VIP_4(BigDecimal.valueOf(300_000_000), 7, Set.of("GYM", "BREAKFAST", "POOL")),
    VIP_5(BigDecimal.valueOf(800_000_000), 10, Set.of("GYM", "BREAKFAST", "POOL"));

    private final BigDecimal minSpent; // Mốc chi tiêu tối thiểu
    private final int discountPercent; // % giảm giá khi đặt phòng
    private final Set<String> freeServices; // Danh sách service được miễn phí
}