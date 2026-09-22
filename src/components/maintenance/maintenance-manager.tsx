"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import ExportButtons from "@/components/ui/export-buttons";
import MaintenanceFormModal from "@/components/maintenance/maintenance-form-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/client";
import { canWrite, type MaintenanceRecord, type UserRole } from "@/lib/db/types";

interface MachineOption {
  id: string;
  machine_id: string;
  name: string;
}

export default function MaintenanceManager({
  records,
  machines,
  role,
  currentUserName,
}: {
  records: MaintenanceRecord[];
  machines: MachineOption[];
  role: UserRole;
  currentUserName: string;
}) {
  const isAdmin = role === "admin";
  const writer = canWrite(role);
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

  const exportRows = records.map((r) => ({
    machine_id: r.machines?.machine_id ?? "",
    name: r.machines?.name ?? "",
    maintenance_type: r.maintenance_type,
    problem: r.problem,
    action_taken: r.action_taken,
    technician: r.technician ?? "",
    maintenance_date: r.maintenance_date,
    status: r.status,
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">ทั้งหมด {records.length} รายการ</p>
        <div className="flex items-center gap-2">
          <ExportButtons
            rows={exportRows}
            columns={[
              { key: "machine_id", label: "Machine ID" },
              { key: "name", label: "เครื่องจักร" },
              { key: "maintenance_type", label: "ประเภท" },
              { key: "problem", label: "ปัญหา" },
              { key: "action_taken", label: "การดำเนินการ" },
              { key: "technician", label: "ช่าง" },
              { key: "maintenance_date", label: "วันที่" },
              { key: "status", label: "สถานะ" },
            ]}
            filename="maintenance"
          />
          {writer && (
            <button onClick={openAdd} className="btn-primary">
              <Plus className="h-4 w-4" /> เพิ่มงานบำรุงรักษา
            </button>
          )}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">เครื่องจักร</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ปัญหา</th>
                <th className="px-4 py-3">การดำเนินการ</th>
                <th className="px-4 py-3">ช่าง</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">สถานะ</th>
                {writer && <th className="px-4 py-3 text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={writer ? 8 : 7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
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
                  {writer && (
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
                  )}
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