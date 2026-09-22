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
        <p className="text-sm text-slate-400">ทั้งหมด {alarms.length} รายการ</p>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> เพิ่มบันทึก Alarm
        </button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
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
            <tbody className="divide-y divide-white/5">
              {alarms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    ไม่พบบันทึก Alarm
                  </td>
                </tr>
              )}
              {alarms.map((alarm) => (
                <tr key={alarm.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-white">
                      {alarm.machines?.machine_id ?? "-"}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {alarm.machines?.name ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {alarm.alarm_code}
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-slate-300">
                    {alarm.alarm_description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {new Date(alarm.occurred_at).toLocaleString("th-TH")}
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-slate-300">
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
                        className="icon-btn"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(alarm.id)}
                          disabled={deleting === alarm.id}
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