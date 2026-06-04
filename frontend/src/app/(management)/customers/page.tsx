"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Customer, CustomerPageData, CustomerForm } from "@/types/customer";
import CustomerTable from "@/components/customers/CustomerTable";
import CustomerModal from "@/components/customers/CustomerModal";
import CustomerPagination from "@/components/customers/CustomerPagination";
import { exportToTxt, exportToExcel } from "@/components/export";

const DEFAULT_FORM: CustomerForm = {
  fullName: "",
  phone: "",
  email: "",
};

export default function CustomersPage() {
  const [data, setData] = useState<CustomerPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // Trạng thái riêng khi đang xuất file
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerForm>(DEFAULT_FORM);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        const url = search
          ? `/api/customers/search?name=${encodeURIComponent(search)}`
          : `/api/customers?page=${page}&size=10&sortBy=fullName&direction=asc`;
        const res = await api.get(url);
        console.log("search res:", JSON.stringify(res));
        if (search) {
          const list = res.data ?? [];
          setData({
            content: list,
            page: 0,
            totalPages: 1,
            totalElements: list.length,
            last: true,
          });
        } else {
          setData(res.data);
        }
      } catch (err) {
        console.error("Lỗi fetch customers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [page, search, refresh]);

  // HÀM XỬ LÝ XUẤT FILE TXT (LẤY TOÀN BỘ)
  const handleExportTxt = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/customers?page=0&size=9999&sortBy=fullName&direction=asc`);
      const allCustomers: Customer[] = res.data?.content ?? [];

      if (allCustomers.length === 0) {
        alert("Không có dữ liệu khách hàng nào để xuất!");
        return;
      }

      const txtData = allCustomers.map((c) => ({
        "Mã KH": c.id,
        "Họ và Tên": c.fullName,
        "Số điện thoại": c.phone ?? "N/A",
        "Email": c.email ?? "N/A",
      }));

      exportToTxt(txtData, "Danh sách toàn bộ khách hàng", "danh-sach-khach-hang");
    } catch (err) {
      console.error("Lỗi khi xuất file TXT:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setExporting(false);
    }
  };

  // HÀM XỬ LÝ XUẤT FILE EXCEL (LẤY TOÀN BỘ)
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/customers?page=0&size=9999&sortBy=fullName&direction=asc`);
      const allCustomers: Customer[] = res.data?.content ?? [];

      if (allCustomers.length === 0) {
        alert("Không có dữ liệu khách hàng nào để xuất!");
        return;
      }

      const excelData = allCustomers.map((c, index) => ({
        "STT": index + 1,
        "Mã Khách Hàng": c.id,
        "Họ và Tên": c.fullName,
        "Số Điện Thoại": c.phone ?? "N/A",
        "Email": c.email ?? "N/A",
      }));

      exportToExcel(excelData, "Khách Hàng", "tat-ca-khach-hang-excel");
    } catch (err) {
      console.error("Lỗi khi xuất file Excel:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setExporting(false);
    }
  };

  async function handleCreate() {
    if (!form.fullName) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/customers", form);
      setShowModal(false);
      setForm(DEFAULT_FORM);
      setRefresh((r) => r + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editCustomer || !form.fullName) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/customers/${editCustomer.id}`, form);
      setEditCustomer(null);
      setForm(DEFAULT_FORM);
      setRefresh((r) => r + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/customers/${deleteId}`);
      setDeleteId(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi xóa khách hàng:", err);
    }
  }

  function handleEditClick(customer: Customer) {
    setEditCustomer(customer);
    setForm({
      fullName: customer.fullName,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
    });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Quản lý Khách hàng
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tổng: {data?.totalElements ?? "..."} khách hàng
          </p>
        </div>

        {/* Nhóm nút chức năng bên phải */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTxt}
            disabled={loading || exporting}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {exporting ? "Đang xử lý..." : "Xuất TXT"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || exporting}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {exporting ? "Đang xử lý..." : "Xuất Excel"}
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setForm(DEFAULT_FORM);
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            + Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Modal Thêm */}
      {showModal && (
        <CustomerModal
          mode="create"
          form={form}
          saving={saving}
          errorMessage={error}
          onChange={setForm}
          onSubmit={handleCreate}
          onClose={() => {
            setShowModal(false);
            setError("");
          }}
        />
      )}

      {/* Modal Sửa */}
      {editCustomer && (
        <CustomerModal
          mode="edit"
          form={form}
          saving={saving}
          editName={editCustomer.fullName}
          errorMessage={error}
          onChange={setForm}
          onSubmit={handleUpdate}
          onClose={() => {
            setEditCustomer(null);
            setError("");
          }}
        />
      )}

      {/* Confirm Xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">
              Xác nhận xóa
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Bạn có chắc muốn xóa khách hàng này không?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(searchInput);
              setPage(0);
            }
          }}
          placeholder="Tìm theo tên..."
          className="rounded-lg border border-zinc-200 px-3 py-1 text-sm outline-none focus:border-zinc-400 w-64"
        />
        <button
          onClick={() => {
            setSearch(searchInput);
            setPage(0);
          }}
          className="rounded-lg bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700"
        >
          Tìm
        </button>
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(0);
            }}
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-50"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>

      {/* Bảng */}
      <CustomerTable
        customers={data?.content ?? []}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Pagination */}
      {data && (
        <CustomerPagination
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