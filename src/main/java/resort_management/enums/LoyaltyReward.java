package resort_management.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum LoyaltyReward {

    SPA_BASIC(50,   "Spa cơ bản (60 phút)",          150_000),
    BUFFET_BREAKFAST(100, "Buffet sáng cho 2 người",  200_000),
    FREE_ROOM_STANDARD(200, "1 đêm phòng Standard",   500_000),
    SUITE_UPGRADE(500, "Nâng cấp phòng Suite",        1_500_000);

    private final int pointsRequired;   // Số điểm cần để đổi
    private final String description;   // Mô tả phần thưởng
    private final int equivalentValue;  // Giá trị tương đương (VND) — chỉ để hiển thị UI
}