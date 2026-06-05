"use client";

import { CustomerForm } from "@/types/customer";
import { useLang } from "@/contexts/LangContext";

interface Props {
    mode: "create" | "edit";
    form: CustomerForm;
    saving: boolean;
    editName?: string;
    errorMessage?: string;
    onChange: (form: CustomerForm) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function CustomerModal({
    mode, form, saving, editName,
    errorMessage, onChange, onSubmit, onClose
}: Props) {
    const { t } = useLang();

    const titleText = mode === "create"
        ? (t?.customers?.modal?.createTitle || "Thêm khách hàng")
        : (t?.customers?.modal?.editTitle?.replace("{name}", editName || "") || `Sửa: ${editName}`);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-zinc-900">
                    {titleText}
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {t?.customers?.modal?.labelFullName || "Họ tên"}
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => onChange({...form, fullName: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 bg-white text-zinc-800"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {t?.customers?.modal?.labelPhone || "Số điện thoại"}
                        </label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={e => onChange({...form, phone: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 bg-white text-zinc-800"
                            placeholder="0901234567"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {t?.customers?.modal?.labelEmail || "Email"}
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => onChange({...form, email: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 bg-white text-zinc-800"
                            placeholder="example@email.com"
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
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 text-zinc-700">
                        {t?.customers?.deleteCancel || "Hủy"}
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={saving}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                        {saving
                            ? (t?.customers?.modal?.saving || "Đang lưu...")
                            : mode === "create"
                                ? (t?.customers?.modal?.btnSave || "Lưu")
                                : (t?.customers?.modal?.btnUpdate || "Cập nhật")
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}