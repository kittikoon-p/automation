"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import MaintenanceFormModal from "@/components/maintenance/maintenance-form-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceRecord } from "@/lib/db/types";

interface MachineOption {
  id: string;
  machine_id: string;
  name: string;
}

export default function MaintenanceManager({
  records,
  machines,
  isAdmin,
  currentUserName,
}: {
  records: MaintenanceRecord[];
  machines: MachineOption[];
  isAdmin: boolean;
  currentUserName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(record: MaintenanceRecord) {
    setEditing(record);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("ต้องการลบบันทึกงานบำรุงรักษานี้หรือไม่?")) return;
    setDeleting(id);
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", id);
    setDeleting(null);
    if (error) {
      window.alert(`ลบไม่สำเร็จ: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">ทั้งหมด {records.length} รายการ</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> เพิ่มงานบำรุงรักษา
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">เครื่องจักร</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ปัญหา</th>
                <th className="px-4 py-3">การดำเนินการ</th>
                <th className="px-4 py-3">ช่าง</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                    ไม่พบงานบำรุงรักษา
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-zinc-900">
                      {r.machines?.machine_id ?? "-"}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {r.machines?.name ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{r.maintenance_type}</td>
                  <td className="max-w-[220px] px-4 py-3 text-zinc-600">
                    {r.problem}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-zinc-600">
                    {r.action_taken}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {r.technician || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {new Date(r.maintenance_date + "T00:00:00").toLocaleDateString(
                      "th-TH"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        title="แก้ไข"
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          title="ลบ"
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MaintenanceFormModal
        key={editing ? editing.id : "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editing}
        machines={machines}
        defaultTechnician={currentUserName}
      />
    </>
  );
}