package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resort_management.dto.request.PaymentRequest;
import resort_management.dto.response.PaymentResponse;
import resort_management.service.PaymentService;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import resort_management.common.PageResponse;
import resort_management.common.ApiResponse;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getAllPaged(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getByBookingId(bookingId));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenue(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(paymentService.getRevenue(period));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.markAsPaid(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> update(@PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.update(id, request));
    }
}