package resort_management.service;

import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import java.util.List;
import java.util.Map;

public interface PaymentService {
    List<PaymentResponse> getAll();
    PaymentResponse getByBookingId(Long bookingId);
    List<Map<String, Object>> getRevenue(String period);
    PaymentResponse markAsPaid(Long id);
    PaymentResponse update(Long id, PaymentRequest request);
}