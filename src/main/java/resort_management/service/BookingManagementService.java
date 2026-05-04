package resort_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import resort_management.entity.*;
import resort_management.repository.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingManagementService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ServiceRepository serviceRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional // Đảm bảo nếu lỗi ở đâu thì rollback (hủy) toàn bộ, không lưu data rác
    public Booking createBooking(Booking bookingRequest) throws Exception {

        // 1. Kiểm tra ngày hợp lệ
        if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
            throw new Exception("Ngày check-out phải sau ngày check-in!");
        }

        long totalDays = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
        double totalAmount = 0.0;

        // 2. Xử lý danh sách PHÒNG: Kiểm tra trùng & Tính tiền
        if (bookingRequest.getBookingRooms() != null && !bookingRequest.getBookingRooms().isEmpty()) {
            for (BookingRoom br : bookingRequest.getBookingRooms()) {
                Room room = roomRepository.findById(br.getRoom().getId())
                        .orElseThrow(() -> new Exception("Không tìm thấy phòng ID: " + br.getRoom().getId()));

                // Kiểm tra trùng lịch
                List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                        room.getId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
                if (!overlaps.isEmpty()) {
                    throw new Exception("Phòng " + room.getRoomNumber() + " đã được đặt trong khoảng thời gian này!");
                }

                // Gán ngược booking vào bookingRoom (tránh lỗi 500 booking_id is null)
                br.setBooking(bookingRequest);
                br.setRoom(room);
                // Lấy giá thực tế từ Database tại thời điểm đặt (tránh Frontend gửi giá ảo lên)
                br.setPrice(room.getRoomType().getPricePerNight());

                // Cộng tiền phòng (Giá phòng * Số đêm)
                totalAmount += br.getPrice() * totalDays;
            }
        } else {
            throw new Exception("Đơn đặt phòng phải có ít nhất 1 phòng!");
        }

        // 3. Xử lý danh sách DỊCH VỤ (Nếu có)
        if (bookingRequest.getBookingServices() != null) {
            for (BookingService bs : bookingRequest.getBookingServices()) {
                resort_management.entity.Service service = serviceRepository.findById(bs.getService().getId())
                        .orElseThrow(() -> new Exception("Không tìm thấy dịch vụ ID: " + bs.getService().getId()));

                // Gán ngược booking vào bookingService
                bs.setBooking(bookingRequest);
                bs.setService(service);

                // Cộng tiền dịch vụ (Giá dịch vụ * Số lượng)
                totalAmount += service.getPrice() * bs.getQuantity();
            }
        }

        // 4. Lưu Booking (Hibernate sẽ tự động lưu BookingRooms và BookingServices do
        // cấu hình CascadeType.ALL)
        Booking savedBooking = bookingRepository.save(bookingRequest);
        // 3. LOGIC MỚI: Cập nhật trạng thái phòng
        if (savedBooking.getBookingRooms() != null) {
            for (BookingRoom br : savedBooking.getBookingRooms()) {
                // Lấy thực thể Room từ trong BookingRoom
                Room room = br.getRoom();

                // Đổi trạng thái sang "Đang ở" (hoặc "Đã đặt")
                room.setStatus("Đang ở");

                // Lưu lại trạng thái mới của phòng vào DB
                roomRepository.save(room);
            }
        }
        // 5. Tạo hóa đơn Payment với đúng tổng tiền đã tính toán
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalAmount);
        payment.setPaymentStatus("Chưa thanh toán");
        paymentRepository.save(payment);

        return savedBooking;
    }

    @Transactional
    public void deleteBooking(Long id) {
        // 1. Tìm đơn đặt phòng kèm theo danh sách phòng của nó
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt phòng với ID: " + id));

        // 2. Trả lại trạng thái "Trống" cho tất cả các phòng trong đơn này
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus("Trống");
                    roomRepository.save(room); // Cập nhật lại vào DB
                }
            }
        }

        // 3. Cuối cùng mới xóa đơn đặt phòng
        // Lưu ý: Nếu bị lỗi 500 ở đây, hãy xem hướng dẫn Cascade bên dưới
        bookingRepository.delete(booking);
    }

    @Transactional
    public void checkoutBooking(Long id) {
        // 1. Tìm đơn đặt phòng
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt phòng với ID: " + id));

        // 2. CHỐT CHẶN: Kiểm tra xem đã trả phòng chưa, tránh bấm 2 lần
        if ("Đã trả phòng".equalsIgnoreCase(booking.getStatus())
                || "Hoàn thành".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("❌ Đơn này đã được trả phòng từ trước rồi!");
        }

        // 3. Đổi trạng thái đơn đặt phòng thành "Đã trả phòng"
        booking.setStatus("Đã trả phòng");

        // 4. Trả lại tự do cho các căn phòng (Đổi về "Trống")
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus("Trống");
                    roomRepository.save(room);
                }
            }
        }

        // 5. Lưu lại thông tin đơn đã chốt sổ
        bookingRepository.save(booking);
    }
}