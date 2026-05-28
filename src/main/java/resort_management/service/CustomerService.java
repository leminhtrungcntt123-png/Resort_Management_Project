package resort_management.service;

import resort_management.dto.request.CustomerRequest;
import resort_management.dto.response.CustomerResponse;
import java.util.List;

import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;


public interface CustomerService {
    List<CustomerResponse> getAll();
    CustomerResponse getById(Long id);
    List<CustomerResponse> searchByName(String name);
    CustomerResponse create(CustomerRequest request);
    CustomerResponse update(Long id, CustomerRequest request);
    void delete(Long id);
    PageResponse<CustomerResponse> getAllPaged(Pageable pageable);

}