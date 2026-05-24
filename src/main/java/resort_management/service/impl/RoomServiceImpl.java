package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import resort_management.entity.Room;
import resort_management.entity.RoomType;
import resort_management.repository.RoomRepository;
import resort_management.repository.RoomTypeRepository;
import resort_management.service.RoomService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAll() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(Long id) {
        return roomRepository.findById(id)
                .map(RoomResponse::from)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getByStatus(String status) {
        return roomRepository.findByStatus(status).stream()
                .map(RoomResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber()))
            throw new RuntimeException("Số phòng '" + request.getRoomNumber() + "' đã tồn tại");

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));

        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(request.getStatus() != null ? request.getStatus() : "Trống");
        room.setRoomType(roomType);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse update(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(request.getStatus());
        room.setRoomType(roomType);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateStatus(Long id, String status) {
        List<String> validStatuses = List.of("Trống", "Đang ở", "Bảo trì");
        if (!validStatuses.contains(status))
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
        room.setStatus(status);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
        if ("Đang ở".equalsIgnoreCase(room.getStatus()))
            throw new RuntimeException("Phòng này đang có khách, không được xóa!");
        roomRepository.deleteById(id);
    }
}