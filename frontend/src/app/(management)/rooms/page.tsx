"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Room, PageData, RoomType, RoomForm } from "@/types/room";
import RoomFilter from "@/components/rooms/RoomFilter";
import RoomTable from "@/components/rooms/RoomTable";
import RoomModal from "@/components/rooms/RoomModal";
import RoomPagination from "@/components/rooms/RoomPagination";
import { exportToTxt, exportToExcel } from "@/components/export";

const DEFAULT_FORM: RoomForm = {
  roomNumber: "",
  floorNumber: 1,
  status: "AVAILABLE",
  roomTypeId: 0,
};

export default function RoomsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // Trạng thái khi đang tải dữ liệu xuất file
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

  // Fetch rooms
  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const url = floor
          ? `/api/rooms/floor/${floor}?page=${page}&size=10&sortBy=roomNumber&direction=asc`
          : status === "ALL"
            ? `/api/rooms?page=${page}&size=10&sortBy=${sortBy}&direction=${direction}`
            : `/api/rooms/status/${status}?page=${page}&size=10&sortBy=roomNumber&direction=asc`;
        const res = await api.get(url);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [page, status, floor, refresh]);

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

  // HÀM XỬ LÝ XUẤT FILE TXT (ĐỒNG BỘ THEO BỘ LỌC)
  const handleExportTxt = async () => {
    setExporting(true);
    try {
      const url = floor
        ? `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc`
        : status === "ALL"
          ? `/api/rooms?page=0&size=9999&sortBy=${sortBy}&direction=${direction}`
          : `/api/rooms/status/${status}?page=0&size=9999&sortBy=roomNumber&direction=asc`;

      const res = await api.get(url);
      const allRooms: Room[] = res.data?.content ?? [];

      if (allRooms.length === 0) {
        alert("Không có dữ liệu phòng để xuất!");
        return;
      }

      const txtData = allRooms.map((r) => ({
        "Số Phòng": r.roomNumber,
        "Số Tầng": r.floorNumber,
        "Loại Phòng": r.roomType?.roomType ?? "N/A",
        "Trạng Thái": r.status ?? "N/A",
        "Giá Gốc": `${r.roomType?.price?.toLocaleString("vi-VN")}đ`
      }));

      const filterLabel = floor ? `tang-${floor}` : status.toLowerCase();
      exportToTxt(txtData, `Danh sách phòng resort (${filterLabel})`, `danh-sach-phong-${filterLabel}`);
    } catch (err) {
      console.error("Lỗi xuất file TXT:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu phòng!");
    } finally {
      setExporting(false);
    }
  };

  // HÀM XỬ LÝ XUẤT FILE EXCEL (ĐỒNG BỘ THEO BỘ LỌC)
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const url = floor
        ? `/api/rooms/floor/${floor}?page=0&size=9999&sortBy=roomNumber&direction=asc`
        : status === "ALL"
          ? `/api/rooms?page=0&size=9999&sortBy=${sortBy}&direction=${direction}`
          : `/api/rooms/status/${status}?page=0&size=9999&sortBy=roomNumber&direction=asc`;

      const res = await api.get(url);
      const allRooms: Room[] = res.data?.content ?? [];

      if (allRooms.length === 0) {
        alert("Không có dữ liệu phòng để xuất!");
        return;
      }

      const excelData = allRooms.map((r, index) => ({
        "STT": index + 1,
        "Số Phòng": r.roomNumber,
        "Tầng số": r.floorNumber,
        "Tên Loại Phòng": r.roomType?.roomType ?? "N/A",
        "Giá Phòng / Đêm (VND)": r.roomType?.price ?? 0,
        "Sức Chứa (Người)": r.roomType?.capacity ?? 0,
        "Trạng Thái Hiện Tại": r.status ?? "N/A",
      }));

      const filterLabel = floor ? `tang-${floor}` : status.toLowerCase();
      exportToExcel(excelData, "Danh Sách Phòng", `danh-sach-phong-${filterLabel}-excel`);
    } catch (err) {
      console.error("Lỗi xuất file Excel:", err);
      alert("Có lỗi xảy ra khi tải dữ liệu phòng!");
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
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
            Quản lý Phòng
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tổng: {data?.totalElements ?? "..."} phòng
          </p>
        </div>

        {/* Khối nút chức năng góc phải */}
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
          <button
            onClick={() => {
              setShowModal(true);
              setForm(DEFAULT_FORM);
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Thêm phòng
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
              Xác nhận xóa
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Bạn có chắc muốn xóa phòng này không? Hành động này không thể hoàn
              tác.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteRoomId(null)}
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

      {/* Filter */}
      <RoomFilter
        status={status}
        floor={floor}
        floors={floors}
        onStatusChange={(s) => {
          setStatus(s);
          setFloor(null);
          setPage(0);
        }}
        onFloorChange={(f) => {
          setFloor(f);
          setPage(0);
        }}
      />

      {/* Bảng */}
      <RoomTable
        rooms={data?.content ?? []}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={(id) => setDeleteRoomId(id)}
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