"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Room, PageData, RoomType, RoomForm } from "@/types/room";
import RoomFilter from "@/components/rooms/RoomFilter";
import RoomTable from "@/components/rooms/RoomTable";
import RoomModal from "@/components/rooms/RoomModal";
import RoomPagination from "@/components/rooms/RoomPagination";

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
          ? `/api/rooms/floor/${floor}?page=${page}&size=10&sortBy=roomNumber&direction=asc` // ← thêm sort
          : status === "ALL"
            ? `/api/rooms?page=${page}&size=10&sortBy=${sortBy}&direction=${direction}`
            : `/api/rooms/status/${status}?page=${page}&size=10&sortBy=roomNumber&direction=asc`; // ← thêm sort
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
    setError(""); // ← có dòng này chưa?
    try {
      await api.put(`/api/rooms/${editRoom.id}`, form);
      setEditRoom(null);
      setForm(DEFAULT_FORM);
      setRefresh((r) => r + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); // ← có dòng này chưa?
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
        <button
          onClick={() => {
            setShowModal(true);
            setForm(DEFAULT_FORM);
          }}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + Thêm phòng
        </button>
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
