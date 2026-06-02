package resort_management.repository;

import resort_management.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

       Optional<Payment> findByBookingId(Long bookingId);

       // Doanh thu theo ngày
       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m-%d') as period, " +
                     "SUM(p.amount) as revenue " +
                     "FROM Payment p " +
                     "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
                     "AND p.paymentDate IS NOT NULL " +
                     "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m-%d') " +
                     "ORDER BY period ASC")
       List<Object[]> getRevenueByDay();

       // Doanh thu theo tháng
       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') as period, " +
                     "SUM(p.amount) as revenue " +
                     "FROM Payment p " +
                     "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
                     "AND p.paymentDate IS NOT NULL " +
                     "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') " +
                     "ORDER BY period ASC")
       List<Object[]> getRevenueByMonth();

       // Doanh thu theo năm
       @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y') as period, " +
                     "SUM(p.amount) as revenue " +
                     "FROM Payment p " +
                     "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID " +
                     "AND p.paymentDate IS NOT NULL " +
                     "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y') " +
                     "ORDER BY period ASC")
       List<Object[]> getRevenueByYear();

       // Tổng doanh thu
       @Query("SELECT SUM(p.amount) FROM Payment p " +
                     "WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PAID")
       java.math.BigDecimal getTotalRevenue();

       // Đếm số lượng PENDING
       @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PENDING")
       long countPending();

       // Lấy danh sách PENDING (dùng Pageable)
       @Query("SELECT p FROM Payment p WHERE p.paymentStatus = resort_management.enums.PaymentStatus.PENDING ORDER BY p.createdAt DESC")
       org.springframework.data.domain.Page<Payment> findAllPending(org.springframework.data.domain.Pageable pageable);
}