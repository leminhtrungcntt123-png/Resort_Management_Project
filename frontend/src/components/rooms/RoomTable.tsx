"use client";

import { Room } from "@/types/room";

interface Props {
  rooms: Room[];
  loading: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
}

export default function RoomTable({ rooms, loading, onEdit, onDelete }: Props) {
  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left">Số phòng</th>
            <th className="px-4 py-3 text-left">Tầng</th>
            <th className="px-4 py-3 text-left">Loại phòng</th>
            <th className="px-4 py-3 text-left">Giá/đêm</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                Đang tải...
              </td>
            </tr>
          ) : (
            rooms.map((room) => (
              <tr key={room.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{room.roomNumber}</td>
                <td className="px-4 py-3">{room.floorNumber}</td>
                <td className="px-4 py-3">{room.roomType.typeName}</td>
                <td className="px-4 py-3">
                  {room.roomType.pricePerNight.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${
                                      room.status === "AVAILABLE"
                                        ? "bg-green-100 text-green-700"
                                        : room.status === "OCCUPIED"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-zinc-100 text-zinc-600"
                                    }`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit(room)}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
