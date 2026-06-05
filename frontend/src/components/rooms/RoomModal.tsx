"use client";

import { RoomForm, RoomType } from "@/types/room";
import { useLang } from "@/contexts/LangContext";

interface Props {
    mode: "create" | "edit";
    form: RoomForm;
    roomTypes: RoomType[];
    saving: boolean;
    editRoomNumber?: string;
    onChange: (form: RoomForm) => void;
    onSubmit: () => void;
    onClose: () => void;
    errorMessage?: string;
}

export default function RoomModal({
    mode, form, roomTypes, saving,
    editRoomNumber, onChange, onSubmit, onClose, errorMessage
}: Props) {
    const { t } = useLang();
    const rModal = t?.rooms?.modal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-zinc-900">
                    {mode === "create"
                        ? (rModal?.createTitle || "Thêm phòng mới")
                        : `${rModal?.editTitle || "Sửa phòng"} ${editRoomNumber || ""}`}
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                    {/* Số phòng */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {rModal?.roomNumber || "Số phòng"}
                        </label>
                        <input
                            type="text"
                            value={form.roomNumber}
                            onChange={e => onChange({...form, roomNumber: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder={rModal?.placeholderRoomNumber || "VD: 101"}
                        />
                    </div>

                    {/* Tầng */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {rModal?.floorNumber || "Tầng"}
                        </label>
                        <input
                            type="number"
                            value={form.floorNumber}
                            onChange={e => onChange({...form, floorNumber: Number(e.target.value)})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>

                    {/* Loại phòng */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {rModal?.roomType || "Loại phòng"}
                        </label>
                        <select
                            value={form.roomTypeId}
                            onChange={e => onChange({...form, roomTypeId: Number(e.target.value)})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400">
                            <option value={0}>{rModal?.placeholderSelectType || "-- Chọn loại phòng --"}</option>
                            {roomTypes?.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.typeName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Trạng thái phòng */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {rModal?.status || "Trạng thái"}
                        </label>
                        <select
                            value={form.status}
                            onChange={e => onChange({...form, status: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400">
                            <option value="AVAILABLE">{rModal?.statusOptions?.AVAILABLE || "Còn trống"}</option>
                            <option value="OCCUPIED">{rModal?.statusOptions?.OCCUPIED || "Đang ở"}</option>
                            <option value="MAINTENANCE">{rModal?.statusOptions?.MAINTENANCE || "Bảo trì"}</option>
                        </select>
                    </div>
                </div>

                {errorMessage && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {/* Nút hành động */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
                        {rModal?.btnCancel || "Hủy"}
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={saving}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                        {saving
                            ? (rModal?.btnSaving || "Đang lưu...")
                            : mode === "create"
                                ? (rModal?.btnSave || "Lưu")
                                : (rModal?.btnUpdate || "Cập nhật")}
                    </button>
                </div>
            </div>
        </div>
    );
}