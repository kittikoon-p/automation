"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import MachineFormModal from "@/components/machines/machine-form-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Machine } from "@/lib/db/types";

export default function MachineManager({
  machines,
  isAdmin,
}: {
  machines: Machine[];
  isAdmin: boolean;
}) {
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

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">ทั้งหมด {machines.length} เครื่อง</p>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> เพิ่มเครื่องจักร
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Machine ID</th>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ตำแหน่ง</th>
                <th className="px-4 py-3">สถานะ</th>
                {isAdmin && <th className="px-4 py-3 text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {machines.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-4 py-10 text-center text-zinc-400"
                  >
                    ไม่พบข้อมูลเครื่องจักร
                  </td>
                </tr>
              )}
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono font-semibold text-zinc-900">
                    {m.machine_id}
                  </td>
                  <td className="px-4 py-3 text-zinc-800">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{m.type}</td>
                  <td className="px-4 py-3 text-zinc-600">{m.location}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={m.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          title="แก้ไข"
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.machine_id)}
                          disabled={deleting === m.id}
                          title="ลบ"
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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