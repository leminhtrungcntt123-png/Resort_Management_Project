"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Payment, PaymentPageData, RevenueItem } from "@/types/payment";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentPagination from "@/components/payments/PaymentPagination";
import RevenueChart from "@/components/payments/RevenueChart";
import PendingPaymentsModal from "@/components/payments/PendingPaymentsModal";
import { exportToTxt, exportToExcel } from "@/components/export";

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // Trạng thái khi đang tải dữ liệu xuất file
  const [refresh, setRefresh] = useState(0);
  const [period, setPeriod] = useState("month");
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);

  // --- Thêm mới ---
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Fetch payments
  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const res = await api.get(`/api/payments?page=${page}&size=10`);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi fetch payments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [page, refresh]);

  // Fetch revenue
  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await api.get(`/api/payments/revenue?period=${period}`);
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setRevenue(list);
      } catch (err) {
        console.error("Lỗi fetch revenue:", err);
      }
    }
    fetchRevenue();
  }, [period, refresh]);

  // --- Thêm mới: fetch pending count ---
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await api.get("/api/payments/pending/count");
        setPendingCount(res.data ?? 0);
      } catch (err) {
        console.error("Lỗi fetch pending count:", err);
      }
    }
    fetchPendingCount();
  }, [refresh]);

  // HÀM XỬ LÝ XUẤT FILE TXT (LẤY TOÀN BỘ)
  const handleExportTxt = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/payments?page=0&size=9999`);
      const allPayments: Payment[] = res.data?.content ?? [];

      if (allPayments.length === 0) {
        alert("Không có dữ liệu hóa đơn nào để xuất!");
        return;
      }

      const txtData = allPayments.map((p) => ({
        "Mã Hóa Đơn": p.id,
        "Mã Đặt Phòng": p.bookingId || p.booking?.id || "N/A",
        "Số Tiền": `${p.amount?.toLocaleString("vi-VN")}đ`,
        "Phương Thức": p.paymentMethod ?? "N/A",
        "Trạng Thái": p.paymentStatus ?? "PENDING",
        "Ngày Thanh Toán": p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("vi-VN") : "Chưa thanh toán",
      }));

      exportToTxt(txtData, "Danh sách hóa đơn thanh toán", "tat-ca-hoa-don");
    } catch (err) {
      console.error("Lỗi khi xuất file TXT:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu hóa đơn!");
    } finally {
      setExporting(false);
    }
  };

  // HÀM XỬ LÝ XUẤT FILE EXCEL (LẤY TOÀN BỘ)
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/payments?page=0&size=9999`);
      const allPayments: Payment[] = res.data?.content ?? [];

      if (allPayments.length === 0) {
        alert("Không có dữ liệu hóa đơn nào để xuất!");
        return;
      }

      const excelData = allPayments.map((p, index) => ({
        "STT": index + 1,
        "Mã Hóa Đơn": p.id,
        "Mã Đặt Phòng": p.bookingId || p.booking?.id || "N/A",
        "Khách Hàng": p.booking?.customer?.fullName || "N/A",
        "Số Tiền (VND)": p.amount ?? 0,
        "Phương Thức TT": p.paymentMethod ?? "N/A",
        "Trạng Thái TT": p.paymentStatus ?? "PENDING",
        "Ngày Thanh Toán": p.paymentDate ? new Date(p.paymentDate).toLocaleString("vi-VN") : "Chưa thanh toán",
      }));

      exportToExcel(excelData, "Hóa Đơn", "bao-cao-doanh-thu-excel");
    } catch (err) {
      console.error("Lỗi khi xuất file Excel:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu hóa đơn!");
    } finally {
      setExporting(false);
    }
  };

  async function handleMarkPaid(id: number) {
    try {
      await api.patch(`/api/payments/${id}/pay`);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi mark paid:", err);
    }
  }

  const totalRevenue = revenue.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Quản lý Thanh toán
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tổng: {data?.totalElements ?? "..."} hóa đơn
          </p>
        </div>

        {/* Khối nút bấm Xuất File */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTxt}
            disabled={loading || exporting}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Đang xuất..." : "Xuất TXT"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || exporting}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tổng hóa đơn</p>
          <p className="mt-2 text-2xl font-semibold">
            {data?.totalElements ?? "..."}
          </p>
        </div>

        <button
          onClick={() => setShowPendingModal(true)}
          className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-left
                     transition hover:border-yellow-400 hover:bg-yellow-100 cursor-pointer"
        >
          <p className="text-sm text-zinc-500">Chưa thanh toán</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold text-yellow-600">
              {pendingCount}
            </p>
            <span className="text-xs text-yellow-600 underline">
              Xem tất cả →
            </span>
          </div>
        </button>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Doanh thu kỳ này</p>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            {totalRevenue.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenue} period={period} onPeriodChange={setPeriod} />

      {/* Bảng */}
      <PaymentTable
        payments={data?.content ?? []}
        loading={loading}
        onMarkPaid={handleMarkPaid}
        onDeleted={() => setRefresh((r) => r + 1)}
        onUpdated={() => setRefresh((r) => r + 1)}
      />

      {/* Pagination */}
      {data && (
        <PaymentPagination
          page={data.page}
          totalPages={data.totalPages}
          last={data.last}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {/* --- Modal Pending --- */}
      {showPendingModal && (
        <PendingPaymentsModal
          onClose={() => setShowPendingModal(false)}
          onConfirmed={() => {
            setShowPendingModal(false);
            setRefresh((r) => r + 1);
          }}
        />
      )}
    </main>
  );
}