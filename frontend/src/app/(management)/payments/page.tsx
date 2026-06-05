"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Payment, PaymentPageData, RevenueItem } from "@/types/payment";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentPagination from "@/components/payments/PaymentPagination";
import RevenueChart from "@/components/payments/RevenueChart";
import PendingPaymentsModal from "@/components/payments/PendingPaymentsModal";
import { exportToTxt, exportToExcel } from "@/components/export";
import { useLang } from "@/contexts/LangContext";

export default function PaymentsPage() {
  const { t, lang } = useLang();

  const [data, setData] = useState<PaymentPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [period, setPeriod] = useState("month");
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);

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

  // Fetch pending count
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

  // HÀM XỬ LÝ XUẤT FILE TXT
  const handleExportTxt = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/payments?page=0&size=9999`);
      const allPayments: Payment[] = res.data?.content ?? [];

      if (allPayments.length === 0) {
        alert(t?.payments?.alertNoData || "Không có dữ liệu hóa đơn nào để xuất!");
        return;
      }

      const fields = t?.payments?.exportFields;
      const notPaidText = t?.payments?.notPaidYet || "Chưa thanh toán";

      const txtData = allPayments.map((p) => ({
        [fields?.billId || "Mã Hóa Đơn"]: p.id,
        [fields?.bookingId || "Mã Đặt Phòng"]: p.bookingId || p.booking?.id || "N/A",
        [fields?.amount || "Số Tiền"]: lang === "en"
          ? `${p.amount?.toLocaleString("en-US")} VND`
          : `${p.amount?.toLocaleString("vi-VN")}đ`,
        [fields?.method || "Phương Thức"]: p.paymentMethod ?? "N/A",
        [fields?.status || "Trạng Thái"]: p.paymentStatus ?? "PENDING",
        [fields?.date || "Ngày Thanh Toán"]: p.paymentDate
          ? new Date(p.paymentDate).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN")
          : notPaidText,
      }));

      exportToTxt(
        txtData,
        t?.payments?.txtFileName || "Danh sách hóa đơn thanh toán",
        t?.payments?.txtFileTitle || "tat-ca-hoa-don"
      );
    } catch (err) {
      console.error("Lỗi khi xuất file TXT:", err);
      alert(t?.payments?.alertError || "Có lỗi xảy ra khi tải dữ liệu hóa đơn!");
    } finally {
      setExporting(false);
    }
  };

  // HÀM XỬ LÝ XUẤT FILE EXCEL
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/payments?page=0&size=9999`);
      const allPayments: Payment[] = res.data?.content ?? [];

      if (allPayments.length === 0) {
        alert(t?.payments?.alertNoData || "Không có dữ liệu hóa đơn nào để xuất!");
        return;
      }

      const fields = t?.payments?.exportFields;
      const notPaidText = t?.payments?.notPaidYet || "Chưa thanh toán";

      const excelData = allPayments.map((p, index) => ({
        [fields?.stt || "STT"]: index + 1,
        [fields?.billId || "Mã Hóa Đơn"]: p.id,
        [fields?.bookingId || "Mã Đặt Phòng"]: p.bookingId || p.booking?.id || "N/A",
        [fields?.customer || "Khách Hàng"]: p.booking?.customer?.fullName || "N/A",
        [fields?.amountVnd || "Số Tiền (VND)"]: p.amount ?? 0,
        [fields?.methodExcel || "Phương Thức TT"]: p.paymentMethod ?? "N/A",
        [fields?.statusExcel || "Trạng Thái TT"]: p.paymentStatus ?? "PENDING",
        [fields?.date || "Ngày Thanh Toán"]: p.paymentDate
          ? new Date(p.paymentDate).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN")
          : notPaidText,
      }));

      exportToExcel(
        excelData,
        t?.payments?.excelSheetName || "Hóa Đơn",
        t?.payments?.excelFileName || "bao-cao-doanh-thu-excel"
      );
    } catch (err) {
      console.error("Lỗi khi xuất file Excel:", err);
      alert(t?.payments?.alertError || "Có lỗi xảy ra khi tải dữ liệu hóa đơn!");
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
            {t?.payments?.title || "Quản lý Thanh toán"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t?.payments?.totalPrefix || "Tổng:"} {data?.totalElements ?? "..."} {t?.payments?.totalSuffix || "hóa đơn"}
          </p>
        </div>

        {/* Khối nút bấm Xuất File */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTxt}
            disabled={loading || exporting}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {exporting ? (t?.payments?.statusProcessing || "Đang xuất...") : (t?.payments?.btnExportTxt || "Xuất TXT")}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || exporting}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {exporting ? (t?.payments?.statusProcessing || "Đang xuất...") : (t?.payments?.btnExportExcel || "Xuất Excel")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">{t?.payments?.statsTotal || "Tổng hóa đơn"}</p>
          <p className="mt-2 text-2xl font-semibold">
            {data?.totalElements ?? "..."}
          </p>
        </div>

        <button
          onClick={() => setShowPendingModal(true)}
          className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-left
                     transition hover:border-yellow-400 hover:bg-yellow-100 cursor-pointer w-full"
        >
          <p className="text-sm text-zinc-500">{t?.payments?.statsPending || "Chưa thanh toán"}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold text-yellow-600">
              {pendingCount}
            </p>
            <span className="text-xs text-yellow-600 underline">
              {t?.payments?.statsPendingViewAll || "Xem tất cả →"}
            </span>
          </div>
        </button>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">{t?.payments?.statsRevenue || "Doanh thu kỳ này"}</p>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            {lang === "en" ? `${totalRevenue.toLocaleString("en-US")} VND` : `${totalRevenue.toLocaleString("vi-VN")}đ`}
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