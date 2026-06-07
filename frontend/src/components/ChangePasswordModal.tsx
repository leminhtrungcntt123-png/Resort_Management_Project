"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!oldPassword || !newPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch("/api/users/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccess(true);
      // Tự đóng sau 1.5 giây
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Đổi mật khẩu</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            ✅ Đổi mật khẩu thành công!
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          {/* Mật khẩu cũ */}
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Mật khẩu hiện tại
            </label>
            <div
              className="mt-1.5 flex items-center rounded-xl border border-zinc-200
                                        focus-within:ring-2 focus-within:ring-zinc-300"
            >
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="flex-1 bg-transparent px-3 py-2 text-sm
                                           outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOld((s) => !s)}
                className="px-3 text-zinc-400 hover:text-zinc-600"
              >
                {showOld ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Mật khẩu mới
            </label>
            <div
              className="mt-1.5 flex items-center rounded-xl border border-zinc-200
                                        focus-within:ring-2 focus-within:ring-zinc-300"
            >
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="flex-1 bg-transparent px-3 py-2 text-sm
                                           outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="px-3 text-zinc-400 hover:text-zinc-600"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5
                                   text-sm text-zinc-600 hover:bg-zinc-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm
                                   font-medium text-white hover:bg-zinc-700
                                   disabled:opacity-40 transition"
          >
            {loading ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}
