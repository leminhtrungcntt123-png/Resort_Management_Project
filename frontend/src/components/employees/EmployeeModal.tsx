"use client";

import { EmployeeForm } from "@/types/employee";
import { useLang } from "@/contexts/LangContext";

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
    const { t, lang } = useLang();
    const headers = t?.employees?.tableHeaders;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Header */}
                <h3 className="text-lg font-semibold text-zinc-900">
                    {mode === "create"
                        ? (lang === "en" ? "Add Employee" : "Thêm nhân viên")
                        : (lang === "en" ? `Edit: ${editName}` : `Sửa: ${editName}`)}
                </h3>

                {/* Form fields */}
                <div className="mt-4 flex flex-col gap-3">
                    {/* Họ tên */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {headers?.name || "Họ tên"}
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => onChange({...form, fullName: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder={lang === "en" ? "John Doe" : "Nguyễn Văn A"}
                        />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {headers?.phone || "Số điện thoại"}
                        </label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={e => onChange({...form, phone: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="0901234567"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {headers?.email || "Email"}
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => onChange({...form, email: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="example@email.com"
                        />
                    </div>

                    {/* Chức vụ */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {headers?.position || "Chức vụ"}
                        </label>
                        <input
                            type="text"
                            value={form.position}
                            onChange={e => onChange({...form, position: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder={lang === "en" ? "Receptionist, Manager..." : "Lễ tân, Quản lý..."}
                        />
                    </div>

                    {/* Lương */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {headers?.salary || "Lương"}
                        </label>
                        <input
                            type="number"
                            value={form.salary}
                            onChange={e => onChange({...form, salary: Number(e.target.value)})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="10000000"
                        />
                    </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {/* Footer buttons */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
                        {t?.employees?.btnCancel || "Hủy"}
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={saving}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                        {saving
                            ? (t?.employees?.saving || "Đang lưu...")
                            : mode === "create"
                                ? (t?.employees?.btnCreate || "Thêm mới")
                                : (t?.employees?.btnSave || "Lưu thay đổi")}
                    </button>
                </div>
            </div>
        </div>
    );
}