package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.EmployeeRequest;
import resort_management.dto.response.EmployeeResponse;
import resort_management.entity.Employee;
import resort_management.repository.EmployeeRepository;
import resort_management.service.EmployeeService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAll().stream()
                .map(EmployeeResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return employeeRepository.findById(id)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên ID: " + id));
    }

    @Override
    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && employeeRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email '" + request.getEmail() + "' đã tồn tại");

        Employee emp = new Employee();
        emp.setFullName(request.getFullName());
        emp.setPhone(request.getPhone());
        emp.setEmail(request.getEmail());
        emp.setPosition(request.getPosition());
        emp.setSalary(request.getSalary());
        return EmployeeResponse.from(employeeRepository.save(emp));
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên ID: " + id));
        emp.setFullName(request.getFullName());
        emp.setPhone(request.getPhone());
        emp.setEmail(request.getEmail());
        emp.setPosition(request.getPosition());
        emp.setSalary(request.getSalary());
        return EmployeeResponse.from(employeeRepository.save(emp));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!employeeRepository.existsById(id))
            throw new RuntimeException("Không tìm thấy nhân viên ID: " + id);
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getAllPaged(Pageable pageable) {
        return PageResponse.of(
                employeeRepository.findAll(pageable).map(EmployeeResponse::from));
    }
}