package resort_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "persons") // Bảng chung cho cả khách và nhân viên
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "person_type")
@Data
@EqualsAndHashCode(callSuper = true)
public abstract class Person extends BaseEntity {

    @NotBlank(message = "Họ tên không được để trống")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone; // Giữ nguyên tên biến phone của bạn

    @Email(message = "Email không hợp lệ")
    @Column(length = 100)
    private String email;

    // ĐA HÌNH: Trả về vai trò
    public abstract String getRoleDescription();
}