"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Employee, EmployeePageData, EmployeeForm } from "@/types/employee";
import EmployeeTable      from "@/components/employees/EmployeeTable";
import EmployeeModal      from "@/components/employees/EmployeeModal";
import EmployeePagination from "@/components/employees/EmployeePagination";

const DEFAULT_FORM: EmployeeForm = {
    fullName: "",
    phone: "",
    email: "",
    position: "",
    salary: 0,
};

export default function EmployeesPage() {
    const [data, setData]               = useState<EmployeePageData | null>(null);
    const [page, setPage]               = useState(0);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [form, setForm]               = useState<EmployeeForm>(DEFAULT_FORM);
    const [showModal, setShowModal]     = useState(false);
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
    const [deleteId, setDeleteId]       = useState<number | null>(null);
    const [error, setError]             = useState("");
    const [refresh, setRefresh]         = useState(0);

    useEffect(() => {
        async function fetchEmployees() {
            setLoading(true);
            try {
                const res = await api.get(
                    `/api/employees?page=${page}&size=10&sortBy=fullName&direction=asc`
                );
                setData(res.data);
            } catch (err) {
                console.error("Lỗi fetch employees:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEmployees();
    }, [page, refresh]);

    async function handleCreate() {
        if (!form.fullName) return;
        setSaving(true);
        setError("");
        try {
            await api.post("/api/employees", form);
            setShowModal(false);
            setForm(DEFAULT_FORM);
            setRefresh(r => r + 1);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate() {
        if (!editEmployee || !form.fullName) return;
        setSaving(true);
        setError("");
        try {
            await api.put(`/api/employees/${editEmployee.id}`, form);
            setEditEmployee(null);
            setForm(DEFAULT_FORM);
            setRefresh(r => r + 1);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        try {
            await api.delete(`/api/employees/${deleteId}`);
            setDeleteId(null);
            setRefresh(r => r + 1);
        } catch (err) {
            console.error("Lỗi xóa nhân viên:", err);
        }
    }

    function handleEditClick(emp: Employee) {
        setEditEmployee(emp);
        setForm({
            fullName: emp.fullName,
            phone:    emp.phone ?? "",
            email:    emp.email ?? "",
            position: emp.position ?? "",
            salary:   emp.salary ?? 0,
        });
    }

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">Quản lý Nhân viên</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Tổng: {data?.totalElements ?? "..."} nhân viên
                    </p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setForm(DEFAULT_FORM); }}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
                    + Thêm nhân viên
                </button>
            </div>

            {/* Modal Thêm */}
            {showModal && (
                <EmployeeModal
                    mode="create"
                    form={form}
                    saving={saving}
                    errorMessage={error}
                    onChange={setForm}
                    onSubmit={handleCreate}
                    onClose={() => { setShowModal(false); setError(""); }}
                />
            )}

            {/* Modal Sửa */}
            {editEmployee && (
                <EmployeeModal
                    mode="edit"
                    form={form}
                    saving={saving}
                    editName={editEmployee.fullName}
                    errorMessage={error}
                    onChange={setForm}
                    onSubmit={handleUpdate}
                    onClose={() => { setEditEmployee(null); setError(""); }}
                />
            )}

            {/* Confirm Xóa */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-zinc-900">Xác nhận xóa</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Bạn có chắc muốn xóa nhân viên này không?
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng */}
            <EmployeeTable
                employees={data?.content ?? []}
                loading={loading}
                onEdit={handleEditClick}
                onDelete={(id) => setDeleteId(id)}
            />

            {/* Pagination */}
            {data && (
                <EmployeePagination
                    page={data.page}
                    totalPages={data.totalPages}
                    last={data.last}
                    onPrev={() => setPage(p => p - 1)}
                    onNext={() => setPage(p => p + 1)}
                />
            )}
        </main>
    );
}