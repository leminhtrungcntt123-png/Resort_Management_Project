"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Service } from "@/types/service";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";

export default function ServicesPage() {
  const { canEdit, isAdmin } = useAuth();
  const { t } = useLang();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const res = await api.get("/api/services");
        setServices(res.data ?? []);
      } catch (err) {
        console.error("Lỗi fetch services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [refresh]);

  function openCreate() {
    setEditService(null);
    setName("");
    setPrice("");
    setError("");
    setShowModal(true);
  }

  function openEdit(svc: Service) {
    setEditService(svc);
    setName(svc.serviceName);
    setPrice(svc.price.toString());
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!name.trim() || !price) {
      setError(
        t?.services?.modal?.errorRequired || "Vui lòng điền đầy đủ thông tin!",
      );
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError(t?.services?.modal?.errorPrice || "Giá phải là số dương!");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editService) {
        await api.put(`/api/services/${editService.id}`, {
          serviceName: name.trim(),
          price: Number(price),
        });
      } else {
        await api.post("/api/services", {
          serviceName: name.trim(),
          price: Number(price),
        });
      }
      setShowModal(false);
      setRefresh((r) => r + 1);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    // Confirm delete
    if (
      !confirm(
        (t?.services?.confirmDelete || 'Xóa dịch vụ "{name}"?').replace(
          "{name}",
          name,
        ),
      )
    )
      return;
    try {
      await api.delete(`/api/services/${id}`);
      setRefresh((r) => r + 1);
    } catch (err: any) {
      // Alert delete error
      alert(
        err.message || t?.services?.deleteError || "Không thể xóa dịch vụ!",
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Quản lý Dịch vụ
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tổng: {services.length} dịch vụ
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm
                                   font-medium text-white hover:bg-zinc-700 transition"
          >
            + Thêm dịch vụ
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Tên dịch vụ</th>
              <th className="px-4 py-3 text-left">Giá</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              {canEdit && <th className="px-4 py-3 text-left">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Đang tải...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Chưa có dịch vụ nào
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr key={svc.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-400">#{svc.id}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {svc.serviceName}
                  </td>
                  <td className="px-4 py-3 text-green-700 font-medium">
                    {svc.price.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(svc.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(svc)}
                          className="rounded-lg border border-zinc-200 px-3 py-1
                                                           text-xs text-zinc-700 hover:bg-zinc-50 transition"
                        >
                          Sửa
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDelete(svc.id, svc.serviceName)
                            }
                            className="rounded-lg border border-red-200 px-3 py-1
                                                               text-xs text-red-600 hover:bg-red-50 transition"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Massage thư giãn"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200
                                               px-3 py-2 text-sm focus:outline-none
                                               focus:ring-2 focus:ring-zinc-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 500000"
                  min={1}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200
                                               px-3 py-2 text-sm focus:outline-none
                                               focus:ring-2 focus:ring-zinc-300"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5
                                           text-sm text-zinc-600 hover:bg-zinc-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm
                                           font-medium text-white hover:bg-zinc-700
                                           disabled:opacity-40 transition"
              >
                {saving ? "Đang lưu..." : editService ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
