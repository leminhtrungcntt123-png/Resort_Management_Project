package resort_management.controller;

import resort_management.entity.*;
import resort_management.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import resort_management.service.BookingManagementService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingManagementService bookingService;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Booking> getByStatus(@PathVariable String status) {
        return bookingRepository.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Booking booking) {
        try {
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");

        // FIX: đồng bộ đủ 5 trạng thái — khớp với SQL CHECK constraint và Service
        List<String> validStatuses = List.of("Chờ", "Đã xác nhận", "Đang ở", "Đã hủy", "Đã trả phòng");
        if (!validStatuses.contains(newStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trạng thái không hợp lệ: " + newStatus
                            + ". Các giá trị hợp lệ: " + validStatuses));
        }

        return bookingRepository.findById(id).map(b -> {
            b.setStatus(newStatus);
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa booking ID: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // Check-in thủ công cho future booking (đặt trước, hôm nay mới đến)
    @PutMapping("/{id}/checkin")
    public ResponseEntity<?> checkin(@PathVariable Long id) {
        try {
            bookingService.checkinBooking(id);
            return ResponseEntity.ok(Map.of("message", "Check-in thành công! Phòng đã chuyển sang Đang ở."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long id) {
        try {
            bookingService.checkoutBooking(id);
            return ResponseEntity.ok(Map.of("message", "Đã trả phòng thành công, phòng đã được dọn trống!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
