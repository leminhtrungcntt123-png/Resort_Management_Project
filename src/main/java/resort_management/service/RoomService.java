package resort_management.service;

import resort_management.common.PageResponse;
import resort_management.dto.request.RoomRequest;
import resort_management.dto.response.RoomResponse;
import java.util.List;
import java.util.Map;
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
}