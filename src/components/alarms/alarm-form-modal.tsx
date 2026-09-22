"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Modal from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { alarmSchema, flattenZodError } from "@/lib/validation";
import { ALARM_STATUSES } from "@/lib/db/types";

interface MachineOption {
  id: string;
  machine_id: string;
  name: string;
}

interface AlarmForm {
  machine_id: string;
  alarm_code: string;
  alarm_description: string;
  occurred_at: string;
  cause: string;
  status: string;
}

const emptyForm: AlarmForm = {
  machine_id: "",
  alarm_code: "",
  alarm_description: "",
  occurred_at: "",
  cause: "",
  status: "Open",
};

function toLocalInput(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export default function AlarmFormModal({
  open,
  onClose,
  alarm,
  machines,
}: {
  open: boolean;
  onClose: () => void;
  alarm: { id: string; machine_id: string; alarm_code: string; alarm_description: string; occurred_at: string; cause: string | null; status: string } | null;
  machines: MachineOption[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<AlarmForm>(() =>
    alarm
      ? {
          machine_id: alarm.machine_id,
          alarm_code: alarm.alarm_code,
          alarm_description: alarm.alarm_description,
          occurred_at: toLocalInput(alarm.occurred_at),
          cause: alarm.cause ?? "",
          status: alarm.status,
        }
      : { ...emptyForm, occurred_at: new Date().toISOString().slice(0, 16) }
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setServerError(null);

    const parsed = alarmSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(flattenZodError(parsed.error));
      return;
    }

    const payload = {
      machine_id: parsed.data.machine_id,
      alarm_code: parsed.data.alarm_code,
      alarm_description: parsed.data.alarm_description,
      occurred_at: new Date(parsed.data.occurred_at).toISOString(),
      cause: parsed.data.cause || null,
      status: parsed.data.status,
    };

    setLoading(true);
    let error: { message: string; code?: string } | null = null;
    if (alarm) {
      const res = await supabase.from("alarms").update(payload).eq("id", alarm.id);
      error = res.error;
    } else {
      const res = await supabase.from("alarms").insert(payload);
      error = res.error;
    }
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    onClose();
    router.refresh();
  }

  const set = (key: keyof AlarmForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={alarm ? "แก้ไขบันทึก Alarm" : "เพิ่มบันทึก Alarm"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            เครื่องจักร *
          </label>
          <select
            value={form.machine_id}
            onChange={set("machine_id")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">-- เลือกเครื่องจักร --</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_id} — {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Alarm Code *
            </label>
            <input
              value={form.alarm_code}
              onChange={set("alarm_code")}
              placeholder="AL-1001"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Date / Time *
            </label>
            <input
              type="datetime-local"
              value={form.occurred_at}
              onChange={set("occurred_at")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              สถานะ *
            </label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {ALARM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Alarm Description *
          </label>
          <textarea
            value={form.alarm_description}
            onChange={set("alarm_description")}
            rows={2}
            placeholder="คำอธิบายเหตุการณ์ Alarm"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            สาเหตุ (Cause)
          </label>
          <textarea
            value={form.cause}
            onChange={set("cause")}
            rows={2}
            placeholder="สาเหตุที่เกิด Alarm"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.map((err) => (
              <li key={err}>• {err}</li>
            ))}
          </ul>
        )}
        {serverError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "บันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}