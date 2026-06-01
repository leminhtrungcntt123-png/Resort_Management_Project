package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.CustomerRequest;
import resort_management.dto.response.CustomerResponse;
import resort_management.entity.Customer;
import resort_management.repository.CustomerRepository;
import resort_management.service.CustomerService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

@Service
@RequiredArgsConstructor // Constructor injection tự động qua Lombok
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return customerRepository.findById(id)
                .map(CustomerResponse::from)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> searchByName(String name) {
        return customerRepository.findByFullNameContainingIgnoreCase(name)
                .stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email '" + request.getEmail() + "' đã tồn tại");
        }
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!customerRepository.existsById(id))
            throw new RuntimeException("Không tìm thấy khách hàng ID: " + id);
        customerRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getAllPaged(Pageable pageable) {
        return PageResponse.of(
                customerRepository.findAll(pageable).map(CustomerResponse::from));
    }
}