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
import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

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
        // Đã tối ưu cho Dashboard
        return roomRepository.findAllRoomsForDashboard().stream()
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
            RoomStatus roomStatus = RoomStatus.valueOf(status.toUpperCase());
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

        RoomStatus roomStatus = RoomStatus.AVAILABLE;
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                roomStatus = RoomStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái không hợp lệ: " + request.getStatus());
            }
        }

        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(roomStatus);
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

        RoomStatus roomStatus;
        try {
            roomStatus = RoomStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + request.getStatus());
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(roomStatus);
        room.setRoomType(roomType);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateStatus(Long id, String status) {
        RoomStatus roomStatus;
        try {
            roomStatus = RoomStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + id));
        room.setStatus(roomStatus);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ID: " + id));
        if (RoomStatus.OCCUPIED == room.getStatus())
            throw new BusinessException("Phòng này đang có khách, không được xóa!");
        roomRepository.deleteById(id);
    }

    // 🔥 TỐI ƯU PHÂN TRANG 1: Ép nạp sẵn RoomType bằng EntityGraph mặc định của JPA
    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getAllPaged(Pageable pageable) {
        // 🔥 ĐÃ SỬA: Nếu size lớn (lấy hết phòng), ép chạy qua hàm tối ưu gom SQL để
        // tránh N+1
        if (pageable.getPageSize() > 100) {
            List<RoomResponse> list = roomRepository.findAllRoomsForDashboard().stream()
                    .map(RoomResponse::from)
                    .collect(Collectors.toList());
            // Trả về dạng PageResponse giả lập phân trang cho Frontend không bị lỗi cấu
            // trúc
            return PageResponse.of(new org.springframework.data.domain.PageImpl<>(list, pageable, list.size()));
        }

        // Nếu phân trang nhỏ thông thường (trang quản lý phòng) thì giữ nguyên
        return PageResponse.of(
                roomRepository.findAll(pageable).map(RoomResponse::from));
    }

    // 🔥 TỐI ƯU PHÂN TRANG 2
    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getByStatus(RoomStatus status, Pageable pageable) {
        return PageResponse.of(
                roomRepository.findByStatus(status, pageable).map(RoomResponse::from));
    }

    // 🔥 TỐI ƯU PHÂN TRANG 3
    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getByFloor(Integer floorNumber, RoomStatus status, Pageable pageable) {
        if (status != null) {
            return PageResponse.of(
                    roomRepository.findByFloorNumberAndStatus(floorNumber, status, pageable)
                            .map(RoomResponse::from));
        }
        return PageResponse.of(
                roomRepository.findByFloorNumber(floorNumber, pageable).map(RoomResponse::from));
    }

    @Override
    public List<Integer> getFloorNumbers() {
        return roomRepository.findDistinctFloorNumbers();
    }

    @Override
    public java.util.List<RoomResponse> getAllRoomsWithoutPagination() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::from)
                .collect(java.util.stream.Collectors.toList());
    }
}