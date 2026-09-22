"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import ExportButtons from "@/components/ui/export-buttons";
import MachineFormModal from "@/components/machines/machine-form-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Machine, UserRole } from "@/lib/db/types";

export default function MachineManager({
  machines,
  role,
}: {
  machines: Machine[];
  role: UserRole;
}) {
  const isAdmin = role === "admin";
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(machine: Machine) {
    setEditing(machine);
    setModalOpen(true);
  }

  async function handleDelete(id: string, machineId: string) {
    if (!window.confirm(`ต้องการลบเครื่องจักร "${machineId}" และข้อมูลที่เกี่ยวข้องทั้งหมดหรือไม่?`)) {
      return;
    }
    setDeleting(id);
    const { error } = await supabase.from("machines").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      window.alert(`ลบไม่สำเร็จ: ${error.message}`);
      return;
    }
    router.refresh();
  }

  const exportRows = machines.map((m) => ({
    machine_id: m.machine_id,
    name: m.name,
    type: m.type,
    location: m.location,
    status: m.status,
    created_at: new Date(m.created_at).toLocaleString("th-TH"),
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">ทั้งหมด {machines.length} เครื่อง</p>
        <div className="flex items-center gap-2">
          <ExportButtons
            rows={exportRows}
            columns={[
              { key: "machine_id", label: "Machine ID" },
              { key: "name", label: "ชื่อ" },
              { key: "type", label: "ประเภท" },
              { key: "location", label: "ตำแหน่ง" },
              { key: "status", label: "สถานะ" },
              { key: "created_at", label: "วันที่เพิ่ม" },
            ]}
            filename="machines"
          />
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
              <Plus className="h-4 w-4" /> เพิ่มเครื่องจักร
            </button>
          )}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Machine ID</th>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ตำแหน่ง</th>
                <th className="px-4 py-3">สถานะ</th>
                {isAdmin && <th className="px-4 py-3 text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {machines.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    ไม่พบข้อมูลเครื่องจักร
                  </td>
                </tr>
              )}
              {machines.map((m) => (
                <tr key={m.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-mono font-semibold text-white">
                    {m.machine_id}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{m.name}</td>
                  <td className="px-4 py-3 text-slate-400">{m.type}</td>
                  <td className="px-4 py-3 text-slate-400">{m.location}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={m.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          title="แก้ไข"
                          className="icon-btn"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.machine_id)}
                          disabled={deleting === m.id}
                          title="ลบ"
                          className="icon-btn icon-btn--danger disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MachineFormModal
        key={editing ? editing.id : "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        machine={editing}
      />
    </>
  );
}