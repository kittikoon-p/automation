"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/db/types";

export default function RoleSelect({
  profileId,
  role,
}: {
  profileId: string;
  role: UserRole;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState<UserRole>(role);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as UserRole;
    setValue(next);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: next })
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      window.alert(`เปลี่ยนสิทธิ์ไม่สำเร็จ: ${error.message}`);
      setValue(role);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving}
      className="rounded-lg border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
    >
      <option value="admin">Admin</option>
      <option value="technician">Technician</option>
    </select>
  );
}