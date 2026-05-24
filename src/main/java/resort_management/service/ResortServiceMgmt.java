package resort_management.service;

import resort_management.dto.request.ServiceRequest;
import resort_management.dto.response.ServiceResponse;
import java.util.List;

public interface ResortServiceMgmt {
    List<ServiceResponse> getAll();
    ServiceResponse getById(Long id);
    ServiceResponse create(ServiceRequest request);
    ServiceResponse update(Long id, ServiceRequest request);
    void delete(Long id);
}