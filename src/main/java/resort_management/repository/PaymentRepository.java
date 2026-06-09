package resort_management.repository;

import resort_management.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

       Optional<Payment> findByBookingId(Long bookingId);

       // 🔥 ĐÃ THÊM: Ghi đè hàm findAll mặc định để tối ưu hóa trang quản lý Thanh Toán toàn cục
       @Override
       @EntityGraph(attributePaths = {"booking", "booking.customer"})
       Page<Payment> findAll(Pageable pageable);

       // 🔥 ĐÃ SỬA: Ép hàm lấy danh sách PENDING gom hóa đơn + thông tin khách hàng vào 1 câu SQL duy nhất
       @EntityGraph(attributePaths = {"booking", "booking.customer"})
       @Query("SELECT p FROM Payment p WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PENDING ORDER BY p.createdAt DESC")
       Page<Payment> findAllPending(Pageable pageable);

       // Các hàm thống kê doanh thu (Chỉ bốc số, không bốc object nên KHÔNG BỊ LAG, giữ nguyên)
       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m-%d') as period, " +
               "SUM(p.amount) as revenue " +
               "FROM Payment p " +
               "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
               "AND p.paymentDate IS NOT NULL " +
               "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m-%d') " +
               "ORDER BY period ASC")
       List<Object[]> getRevenueByDay();

       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') as period, " +
               "SUM(p.amount) as revenue " +
               "FROM Payment p " +
               "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
               "AND p.paymentDate IS NOT NULL " +
               "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') " +
               "ORDER BY period ASC")
       List<Object[]> getRevenueByMonth();

       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y') as period, " +
               "SUM(p.amount) as revenue " +
               "FROM Payment p " +
               "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
               "AND p.paymentDate IS NOT NULL " +
               "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y') " +
               "ORDER BY period ASC")
       List<Object[]> getRevenueByYear();

       @Query("SELECT SUM(p.amount) FROM Payment p " +
               "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID")
       java.math.BigDecimal getTotalRevenue();

       @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PENDING")
       long countPending();

       @Query("SELECT SUM(p.amount) FROM Payment p " +
               "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
               "AND FUNCTION('DATE', p.paymentDate) = FUNCTION('CURDATE')")
       java.math.BigDecimal getRevenueToday();
}