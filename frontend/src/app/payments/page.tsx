"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Payment, PaymentPageData, RevenueItem } from "@/types/payment";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentPagination from "@/components/payments/PaymentPagination";
import RevenueChart from "@/components/payments/RevenueChart";

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [period, setPeriod] = useState("month");
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);

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
  }, [period,refresh]);

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
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Quản lý Thanh toán
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Tổng: {data?.totalElements ?? "..."} hóa đơn
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tổng hóa đơn</p>
          <p className="mt-2 text-2xl font-semibold">
            {data?.totalElements ?? "..."}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Chưa thanh toán</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-600">
            {data?.content.filter((p) => p.paymentStatus === "PENDING")
              .length ?? "..."}
          </p>
        </div>
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
    </main>
  );
}
