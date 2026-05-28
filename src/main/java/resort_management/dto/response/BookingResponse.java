package resort_management.dto.response;

import lombok.*;
import resort_management.entity.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
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
    private CustomerInfo customer;
    private List<BookingRoomInfo> rooms;
    private List<BookingServiceInfo> services;
    private PaymentInfo payment;

    public static BookingResponse from(Booking booking) {
        BookingResponse dto = new BookingResponse();
        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        // Enum → String để frontend dễ đọc
        dto.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
        dto.setCreatedAt(booking.getCreatedAt());

        if (booking.getCustomer() != null) {
            Customer c = booking.getCustomer();
            dto.setCustomer(new CustomerInfo(
                    c.getId(), c.getFullName(), c.getPhone(), c.getEmail()));
        }

        if (booking.getBookingRooms() != null) {
            dto.setRooms(booking.getBookingRooms().stream().map(br -> new BookingRoomInfo(
                    br.getRoom() != null ? br.getRoom().getId() : null,
                    br.getRoom() != null ? br.getRoom().getRoomNumber() : null,
                    br.getRoom() != null ? br.getRoom().getFloorNumber() : null,
                    (br.getRoom() != null && br.getRoom().getRoomType() != null)
                            ? br.getRoom().getRoomType().getTypeName()
                            : null,
                    br.getPrice() // BigDecimal
            )).collect(Collectors.toList()));
        } else {
            dto.setRooms(Collections.emptyList());
        }

        if (booking.getBookingServices() != null) {
            dto.setServices(booking.getBookingServices().stream().map(bs -> {
                BigDecimal unitPrice = bs.getService() != null
                        ? bs.getService().getPrice()
                        : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(
                        BigDecimal.valueOf(bs.getQuantity()));
                return new BookingServiceInfo(
                        bs.getService() != null ? bs.getService().getId() : null,
                        bs.getService() != null ? bs.getService().getServiceName() : null,
                        unitPrice,
                        bs.getQuantity(),
                        subtotal);
            }).collect(Collectors.toList()));
        } else {
            dto.setServices(Collections.emptyList());
        }

        if (booking.getPayment() != null) {
            Payment p = booking.getPayment();
            dto.setPayment(new PaymentInfo(
                    p.getId(),
                    p.getAmount(), // BigDecimal
                    p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null,
                    p.getPaymentStatus() != null ? p.getPaymentStatus().name() : null,
                    p.getPaymentDate()));
        }

        return dto;
    }

    @Data
    @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String phone;
        private String email;
    }

    @Data
    @AllArgsConstructor
    public static class BookingRoomInfo {
        private Long roomId;
        private String roomNumber;
        private Integer floorNumber;
        private String roomTypeName;
        private BigDecimal priceSnapshot; 
    }

    @Data
    @AllArgsConstructor
    public static class BookingServiceInfo {
        private Long serviceId;
        private String serviceName;
        private BigDecimal unitPrice; 
        private Integer quantity;
        private BigDecimal subtotal; 
    }

    @Data
    @AllArgsConstructor
    public static class PaymentInfo {
        private Long id;
        private BigDecimal amount; 
        private String paymentMethod;
        private String paymentStatus;
        private LocalDateTime paymentDate;
    }
}