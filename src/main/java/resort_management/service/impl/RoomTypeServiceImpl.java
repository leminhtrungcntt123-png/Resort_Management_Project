package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.RoomTypeRequest;
import resort_management.dto.response.RoomTypeResponse;
import resort_management.entity.RoomType;
import resort_management.repository.RoomTypeRepository;
import resort_management.service.RoomTypeService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomTypeResponse> getAll() {
        return roomTypeRepository.findAll().stream()
                .map(RoomTypeResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomTypeResponse getById(Long id) {
        return roomTypeRepository.findById(id)
                .map(RoomTypeResponse::from)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng phòng ID: " + id));
    }

    @Override
    @Transactional
    public RoomTypeResponse create(RoomTypeRequest request) {
        RoomType rt = new RoomType();
        rt.setTypeName(request.getTypeName());
        rt.setDescription(request.getDescription());
        rt.setPricePerNight(request.getPricePerNight());
        rt.setCapacity(request.getCapacity());
        return RoomTypeResponse.from(roomTypeRepository.save(rt));
    }

    @Override
    @Transactional
    public RoomTypeResponse update(Long id, RoomTypeRequest request) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng phòng ID: " + id));
        rt.setTypeName(request.getTypeName());
        rt.setDescription(request.getDescription());
        rt.setPricePerNight(request.getPricePerNight());
        rt.setCapacity(request.getCapacity());
        return RoomTypeResponse.from(roomTypeRepository.save(rt));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!roomTypeRepository.existsById(id))
            throw new RuntimeException("Không tìm thấy hạng phòng ID: " + id);
        roomTypeRepository.deleteById(id);
    }
}