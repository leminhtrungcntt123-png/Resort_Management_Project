"use client";

import { Room } from "@/types/room";
import { useLang } from "@/contexts/LangContext";

interface Props {
  rooms: Room[];
  loading: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
  onViewGuest: (room: Room) => void;
}

export default function RoomTable({ rooms, loading, onEdit, onDelete, onViewGuest }: Props) {
  const { t } = useLang();

  const STATUS_LABEL: Record<string, string> = {
    AVAILABLE:   t?.rooms?.filter?.available || "Còn trống",
    OCCUPIED:    t?.rooms?.filter?.occupied || "Đang ở",
    MAINTENANCE: t?.rooms?.filter?.maintenance || "Bảo trì",
    BOOKED:      t?.rooms?.filter?.booked || "Đã đặt",
  };

  return (
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.roomNumber || "Số phòng"}</th>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.floor || "Tầng"}</th>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.roomType || "Loại phòng"}</th>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.price || "Giá/đêm"}</th>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.status || "Trạng thái"}</th>
            <th className="px-4 py-3 text-left">{t?.rooms?.tableHeaders?.actions || "Thao tác"}</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
          {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  {t?.rooms?.loading || "Đang tải..."}
                </td>
              </tr>
          ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  {t?.rooms?.empty || "Không tìm thấy phòng nào phù hợp."}
                </td>
              </tr>
          ) : (
              rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-3">{room.floorNumber}</td>
                    <td className="px-4 py-3">{room.roomType?.typeName || room.roomType?.roomType}</td>
                    <td className="px-4 py-3">
                      {room.roomType?.pricePerNight
                          ? room.roomType.pricePerNight.toLocaleString("vi-VN") + "đ"
                          : room.roomType?.price?.toLocaleString("vi-VN") + "đ" || "0đ"}
                    </td>
                    <td className="px-4 py-3">
                  <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                          room.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : room.status === "OCCUPIED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-zinc-100 text-zinc-600"
                      }`}
                  >
                    {STATUS_LABEL[room.status] || room.status}
                  </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {room.status === "OCCUPIED" && (
                            <button
                                onClick={() => onViewGuest(room)}
                                className="rounded-lg border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                            >
                              Xem khách
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(room)}
                            className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50 text-zinc-700"
                        >
                          {t?.rooms?.actionButtons?.edit || "Sửa"}
                        </button>
                        <button
                            onClick={() => onDelete(room.id)}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          {t?.rooms?.actionButtons?.delete || "Xóa"}
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