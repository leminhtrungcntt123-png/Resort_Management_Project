package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("EMPLOYEE")       // FIX: thiếu hoàn toàn trong file cũ
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends Person { // FIX: không kế thừa Person

    @Column(length = 100)
    private String position;           // Chức vụ (Lễ tân, Admin, Nhân viên...)

    @PositiveOrZero(message = "Lương không được âm")
    @Column(name = "salary", precision = 18, scale = 2)
    private BigDecimal salary;

    @Override
    public String getRoleDescription() {
        return "Nhân viên - Chức vụ: " + (position != null ? position : "Chưa phân công");
    }
}
