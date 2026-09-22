"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Modal from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { maintenanceSchema, flattenZodError } from "@/lib/validation";
import { MAINTENANCE_STATUSES } from "@/lib/db/types";

interface MachineOption {
  id: string;
  machine_id: string;
  name: string;
}

interface MaintForm {
  machine_id: string;
  maintenance_type: string;
  problem: string;
  action_taken: string;
  technician: string;
  maintenance_date: string;
  status: string;
}

const emptyForm: MaintForm = {
  machine_id: "",
  maintenance_type: "",
  problem: "",
  action_taken: "",
  technician: "",
  maintenance_date: new Date().toISOString().slice(0, 10),
  status: "Pending",
};

export default function MaintenanceFormModal({
  open,
  onClose,
  record,
  machines,
  defaultTechnician,
}: {
  open: boolean;
  onClose: () => void;
  record: {
    id: string;
    machine_id: string;
    maintenance_type: string;
    problem: string;
    action_taken: string;
    technician: string | null;
    maintenance_date: string;
    status: string;
  } | null;
  machines: MachineOption[];
  defaultTechnician: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<MaintForm>(() =>
    record
      ? {
          machine_id: record.machine_id,
          maintenance_type: record.maintenance_type,
          problem: record.problem,
          action_taken: record.action_taken,
          technician: record.technician ?? "",
          maintenance_date: record.maintenance_date.slice(0, 10),
          status: record.status,
        }
      : { ...emptyForm, technician: defaultTechnician }
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setServerError(null);

    const parsed = maintenanceSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(flattenZodError(parsed.error));
      return;
    }

    const payload = {
      machine_id: parsed.data.machine_id,
      maintenance_type: parsed.data.maintenance_type,
      problem: parsed.data.problem,
      action_taken: parsed.data.action_taken,
      technician: parsed.data.technician || null,
      maintenance_date: parsed.data.maintenance_date,
      status: parsed.data.status,
    };

    setLoading(true);
    let error: { message: string } | null = null;
    if (record) {
      const res = await supabase
        .from("maintenance_records")
        .update(payload)
        .eq("id", record.id);
      error = res.error;
    } else {
      const res = await supabase
        .from("maintenance_records")
        .insert(payload);
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

  const set = (key: keyof MaintForm) =>
    (e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? "แก้ไขงานบำรุงรักษา" : "เพิ่มงานบำรุงรักษา"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              ประเภทงานบำรุงรักษา *
            </label>
            <select
              value={form.maintenance_type}
              onChange={set("maintenance_type")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">-- เลือกประเภท --</option>
              {[
                "Preventive (เชิงป้องกัน)",
                "Corrective (แก้ไข)",
                "Predictive (เชิงทำนาย)",
                "Emergency (ฉุกเฉิน)",
                "Inspection (ตรวจสอบ)",
                "PM - Preventive Maintenance",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              ช่างผู้รับผิดชอบ (Technician)
            </label>
            <input
              value={form.technician}
              onChange={set("technician")}
              placeholder="สมชาย ใจดี"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              วันที่ *
            </label>
            <input
              type="date"
              value={form.maintenance_date}
              onChange={set("maintenance_date")}
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
              {MAINTENANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            ปัญหา (Problem) *
          </label>
          <textarea
            value={form.problem}
            onChange={set("problem")}
            rows={2}
            placeholder="อธิบายปัญหาที่พบ"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            การดำเนินการ (Action Taken) *
          </label>
          <textarea
            value={form.action_taken}
            onChange={set("action_taken")}
            rows={2}
            placeholder="อธิบายขั้นตอนการแก้ไขที่ดำเนินการ"
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