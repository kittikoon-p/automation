"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Modal from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { machineSchema, flattenZodError } from "@/lib/validation";
import { MACHINE_STATUSES, type Machine } from "@/lib/db/types";

const emptyForm = {
  machine_id: "",
  name: "",
  type: "",
  location: "",
  status: "Stop",
};

export default function MachineFormModal({
  open,
  onClose,
  machine,
}: {
  open: boolean;
  onClose: () => void;
  machine: Machine | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(() =>
    machine
      ? {
          machine_id: machine.machine_id,
          name: machine.name,
          type: machine.type,
          location: machine.location,
          status: machine.status,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setServerError(null);

    const parsed = machineSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(flattenZodError(parsed.error));
      return;
    }

    setLoading(true);
    const payload = {
      machine_id: parsed.data.machine_id,
      name: parsed.data.name,
      type: parsed.data.type,
      location: parsed.data.location,
      status: parsed.data.status,
    };

    if (machine) {
      const { error } = await supabase
        .from("machines")
        .update(payload)
        .eq("id", machine.id);
      setLoading(false);
      if (error) {
        setServerError(
          error.code === "23505"
            ? "Machine ID นี้ถูกใช้งานแล้ว ซ้ำไม่ได้"
            : error.message
        );
        return;
      }
    } else {
      const { error } = await supabase.from("machines").insert(payload);
      setLoading(false);
      if (error) {
        setServerError(
          error.code === "23505"
            ? "Machine ID นี้ถูกใช้งานแล้ว ซ้ำไม่ได้"
            : error.message
        );
        return;
      }
    }

    onClose();
    router.refresh();
  }

  const set = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={machine ? "แก้ไขเครื่องจักร" : "เพิ่มเครื่องจักร"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Machine ID *
          </label>
          <input
            value={form.machine_id}
            onChange={set("machine_id")}
            disabled={!!machine}
            placeholder="MCH-001"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            ชื่อเครื่องจักร (Machine Name) *
          </label>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Press Machine 1"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              ประเภท (Machine Type) *
            </label>
            <input
              value={form.type}
              onChange={set("type")}
              placeholder="Press"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              ตำแหน่ง (Location) *
            </label>
            <input
              value={form.location}
              onChange={set("location")}
              placeholder="Building A"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
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
            {MACHINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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