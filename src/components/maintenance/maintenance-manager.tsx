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
        <p className="text-sm text-slate-400">ทั้งหมด {records.length} รายการ</p>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> เพิ่มงานบำรุงรักษา
        </button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
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
            <tbody className="divide-y divide-white/5">
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    ไม่พบงานบำรุงรักษา
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-white">
                      {r.machines?.machine_id ?? "-"}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {r.machines?.name ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{r.maintenance_type}</td>
                  <td className="max-w-[220px] px-4 py-3 text-slate-300">
                    {r.problem}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-slate-300">
                    {r.action_taken}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {r.technician || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
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
                        className="icon-btn"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          title="ลบ"
                          className="icon-btn icon-btn--danger disabled:opacity-50"
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