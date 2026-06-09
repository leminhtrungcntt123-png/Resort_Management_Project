package resort_management.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import resort_management.common.ApiResponse;
import resort_management.common.PageResponse;
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

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final BookingManagementService bookingService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<BookingResponse> result = bookingRepository
                .findAll(PageRequest.of(page, size, sort))
                .map(BookingResponse::from);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.success(BookingResponse.from(b))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<BookingResponse> result = bookingRepository
                .findByStatus(bookingStatus, PageRequest.of(page, size, sort))
                .map(BookingResponse::from);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @GetMapping("/customer/{customerId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getByCustomer(
            @PathVariable Long customerId) {
        List<BookingResponse> list = bookingRepository.findByCustomerId(customerId)
                .stream().map(BookingResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest request) {
        try {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new Exception(
                            "Không tìm thấy khách hàng ID: " + request.getCustomerId()));

            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setCheckInDate(request.getCheckInDate());
            booking.setCheckOutDate(request.getCheckOutDate());
            booking.setStatus(BookingStatus.PENDING);

            List<BookingRoom> bookingRooms = new ArrayList<>();
            for (Long roomId : request.getRoomIds()) {
                Room room = roomRepository.findById(roomId)
                        .orElseThrow(() -> new Exception(
                                "Không tìm thấy phòng ID: " + roomId));
                BookingRoom br = new BookingRoom();
                br.setRoom(room);
                br.setPrice(room.getRoomType().getPricePerNight());
                br.setBooking(booking);
                bookingRooms.add(br);
            }
            booking.setBookingRooms(bookingRooms);

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
            return ResponseEntity.ok(ApiResponse.success(BookingResponse.from(saved)));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(
                    body.get("status").toUpperCase());
            return bookingRepository.findById(id).map(b -> {
                b.setStatus(bookingStatus);
                return ResponseEntity.ok(ApiResponse.success(
                        BookingResponse.from(bookingRepository.save(b))));
            }).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Trạng thái không hợp lệ: " + body.get("status")));
        }
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<String>> checkin(@PathVariable Long id) {
        try {
            bookingService.checkinBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Check-in thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<String>> checkout(@PathVariable Long id) {
        try {
            bookingService.checkoutBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Trả phòng thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Đã xóa booking ID: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // POST /api/bookings/{id}/services
    @PostMapping("/{id}/services")
    public ResponseEntity<ApiResponse<BookingResponse>> addService(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long serviceId = Long.valueOf(body.get("serviceId").toString());
            Integer quantity = Integer.valueOf(body.get("quantity").toString());
            BookingResponse response = bookingService.addServiceToBooking(id, serviceId, quantity);
            return ResponseEntity.ok(ApiResponse.success(
                    "Thêm dịch vụ thành công!", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}