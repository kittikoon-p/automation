"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AlarmFormModal from "@/components/alarms/alarm-form-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/client";
import type { Alarm } from "@/lib/db/types";

interface MachineOption {
  id: string;
  machine_id: string;
  name: string;
}

export default function AlarmManager({
  alarms,
  machines,
  isAdmin,
}: {
  alarms: Alarm[];
  machines: MachineOption[];
  isAdmin: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(alarm: Alarm) {
    setEditing(alarm);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("ต้องการลบบันทึก Alarm นี้หรือไม่?")) return;
    setDeleting(id);
    const { error } = await supabase.from("alarms").delete().eq("id", id);
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
        <p className="text-sm text-zinc-500">ทั้งหมด {alarms.length} รายการ</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> เพิ่มบันทึก Alarm
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">เครื่องจักร</th>
                <th className="px-4 py-3">Alarm Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Cause</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {alarms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    ไม่พบบันทึก Alarm
                  </td>
                </tr>
              )}
              {alarms.map((alarm) => (
                <tr key={alarm.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-zinc-900">
                      {alarm.machines?.machine_id ?? "-"}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {alarm.machines?.name ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-800">
                    {alarm.alarm_code}
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-zinc-600">
                    {alarm.alarm_description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {new Date(alarm.occurred_at).toLocaleString("th-TH")}
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-zinc-600">
                    {alarm.cause || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={alarm.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(alarm)}
                        title="แก้ไข"
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(alarm.id)}
                          disabled={deleting === alarm.id}
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

      <AlarmFormModal
        key={editing ? editing.id : "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alarm={editing}
        machines={machines}
      />
    </>
  );
}