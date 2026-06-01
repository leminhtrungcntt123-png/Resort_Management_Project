"use client";

import { EmployeeForm } from "@/types/employee";

interface Props {
    mode: "create" | "edit";
    form: EmployeeForm;
    saving: boolean;
    editName?: string;
    errorMessage?: string;
    onChange: (form: EmployeeForm) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function EmployeeModal({
    mode, form, saving, editName,
    errorMessage, onChange, onSubmit, onClose
}: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-zinc-900">
                    {mode === "create" ? "Thêm nhân viên" : `Sửa: ${editName}`}
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium text-zinc-700">Họ tên</label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => onChange({...form, fullName: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">Số điện thoại</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={e => onChange({...form, phone: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="0901234567"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => onChange({...form, email: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">Chức vụ</label>
                        <input
                            type="text"
                            value={form.position}
                            onChange={e => onChange({...form, position: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="Lễ tân, Quản lý..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">Lương</label>
                        <input
                            type="number"
                            value={form.salary}
                            onChange={e => onChange({...form, salary: Number(e.target.value)})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="10000000"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
                        Hủy
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={saving}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                        {saving ? "Đang lưu..." : mode === "create" ? "Lưu" : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
}