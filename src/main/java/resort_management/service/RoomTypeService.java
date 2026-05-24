package resort_management.service;

import resort_management.dto.request.RoomTypeRequest;
import resort_management.dto.response.RoomTypeResponse;
import java.util.List;

public interface RoomTypeService {
    List<RoomTypeResponse> getAll();
    RoomTypeResponse getById(Long id);
    RoomTypeResponse create(RoomTypeRequest request);
    RoomTypeResponse update(Long id, RoomTypeRequest request);
    void delete(Long id);
}