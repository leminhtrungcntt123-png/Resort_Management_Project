package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.common.PageResponse;
import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.service.PaymentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getAll(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getAllPaged(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByBooking(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getByBookingId(bookingId)));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenue(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getRevenue(period)));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> markAsPaid(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.markAsPaid(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.update(id, request)));
    }
}