package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.ServiceRequest;
import resort_management.dto.response.ServiceResponse;
import resort_management.exception.ResourceNotFoundException;
import resort_management.repository.ServiceRepository;
import resort_management.service.ResortServiceMgmt;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResortServiceMgmtImpl implements ResortServiceMgmt {

    private final ServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAll() {
        return serviceRepository.findAll().stream()
                .map(ServiceResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getById(Long id) {
        return serviceRepository.findById(id)
                .map(ServiceResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ ID: " + id));
    }

    @Override
    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        resort_management.entity.Service service = new resort_management.entity.Service();
        service.setServiceName(request.getServiceName());
        service.setPrice(request.getPrice());
        return ServiceResponse.from(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        resort_management.entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ ID: " + id));
        service.setServiceName(request.getServiceName());
        service.setPrice(request.getPrice());
        return ServiceResponse.from(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!serviceRepository.existsById(id))
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ ID: " + id);
        serviceRepository.deleteById(id);
    }
}