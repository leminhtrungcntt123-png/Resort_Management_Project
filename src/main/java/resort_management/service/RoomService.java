package resort_management.service;

import resort_management.common.PageResponse;
import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import resort_management.enums.RoomStatus;

import java.util.List;
import org.springframework.data.domain.Pageable;
import resort_management.common.PageResponse;

public interface RoomService {
    List<RoomResponse> getAll();
    RoomResponse getById(Long id);
    List<RoomResponse> getByStatus(String status);
    RoomResponse create(RoomRequest request);
    RoomResponse update(Long id, RoomRequest request);
    RoomResponse updateStatus(Long id, String status);
    void delete(Long id);
    PageResponse<RoomResponse> getAllPaged(Pageable pageable);
    PageResponse<RoomResponse> getByStatus(RoomStatus status, Pageable pageable);
    PageResponse<RoomResponse> getByFloor(Integer floorNumber, RoomStatus status, Pageable pageable);
    List<Integer> getFloorNumbers();
    List<resort_management.dto.response.RoomResponse> getAllRoomsWithoutPagination();
}