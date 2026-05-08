package resort_management.dto.response;

import lombok.*;
import resort_management.entity.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String status;
    private LocalDateTime createdAt;

    // Thông tin khách hàng tóm tắt
    private CustomerInfo customer;

    // Danh sách phòng đã đặt
    private List<BookingRoomInfo> rooms;

    // Danh sách dịch vụ kèm theo
    private List<BookingServiceInfo> services;

    // Thông tin thanh toán
    private PaymentInfo payment;

    public static BookingResponse from(Booking booking) {
        BookingResponse dto = new BookingResponse();
        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());

        // Map customer
        if (booking.getCustomer() != null) {
            Customer c = booking.getCustomer();
            dto.setCustomer(new CustomerInfo(c.getId(), c.getFullName(), c.getPhone(), c.getEmail()));
        }

        // Map rooms
        if (booking.getBookingRooms() != null) {
            dto.setRooms(booking.getBookingRooms().stream().map(br ->
                    new BookingRoomInfo(
                            br.getRoom().getId(),
                            br.getRoom().getRoomNumber(),
                            br.getRoom().getFloorNumber(),
                            br.getRoom().getRoomType() != null ? br.getRoom().getRoomType().getTypeName() : null,
                            br.getPrice()
                    )
            ).collect(Collectors.toList()));
        }

        // Map services
        if (booking.getBookingServices() != null) {
            dto.setServices(booking.getBookingServices().stream().map(bs ->
                    new BookingServiceInfo(
                            bs.getService().getId(),
                            bs.getService().getServiceName(),
                            bs.getService().getPrice(),
                            bs.getQuantity(),
                            bs.getService().getPrice() * bs.getQuantity()
                    )
            ).collect(Collectors.toList()));
        }

        // Map payment
        if (booking.getPayment() != null) {
            Payment p = booking.getPayment();
            dto.setPayment(new PaymentInfo(
                    p.getId(), p.getAmount(), p.getPaymentMethod(),
                    p.getPaymentStatus(), p.getPaymentDate()
            ));
        }

        return dto;
    }

    @Data @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String phone;
        private String email;
    }

    @Data @AllArgsConstructor
    public static class BookingRoomInfo {
        private Long roomId;
        private String roomNumber;
        private Integer floorNumber;
        private String roomTypeName;
        private Double priceSnapshot; // Giá tại thời điểm đặt
    }

    @Data @AllArgsConstructor
    public static class BookingServiceInfo {
        private Long serviceId;
        private String serviceName;
        private Double unitPrice;
        private Integer quantity;
        private Double subtotal;
    }

    @Data @AllArgsConstructor
    public static class PaymentInfo {
        private Long id;
        private Double amount;
        private String paymentMethod;
        private String paymentStatus;
        private LocalDateTime paymentDate;
    }
}