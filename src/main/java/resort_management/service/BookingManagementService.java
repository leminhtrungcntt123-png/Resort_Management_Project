package resort_management.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.entity.*;
import resort_management.enums.BookingStatus;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;
import resort_management.enums.RoomStatus;
import resort_management.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor // ← đổi sang constructor injection
public class BookingManagementService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Booking createBooking(Booking bookingRequest, String paymentMethod) throws Exception {

        // 1. Kiểm tra ngày hợp lệ
        if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
            throw new Exception("Ngày check-out phải sau ngày check-in!");
        }

        long totalDays = ChronoUnit.DAYS.between(
                bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());

        BigDecimal totalAmount = BigDecimal.ZERO; // ← BigDecimal.ZERO thay 0.0

        // 2. Xử lý danh sách phòng
        if (bookingRequest.getBookingRooms() == null || bookingRequest.getBookingRooms().isEmpty()) {
            throw new Exception("Đơn đặt phòng phải có ít nhất 1 phòng!");
        }

        for (BookingRoom br : bookingRequest.getBookingRooms()) {
            Room room = roomRepository.findById(br.getRoom().getId())
                    .orElseThrow(() -> new Exception(
                            "Không tìm thấy phòng ID: " + br.getRoom().getId()));

            // Kiểm tra trùng lịch
            List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                    room.getId(),
                    bookingRequest.getCheckInDate(),
                    bookingRequest.getCheckOutDate());
            if (!overlaps.isEmpty()) {
                throw new Exception("Phòng " + room.getRoomNumber()
                        + " đã được đặt trong khoảng thời gian này!");
            }

            br.setBooking(bookingRequest);
            br.setRoom(room);
            // Snapshot giá — lấy từ DB, BigDecimal
            BigDecimal pricePerNight = room.getRoomType().getPricePerNight();
            br.setPrice(pricePerNight);

            // Tính tiền: price * số ngày
            totalAmount = totalAmount.add(
                    pricePerNight.multiply(BigDecimal.valueOf(totalDays))
            );
        }

        // 3. Xử lý dịch vụ kèm theo
        if (bookingRequest.getBookingServices() != null) {
            for (BookingService bs : bookingRequest.getBookingServices()) {
                resort_management.entity.Service service = serviceRepository
                        .findById(bs.getService().getId())
                        .orElseThrow(() -> new Exception(
                                "Không tìm thấy dịch vụ ID: " + bs.getService().getId()));
                bs.setBooking(bookingRequest);
                bs.setService(service);

                // Tính tiền dịch vụ: price * quantity
                totalAmount = totalAmount.add(
                        service.getPrice().multiply(BigDecimal.valueOf(bs.getQuantity()))
                );
            }
        }

        // 4. Lưu Booking
        Booking savedBooking = bookingRepository.save(bookingRequest);

        // 5. Đổi trạng thái phòng nếu check-in hôm nay
        LocalDate today = LocalDate.now();
        if (!bookingRequest.getCheckInDate().isAfter(today)) {
            for (BookingRoom br : savedBooking.getBookingRooms()) {
                Room room = br.getRoom();
                room.setStatus(RoomStatus.OCCUPIED); // ← dùng Enum
                roomRepository.save(room);
            }
        }

        // 6. Tạo Payment
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalAmount); // ← BigDecimal
        String normalized = paymentMethod == null ? "CASH" : paymentMethod.trim().toUpperCase();
        try {
            payment.setPaymentMethod(PaymentMethod.valueOf(normalized)); // ← Enum
        } catch (IllegalArgumentException e) {
            // Đã sửa lại câu thông báo lỗi
            throw new Exception("Phương thức thanh toán không hợp lệ. Chỉ chấp nhận CASH, CARD hoặc QR.");
        }
        payment.setPaymentStatus(PaymentStatus.PENDING); // ← Enum
        Payment savedPayment = paymentRepository.save(payment);
        savedBooking.setPayment(savedPayment);

        return savedBooking;
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn đặt phòng với ID: " + id));

        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.AVAILABLE); // ← Enum
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

        if (booking.getStatus() == BookingStatus.CHECKED_OUT
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đơn này đã kết thúc, không thể trả phòng lại!");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT); // ← Enum

        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.AVAILABLE); // ← Enum
                    roomRepository.save(room);
                }
            }
        }
        bookingRepository.save(booking);
    }

    @Transactional
    public void checkinBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn đặt phòng với ID: " + id));

        if (booking.getStatus() != BookingStatus.CONFIRMED
                && booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Chỉ có thể check-in đơn ở trạng thái PENDING hoặc CONFIRMED!");
        }

        booking.setStatus(BookingStatus.CHECKED_IN); // ← Enum

        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.OCCUPIED); // ← Enum
                    roomRepository.save(room);
                }
            }
        }
        bookingRepository.save(booking);
    }
}