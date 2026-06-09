"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Room, PageData, RoomType, RoomForm } from "@/types/room";
import RoomFilter from "@/components/rooms/RoomFilter";
import RoomTable from "@/components/rooms/RoomTable";
import RoomModal from "@/components/rooms/RoomModal";
import RoomPagination from "@/components/rooms/RoomPagination";
import { exportToTxt, exportToExcel } from "@/components/export";
import { useLang } from "@/contexts/LangContext";

const DEFAULT_FORM: RoomForm = {
  roomNumber: "",
  floorNumber: 1,
  status: "AVAILABLE",
  roomTypeId: 0,
};

export default function RoomsPage() {
  const { t } = useLang();
  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("ALL");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RoomForm>(DEFAULT_FORM);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string>("");
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [floor, setFloor] = useState<number | null>(null);
  const [floors, setFloors] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("roomNumber");
  const [direction, setDirection] = useState("asc");

  // Guest modal
  const [guestModal, setGuestModal] = useState<{
    room: Room;
    booking: { id: number; customerName: string; checkOutDate: string } | null;
    loading: boolean;
  } | null>(null);

  async function handleViewGuest(room: Room) {
    setGuestModal({ room, booking: null, loading: true });
    try {
      const res = await api.get(`/api/bookings/status/CHECKED_IN?page=0&size=9999`);
      const bookings = res.data?.content ?? [];
      console.log("=== DEBUG bookings ===", JSON.stringify(bookings, null, 2)); // ← thêm dòng này
      const matched = bookings.find((b: any) =>
          b.rooms?.some((br: any) => br.roomId === room.id)
      );
      if (matched) {
        setGuestModal({
          room,
          booking: {
            id: matched.id,
            customerName: matched.customer?.fullName ?? "N/A",
            checkOutDate: matched.checkOutDate ?? "N/A",
          },
          loading: false,
        });
      } else {
        setGuestModal({ room, booking: null, loading: false });
      }
    } catch (err) {
      console.error("Lỗi fetch booking:", err);
      setGuestModal({ room, booking: null, loading: false });
    }
  }
  // Fetch rooms
  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        let url = "";

        if (floor !== null && status !== "ALL") {
          // Kết hợp cả tầng + trạng thái
          url = `/api/rooms/floor/${floor}?page=${page}&size=10&sortBy=roomNumber&direction=asc&status=${status}`;
        } else if (floor !== null) {
          // Chỉ lọc theo tầng
          url = `/api/rooms/floor/${floor}?page=${page}&size=10&sortBy=roomNumber&direction=asc`;
        } else if (status !== "ALL") {
          // Chỉ lọc theo trạng thái
          url = `/api/rooms/status/${status}?page=${page}&size=10&sortBy=roomNumber&direction=asc`;
        } else {
          // Tất cả
          url = `/api/rooms?page=${page}&size=10&sortBy=${sortBy}&direction=${direction}`;
        }

        const res = await api.get(url);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [page, status, floor, refresh, sortBy, direction]);

  // Fetch room types
  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        const res = await api.get("/api/room-types");
        setRoomTypes(Array.isArray(res) ? res : (res.data ?? res));
      } catch (err) {
        console.error("Lỗi fetch room types:", err);
      }
    }
    fetchRoomTypes();
  }, []);

  // Fetch floors
  useEffect(() => {
    async function fetchFloors() {
      try {
        const res = await api.get("/api/rooms/floors");
        setFloors(res.data ?? res);
      } catch (err) {
        console.error("Lỗi fetch floors:", err);
      }
    }
    fetchFloors();
  }, []);

  // Xuất TXT
  const handleExportTxt = async () => {
    setExporting(true);
    try {
      let url = "";
      if (floor !== null && status !== "ALL") {
        url = `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc&status=${status}`;
      } else if (floor !== null) {
        url = `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc`;
      } else if (status !== "ALL") {
        url = `/api/rooms/status/${status}?page=0&size=9999&sortBy=roomNumber&direction=asc`;
      } else {
        url = `/api/rooms?page=0&size=9999&sortBy=${sortBy}&direction=${direction}`;
      }

      const res = await api.get(url);
      const allRooms: Room[] = res.data?.content ?? [];

      if (allRooms.length === 0) {
        alert(t?.rooms?.alertNoData || "Không có dữ liệu phòng để xuất!");
        return;
      }

      const headers = t?.rooms?.txtHeaders as Record<string, string> | undefined;
      const txtData = allRooms.map((r) => ({
        [headers?.roomNumber ?? "Số Phòng"]: r.roomNumber,
        [headers?.floorNumber ?? "Số Tầng"]: r.floorNumber,
        [headers?.roomType ?? "Loại Phòng"]: r.roomType?.typeName ?? "N/A",

        [headers?.status ?? "Trạng Thái"]: r.status ?? "N/A",
        [headers?.price ?? "Giá Gốc"]: `${r.roomType?.pricePerNight?.toLocaleString("vi-VN")}đ`,
      }));

      const filterLabel = floor ? `tang-${floor}` : status.toLowerCase();
      exportToTxt(
          txtData,
          `Danh sách phòng resort (${filterLabel})`,
          `danh-sach-phong-${filterLabel}`
      );
    } catch (err) {
      console.error("Lỗi xuất file TXT:", err);
      alert(t?.rooms?.alertError || "Có lỗi xảy ra khi tải dữ liệu phòng!");
    } finally {
      setExporting(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      let url = "";
      if (floor !== null && status !== "ALL") {
        url = `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc&status=${status}`;
      } else if (floor !== null) {
        url = `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc`;
      } else if (status !== "ALL") {
        url = `/api/rooms/status/${status}?page=0&size=9999&sortBy=roomNumber&direction=asc`;
      } else {
        url = `/api/rooms?page=0&size=9999&sortBy=${sortBy}&direction=${direction}`;
      }

      const res = await api.get(url);
      const allRooms: Room[] = res.data?.content ?? [];

      if (allRooms.length === 0) {
        alert(t?.rooms?.alertNoData || "Không có dữ liệu phòng để xuất!");
        return;
      }

      const headers = t?.rooms?.excelHeaders as Record<string, string> | undefined;
      const excelData = allRooms.map((r, index) => ({
        [headers?.stt ?? "STT"]: index + 1,
        [headers?.roomNumber ?? "Số Phòng"]: r.roomNumber,
        [headers?.floorNumber ?? "Tầng số"]: r.floorNumber,
        [headers?.roomType ?? "Tên Loại Phòng"]: r.roomType?.typeName ?? "N/A",
        [headers?.price ?? "Giá Phòng / Đêm (VND)"]: r.roomType?.pricePerNight ?? 0,
        [headers?.capacity ?? "Sức Chứa (Người)"]: r.roomType?.capacity ?? 0,
        [headers?.status ?? "Trạng Thái Hiện Tại"]: r.status ?? "N/A",
      }));

      const filterLabel = floor ? `tang-${floor}` : status.toLowerCase();
      exportToExcel(
          excelData,
          "Danh Sách Phòng",
          `danh-sach-phong-${filterLabel}-excel`
      );
    } catch (err) {
      console.error("Lỗi xuất file Excel:", err);
      alert(t?.rooms?.alertError || "Có lỗi xảy ra khi tải dữ liệu phòng!");
    } finally {
      setExporting(false);
    }
  };

  async function handleCreate() {
    if (!form.roomNumber || !form.roomTypeId) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/rooms", form);
      setShowModal(false);
      setForm(DEFAULT_FORM);
      setRefresh((r) => r + 1);
    } catch (err: unknown) {
      setError(
          err instanceof Error
              ? err.message
              : t?.rooms?.errorDefault || "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editRoom || !form.roomNumber || !form.roomTypeId) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/rooms/${editRoom.id}`, form);
      setEditRoom(null);
      setForm(DEFAULT_FORM);
      setRefresh((r) => r + 1);
    } catch (err: unknown) {
      setError(
          err instanceof Error
              ? err.message
              : t?.rooms?.errorDefault || "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditClick(room: Room) {
    setEditRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      floorNumber: room.floorNumber,
      status: room.status,
      roomTypeId: room.roomType.id,
    });
  }

  async function handleDelete() {
    if (!deleteRoomId) return;
    try {
      await api.delete(`/api/rooms/${deleteRoomId}`);
      setDeleteRoomId(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi xóa phòng:", err);
    }
  }

  return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">
              {t?.rooms?.title || "Quản lý Phòng"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {t?.rooms?.totalPrefix || "Tổng:"}{" "}
              {data?.totalElements ?? "..."}{" "}
              {t?.rooms?.totalSuffix || "phòng"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
                onClick={handleExportTxt}
                disabled={loading || exporting}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              {exporting
                  ? t?.rooms?.statusExporting || "Đang xuất..."
                  : t?.rooms?.btnExportTxt || "Xuất TXT"}
            </button>
            <button
                onClick={handleExportExcel}
                disabled={loading || exporting}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {exporting
                  ? t?.rooms?.statusExporting || "Đang xuất..."
                  : t?.rooms?.btnExportExcel || "Xuất Excel"}
            </button>
            <button
                onClick={() => {
                  setShowModal(true);
                  setForm(DEFAULT_FORM);
                }}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {t?.rooms?.btnCreate || "+ Thêm phòng"}
            </button>
          </div>
        </div>

        {/* Modal Thêm */}
        {showModal && (
            <RoomModal
                mode="create"
                form={form}
                roomTypes={roomTypes}
                saving={saving}
                onChange={setForm}
                onSubmit={handleCreate}
                errorMessage={error}
                onClose={() => {
                  setShowModal(false);
                  setError("");
                }}
            />
        )}

        {/* Modal Sửa */}
        {editRoom && (
            <RoomModal
                mode="edit"
                form={form}
                roomTypes={roomTypes}
                saving={saving}
                editRoomNumber={editRoom.roomNumber}
                onChange={setForm}
                onSubmit={handleUpdate}
                errorMessage={error}
                onClose={() => {
                  setEditRoom(null);
                  setError("");
                }}
            />
        )}

        {/* Confirm Xóa */}
        {deleteRoomId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {t?.rooms?.deleteTitle || "Xác nhận xóa"}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {t?.rooms?.deleteDesc ||
                      "Bạn có chắc muốn xóa phòng này không? Hành động này không thể hoàn tác."}
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                      onClick={() => setDeleteRoomId(null)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
                  >
                    {t?.rooms?.deleteCancel || "Hủy"}
                  </button>
                  <button
                      onClick={handleDelete}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                  >
                    {t?.rooms?.deleteConfirm || "Xóa"}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Modal Xem Khách */}
        {guestModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={(e) => e.target === e.currentTarget && setGuestModal(null)}
            >
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Khách phòng {guestModal.room.roomNumber}
                  </h3>
                  <button
                      onClick={() => setGuestModal(null)}
                      className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                {guestModal.loading ? (
                    <p className="text-sm text-zinc-400 text-center py-4">Đang tải...</p>
                ) : guestModal.booking ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                        <span className="text-sm text-zinc-500">Booking ID</span>
                        <span className="text-sm font-medium text-zinc-900">#{guestModal.booking.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                        <span className="text-sm text-zinc-500">Khách hàng</span>
                        <span className="text-sm font-medium text-zinc-900">{guestModal.booking.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-zinc-500">Ngày checkout</span>
                        <span className="text-sm font-medium text-zinc-900">
                      {new Date(guestModal.booking.checkOutDate).toLocaleDateString("vi-VN")}
                    </span>
                      </div>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-400 text-center py-4">
                      Không tìm thấy thông tin booking.
                    </p>
                )}

                <button
                    onClick={() => setGuestModal(null)}
                    className="mt-5 w-full rounded-xl border border-zinc-200 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
        )}
        {/* Filter — 2 filter hoạt động độc lập, kết hợp với nhau */}
        <RoomFilter
            status={status}
            floor={floor}
            floors={floors}
            onStatusChange={(s) => {
              setStatus(s);
              setPage(0); // chỉ reset page, giữ nguyên floor
            }}
            onFloorChange={(f) => {
              setFloor(f);
              setPage(0); // chỉ reset page, giữ nguyên status
            }}
        />

        {/* Bảng */}
        <RoomTable
            rooms={data?.content ?? []}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={(id) => setDeleteRoomId(id)}
            onViewGuest={handleViewGuest}
        />

        {/* Pagination */}
        {data && (
            <RoomPagination
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