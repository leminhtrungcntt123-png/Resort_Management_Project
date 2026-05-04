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

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingManagementService bookingService;

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
            // Nhường toàn bộ việc khó cho Service lo
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            // Nếu có lỗi (trùng phòng, sai ngày...) thì trả về lỗi 400 và lời nhắn
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        List<String> validStatuses = List.of("Chờ", "Đã xác nhận", "Đã hủy");
        if (!validStatuses.contains(newStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trạng thái không hợp lệ: " + newStatus));
        }
        return bookingRepository.findById(id).map(b -> {
            b.setStatus(newStatus);
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Gọi sang Service để nó dọn dẹp phòng ốc đàng hoàng rồi mới xóa
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa booking ID: " + id));
        } catch (RuntimeException e) {
            // Nếu không tìm thấy thì báo lỗi
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // API chuyên dùng để Trả phòng
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
