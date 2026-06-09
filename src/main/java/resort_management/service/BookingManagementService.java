package resort_management.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import resort_management.dto.response.BookingResponse;
import resort_management.entity.*;
import resort_management.enums.BookingStatus;
import resort_management.enums.PaymentMethod;
import resort_management.enums.PaymentStatus;
import resort_management.enums.RoomStatus;
import resort_management.enums.VipTier;
import resort_management.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

// Vừa là nhãn để phân loại service, vừa để class được gia nhập vào hệ thống quản lý tự động của Spring Boot
@Service
@RequiredArgsConstructor
public class BookingManagementService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final PaymentRepository paymentRepository;
    private final VipTierBenefitRepository vipTierBenefitRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public Booking createBooking(Booking bookingRequest, String paymentMethod) throws Exception {

        // 1. Kiểm tra ngày hợp lệ
        if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
            throw new Exception("Ngày check-out phải sau ngày check-in!");
        }

        long totalDays = ChronoUnit.DAYS.between(
                bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 2. Xử lý danh sách phòng
        if (bookingRequest.getBookingRooms() == null || bookingRequest.getBookingRooms().isEmpty()) {
            throw new Exception("Đơn đặt phòng phải có ít nhất 1 phòng!");
        }
        // Vòng for duyệt qua từng phòng trong bookingRequest.getBookingRooms()
        for (BookingRoom br : bookingRequest.getBookingRooms()) {
            Room room = roomRepository.findById(br.getRoom().getId())
                    .orElseThrow(() -> new Exception(
                            "Không tìm thấy phòng ID: " + br.getRoom().getId()));

            // Kiểm tra trùng lịch — loại trừ CANCELLED và CHECKED_OUT
            List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                    room.getId(),
                    bookingRequest.getCheckInDate(),
                    bookingRequest.getCheckOutDate(),
                    List.of(BookingStatus.CANCELLED, BookingStatus.CHECKED_OUT)); // ← sửa mới

            if (!overlaps.isEmpty()) {
                throw new Exception("Phòng " + room.getRoomNumber()
                        + " đã được đặt trong khoảng thời gian này!");
            }

            br.setBooking(bookingRequest);
            br.setRoom(room);
            BigDecimal pricePerNight = room.getRoomType().getPricePerNight();
            br.setPrice(pricePerNight);
            totalAmount = totalAmount.add(
                    pricePerNight.multiply(BigDecimal.valueOf(totalDays)));
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
                totalAmount = totalAmount.add(
                        service.getPrice().multiply(BigDecimal.valueOf(bs.getQuantity())));
            }
        }

        // 4. Lưu Booking
        Booking savedBooking = bookingRepository.save(bookingRequest);

        // 5. Đổi trạng thái phòng nếu check-in hôm nay
        LocalDate today = LocalDate.now();
        if (!bookingRequest.getCheckInDate().isAfter(today)) {
            for (BookingRoom br : savedBooking.getBookingRooms()) {
                Room room = br.getRoom();
                room.setStatus(RoomStatus.OCCUPIED);
                roomRepository.save(room);
            }
        }

        // 6. Tạo Payment
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalAmount);
        String normalized = paymentMethod == null ? "CASH" : paymentMethod.trim().toUpperCase();
        try {
            payment.setPaymentMethod(PaymentMethod.valueOf(normalized));
        } catch (IllegalArgumentException e) {
            throw new Exception("Phương thức thanh toán không hợp lệ. Chỉ chấp nhận CASH, CARD hoặc QR.");
        }
        payment.setPaymentStatus(PaymentStatus.PENDING);
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
                    room.setStatus(RoomStatus.AVAILABLE);
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

        // Tính lại tiền trước khi checkout
        recalculatePayment(booking);

        // Áp dụng giảm giá VIP ← thêm vào đây
        applyVipDiscount(booking);

        // Cập nhật totalSpent
        booking.setStatus(BookingStatus.CHECKED_OUT);
        // Trả phòng: set status về AVAILABLE
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.AVAILABLE);
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

        booking.setStatus(BookingStatus.CHECKED_IN);

        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                Room room = br.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.OCCUPIED);
                    roomRepository.save(room);
                }
            }
        }
        bookingRepository.save(booking);
    }

    @Transactional
    public BookingResponse addServiceToBooking(Long bookingId, Long serviceId, Integer quantity) {
        // check xem booking có tồn tại k, nếu k thì ném exception
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy booking ID: " + bookingId));
        // check trạng thái phải là checkin mới đc booking, nếu k thì ném exception
        if (booking.getStatus() != BookingStatus.CHECKED_IN)
            throw new RuntimeException(
                    "Chỉ có thể thêm dịch vụ cho booking đang CHECKED_IN!");
        // phải viết như này vì k thể import resort_management.entity.Service do trùng tên với import Service của Spring mà tk import kia buộc phải có do mình dùng @Service
        // check xem service có tồn tại k, nếu k thì ném exception
        resort_management.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy dịch vụ ID: " + serviceId));
        // check xem booking đã có dịch vụ này chưa, nếu có rồi thì cộng dồn số lượng, nếu chưa thì tạo mới
        // Vòng for duyệt danh sách các dịch vụ mà phòng này đã đặt
        // Nếu tìm thấy dịch vụ cùng ID thì cộng dồn số lượng (bs.getQuantity() + quantity) và đánh dấu đã tồn tại (existed = true) rồi break vòng for
        boolean existed = false;
        if (booking.getBookingServices() != null) {
            for (BookingService bs : booking.getBookingServices()) {
                if (bs.getService().getId().equals(serviceId)) {
                    bs.setQuantity(bs.getQuantity() + quantity);
                    existed = true;
                    break;
                }
            }
        }
        // Nếu sau khi duyệt xong mà không tìm thấy thì tạo mới 1 BookingService rồi add vào booking
        if (!existed) {
            BookingService bs = new BookingService();
            bs.setBooking(booking);
            bs.setService(service);
            bs.setQuantity(quantity);

            // Check VIP tier → miễn phí không?
            VipTier customerTier = booking.getCustomer().getVipTier();
            boolean isFree = vipTierBenefitRepository
                    .existsByVipTierAndServiceId(customerTier, serviceId);
            bs.setPriceOverride(isFree ? BigDecimal.ZERO : null);

            if (booking.getBookingServices() == null)
                booking.setBookingServices(new java.util.ArrayList<>());
            booking.getBookingServices().add(bs);
        }

        recalculatePayment(booking);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private void recalculatePayment(Booking booking) {
        // Đây là một công cụ cực mạnh của Java 8 giúp tính toán khoảng cách giữa hai mốc thời gian theo đơn vị là Ngày
        // Nó lấy ngày Check-out trừ ngày Check-in để ra tổng số đêm khách ở lại khách sạn (totalDays).
        long totalDays = ChronoUnit.DAYS.between(
                booking.getCheckInDate(), booking.getCheckOutDate());

        BigDecimal total = BigDecimal.ZERO;
        // Tiền phòng
        if (booking.getBookingRooms() != null) {
            for (BookingRoom br : booking.getBookingRooms()) {
                total = total.add(
                        br.getPrice().multiply(BigDecimal.valueOf(totalDays)));
            }
        }

        // Tiền dịch vụ
        if (booking.getBookingServices() != null) {
            for (BookingService bs : booking.getBookingServices()) {
                BigDecimal unitPrice = bs.getPriceOverride() != null
                        ? bs.getPriceOverride() // VIP override (0 = miễn phí)
                        : bs.getService().getPrice(); // Giá gốc
                total = total.add(
                        unitPrice.multiply(BigDecimal.valueOf(bs.getQuantity())));
            }
        }

        if (booking.getPayment() != null) {
            booking.getPayment().setAmount(total);
            paymentRepository.save(booking.getPayment());
        }
    }

    public void updateCustomerVipTier(Booking booking) {
        Payment payment = booking.getPayment();
        if (payment == null || payment.getPaymentStatus() != PaymentStatus.PAID)
            return;

        Customer customer = booking.getCustomer();
        if (customer == null)
            return;

        // Cộng tiền vào tổng chi tiêu
        BigDecimal newTotalSpent = customer.getTotalSpent().add(payment.getAmount());
        customer.setTotalSpent(newTotalSpent);

        // Tính lại VIP tier — duyệt từ cao xuống thấp, lấy tier phù hợp nhất
        VipTier newTier = VipTier.VIP_0;
        for (VipTier tier : VipTier.values()) {
            if (newTotalSpent.compareTo(tier.getMinSpent()) >= 0) {
                newTier = tier;
            }
        }
        customer.setVipTier(newTier);
        customerRepository.save(customer);
    }

    private void applyVipDiscount(Booking booking) {
        Payment payment = booking.getPayment();
        if (payment == null)
            return;

        VipTier tier = booking.getCustomer().getVipTier();
        int discountPercent = tier.getDiscountPercent();
        if (discountPercent == 0)
            return;

        // Tính số tiền giảm
        BigDecimal discountAmount = payment.getAmount()
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

        payment.setDiscountAmount(discountAmount);
        payment.setAmount(payment.getAmount().subtract(discountAmount));
        paymentRepository.save(payment);
    }
}