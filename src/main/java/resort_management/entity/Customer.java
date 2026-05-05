package resort_management.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@DiscriminatorValue("CUSTOMER")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends Person { // Đã kế thừa Person (Person lại kế thừa BaseEntity)

    // Các trường id, fullName, phone, email, createdAt đã được lớp cha lo hết!

    private Integer loyaltyPoints = 0; // Thêm điểm thưởng để thể hiện sự khác biệt với Employee

    // Giữ nguyên quan hệ Booking cực kỳ quan trọng của bạn
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Booking> bookings;

    @Override
    public String getRoleDescription() {
        return "Khách hàng thân thiết - Điểm tích lũy: " + loyaltyPoints;
    }
}