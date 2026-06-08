"use client";

import { Customer } from "@/types/customer";
import { useLang } from "@/contexts/LangContext";

interface Props {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export default function CustomerTable({
  customers,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useLang();

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left">
              {t?.customers?.tableHeaders?.fullName || "Họ tên"}
            </th>
            <th className="px-4 py-3 text-left">
              {t?.customers?.tableHeaders?.phone || "Số điện thoại"}
            </th>
            <th className="px-4 py-3 text-left">
              {t?.customers?.tableHeaders?.email || "Email"}
            </th>
            <th className="px-4 py-3 text-left">VIP</th>
            <th className="px-4 py-3 text-left">
              {t?.customers?.tableHeaders?.actions || "Thao tác"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                {t?.customers?.loading || "Đang tải..."}
              </td>
            </tr>
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                {t?.customers?.empty ||
                  "Không tìm thấy khách hàng nào phù hợp."}
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                <td className="px-4 py-3">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3">{customer.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      customer.vipTier === "VIP_5"
                        ? "bg-purple-100 text-purple-700"
                        : customer.vipTier === "VIP_4"
                          ? "bg-blue-100 text-blue-700"
                          : customer.vipTier === "VIP_3"
                            ? "bg-green-100 text-green-700"
                            : customer.vipTier === "VIP_2"
                              ? "bg-yellow-100 text-yellow-700"
                              : customer.vipTier === "VIP_1"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {customer.vipTier ?? "VIP_0"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50 text-zinc-700"
                    >
                      {t?.customers?.actionButtons?.edit || "Sửa"}
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      {t?.customers?.actionButtons?.delete || "Xóa"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
