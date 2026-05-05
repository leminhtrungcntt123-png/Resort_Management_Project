package resort_management.dto.response;

import lombok.*;
import resort_management.entity.Service;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {

    private Long id;
    private String serviceName;
    private Double price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ServiceResponse from(Service service) {
        ServiceResponse dto = new ServiceResponse();
        dto.setId(service.getId());
        dto.setServiceName(service.getServiceName());
        dto.setPrice(service.getPrice());
        dto.setCreatedAt(service.getCreatedAt());
        dto.setUpdatedAt(service.getUpdatedAt());
        return dto;
    }
}