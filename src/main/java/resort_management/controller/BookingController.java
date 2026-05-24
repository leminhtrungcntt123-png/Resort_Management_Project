package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import resort_management.dto.request.BookingRequest;
import resort_management.dto.response.BookingResponse;
import resort_management.entity.*;
import resort_management.enums.BookingStatus;
import resort_management.repository.*;
import resort_management.service.BookingManagementService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    // ← Chỉ giữ Repository cần thiết cho việc mapping request
    // Booking cần map Room, Customer, Service trước khi gọi Service
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final BookingManagementService bookingService;

    @GetMapping
    @Transactional(readOnly = true)
    public List<BookingResponse> getAll() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(BookingResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getByStatus(@PathVariable String status) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            List<BookingResponse> result = bookingRepository.findByStatus(bookingStatus)
                    .stream()
                    .map(BookingResponse::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Trạng thái không hợp lệ: " + status
                            + ". Các giá trị hợp lệ: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED"
            ));
        }
    }

    @GetMapping("/customer/{customerId}")
    @Transactional(readOnly = true)
    public List<BookingResponse> getByCustomer(@PathVariable Long customerId) {
        return bookingRepository.findByCustomerId(customerId)
                .stream()
                .map(BookingResponse::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookingRequest request) {
        try {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new Exception(
                            "Không tìm thấy khách hàng ID: " + request.getCustomerId()));

            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setCheckInDate(request.getCheckInDate());
            booking.setCheckOutDate(request.getCheckOutDate());
            booking.setStatus(BookingStatus.PENDING); // ← Enum

            // Map danh sách phòng
            List<BookingRoom> bookingRooms = new ArrayList<>();
            for (Long roomId : request.getRoomIds()) {
                Room room = roomRepository.findById(roomId)
                        .orElseThrow(() -> new Exception(
                                "Không tìm thấy phòng ID: " + roomId));
                BookingRoom br = new BookingRoom();
                br.setRoom(room);
                br.setPrice(room.getRoomType().getPricePerNight()); // BigDecimal snapshot
                br.setBooking(booking);
                bookingRooms.add(br);
            }
            booking.setBookingRooms(bookingRooms);

            // Map dịch vụ (nếu có)
            if (request.getServices() != null && !request.getServices().isEmpty()) {
                List<BookingService> bookingServices = new ArrayList<>();
                for (BookingRequest.BookingServiceRequest svcReq : request.getServices()) {
                    Service service = serviceRepository.findById(svcReq.getServiceId())
                            .orElseThrow(() -> new Exception(
                                    "Không tìm thấy dịch vụ ID: " + svcReq.getServiceId()));
                    BookingService bs = new BookingService();
                    bs.setService(service);
                    bs.setQuantity(svcReq.getQuantity());
                    bs.setBooking(booking);
                    bookingServices.add(bs);
                }
                booking.setBookingServices(bookingServices);
            }

            Booking saved = bookingService.createBooking(booking, request.getPaymentMethod());
            return ResponseEntity.ok(BookingResponse.from(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(newStatus.toUpperCase()); // ← Enum
            return bookingRepository.findById(id).map(b -> {
                b.setStatus(bookingStatus);
                return ResponseEntity.ok(BookingResponse.from(bookingRepository.save(b)));
            }).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Trạng thái không hợp lệ: " + newStatus
                            + ". Các giá trị hợp lệ: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED"
            ));
        }
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<?> checkin(@PathVariable Long id) {
        try {
            bookingService.checkinBooking(id);
            return ResponseEntity.ok(Map.of("message", "Check-in thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long id) {
        try {
            bookingService.checkoutBooking(id);
            return ResponseEntity.ok(Map.of("message", "Trả phòng thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa booking ID: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}