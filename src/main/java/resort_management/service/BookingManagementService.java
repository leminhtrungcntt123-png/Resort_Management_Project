package resort_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.entity.*;
import resort_management.repository.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingManagementService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private PaymentRepository paymentRepository;

    @Transactional
    public Booking createBooking(Booking bookingRequest, String paymentMethod) throws Exception {

        // 1. Kiểm tra ngày hợp lệ
        if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
            throw new Exception("Ngày check-out phải sau ngày check-in!");
        }

        long totalDays = ChronoUnit.DAYS.between(
                bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
        double totalAmount = 0.0;

        // 2. Xử lý danh sách PHÒNG: kiểm tra trùng lịch & tính tiền
        if (bookingRequest.getBookingRooms() == null || bookingRequest.getBookingRooms().isEmpty()) {
            throw new Exception("Đơn đặt phòng phải có ít nhất 1 phòng!");
        }

        for (BookingRoom br : bookingRequest.getBookingRooms()) {
            Room room = roomRepository.findById(br.getRoom().getId())
                    .orElseThrow(() -> new Exception("Không tìm thấy phòng ID: " + br.getRoom().getId()));

            // Kiểm tra trùng lịch
            List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                    room.getId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
            if (!overlaps.isEmpty()) {
                throw new Exception("Phòng " + room.getRoomNumber()
                        + " đã được đặt trong khoảng thời gian này!");
            }

            // Gán ngược để tránh lỗi booking_id is null
            br.setBooking(bookingRequest);
            br.setRoom(room);
            // Lấy giá thực từ DB, không tin giá gửi từ client
            br.setPrice(room.getRoomType().getPricePerNight());

            totalAmount += br.getPrice() * totalDays;
        }

        // 3. Xử lý dịch vụ kèm theo (nếu có)
        if (bookingRequest.getBookingServices() != null) {
            for (BookingService bs : bookingRequest.getBookingServices()) {
                resort_management.entity.Service service = serviceRepository
                        .findById(bs.getService().getId())
                        .orElseThrow(() -> new Exception(
                                "Không tìm thấy dịch vụ ID: " + bs.getService().getId()));
                bs.setBooking(bookingRequest);
                bs.setService(service);
                totalAmount += service.getPrice() * bs.getQuantity();
            }
        }

        // 4. Lưu Booking (Cascade sẽ tự lưu BookingRooms + BookingServices)
        Booking savedBooking = bookingRepository.save(bookingRequest);

        // FIX: Chỉ đổi phòng sang "Đang ở" nếu check-in là HÔM NAY hoặc đã qua.
        // Nếu đặt trước (future booking) thì phòng vẫn giữ trạng thái "Trống"
        // cho đến khi khách thực sự check-in (gọi API /checkout hoặc /status).
        LocalDate today = LocalDate.now();
        if (!bookingRequest.getCheckInDate().isAfter(today)) {
            for (BookingRoom br : savedBooking.getBookingRooms()) {
                Room room = br.getRoom();
                room.setStatus("Đang ở");
                roomRepository.save(room);
            }
        }
        // Nếu check-in trong tương lai → phòng vẫn "Trống", hệ thống chỉ ghi nhận đặt chỗ.

        // 5. Tạo Payment với tổng tiền đã tính
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalAmount);
        String normalizedPaymentMethod = paymentMethod == null ? "CASH" : paymentMethod.trim().toUpperCase();
        if (!"CASH".equals(normalizedPaymentMethod) && !"CARD".equals(normalizedPaymentMethod)) {
            throw new Exception("Phương thức thanh toán không hợp lệ. Chỉ chấp nhận CASH hoặc CARD.");
        }
        payment.setPaymentMethod(normalizedPaymentMethod);
        payment.setPaymentStatus("Chưa thanh toán");
        Payment savedPayment = paymentRepository.save(payment);

        // Đồng bộ quan hệ để response create booking luôn có payment ngay lập tức.
        savedBooking.setPayment(savedPayment);

        return savedBooking;
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn đặt phòng với ID: " + id));

        // Trả phòng về "Trống" trước khi xóa đơn
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus("Trống");
                    roomRepository.save(room);
                }
            }
        }

        bookingRepository.delete(booking);
    }

    @Transactional
    public void checkoutBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn đặt phòng với ID: " + id));

        // Chặn double-checkout
        if ("Đã trả phòng".equalsIgnoreCase(booking.getStatus())
                || "Đã hủy".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Đơn này đã kết thúc, không thể trả phòng lại!");
        }

        booking.setStatus("Đã trả phòng");

        // Trả phòng về "Trống"
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus("Trống");
                    roomRepository.save(room);
                }
            }
        }

        bookingRepository.save(booking);
    }

    // API hỗ trợ check-in thủ công (đổi phòng sang "Đang ở" cho future booking)
    @Transactional
    public void checkinBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn đặt phòng với ID: " + id));

        if (!"Đã xác nhận".equalsIgnoreCase(booking.getStatus())
                && !"Chờ".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể check-in đơn ở trạng thái Chờ hoặc Đã xác nhận!");
        }

        booking.setStatus("Đang ở");

        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus("Đang ở");
                    roomRepository.save(room);
                }
            }
        }

        bookingRepository.save(booking);
    }
}
