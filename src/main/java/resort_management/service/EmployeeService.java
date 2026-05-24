package resort_management.service;

import resort_management.dto.request.EmployeeRequest;
import resort_management.dto.response.EmployeeResponse;
import java.util.List;

public interface EmployeeService {
    List<EmployeeResponse> getAll();
    EmployeeResponse getById(Long id);
    EmployeeResponse create(EmployeeRequest request);
    EmployeeResponse update(Long id, EmployeeRequest request);
    void delete(Long id);
}