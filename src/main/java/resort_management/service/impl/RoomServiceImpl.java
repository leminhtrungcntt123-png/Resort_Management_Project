package resort_management.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import resort_management.entity.Room;
import resort_management.entity.RoomType;
import resort_management.enums.RoomStatus;
import resort_management.repository.RoomRepository;
import resort_management.repository.RoomTypeRepository;
import resort_management.service.RoomService;
import resort_management.exception.ResourceNotFoundException;
import resort_management.exception.BusinessException;

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
                .map(RoomResponse::from)
                .collect(Collectors.toList());
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
        try {
            RoomStatus roomStatus = RoomStatus.valueOf(status.toUpperCase()); // ← String → Enum
            return roomRepository.findByStatus(roomStatus).stream()
                    .map(RoomResponse::from)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status
                    + ". Các giá trị hợp lệ: AVAILABLE, OCCUPIED, MAINTENANCE");
        }
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber()))
            throw new RuntimeException("Số phòng '" + request.getRoomNumber() + "' đã tồn tại");

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));

        // Convert String status → RoomStatus Enum (mặc định AVAILABLE)
        RoomStatus roomStatus = RoomStatus.AVAILABLE;
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                roomStatus = RoomStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái không hợp lệ: " + request.getStatus()
                        + ". Các giá trị hợp lệ: AVAILABLE, OCCUPIED, MAINTENANCE");
            }
        }

        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(roomStatus); // ← Enum
        room.setRoomType(roomType);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse update(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hạng phòng ID: " + request.getRoomTypeId()));

        // Convert String status → RoomStatus Enum
        RoomStatus roomStatus;
        try {
            roomStatus = RoomStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + request.getStatus()
                    + ". Các giá trị hợp lệ: AVAILABLE, OCCUPIED, MAINTENANCE");
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(roomStatus); // ← Enum
        room.setRoomType(roomType);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateStatus(Long id, String status) {
        // Convert String → Enum, tự validate luôn
        RoomStatus roomStatus;
        try {
            roomStatus = RoomStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status
                    + ". Các giá trị hợp lệ: AVAILABLE, OCCUPIED, MAINTENANCE");
        }

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
        room.setStatus(roomStatus); // ← Enum
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ID: " + id));
        if (RoomStatus.OCCUPIED == room.getStatus()) // ← so sánh Enum
            throw new BusinessException("Phòng này đang có khách, không được xóa!");
        roomRepository.deleteById(id);
    }
}