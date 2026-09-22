import { ShieldCheck } from "lucide-react";

import RoleSelect from "@/components/admin/role-select";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/db/guard";
import type { UserRole } from "@/lib/db/types";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default async function UsersPage() {
  await requireUser("admin");
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at");

  const rows = (profiles ?? []) as ProfileRow[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <ShieldCheck className="h-6 w-6 text-purple-400" /> จัดการผู้ใช้
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          กำหนดสิทธิ์ (Role) ของผู้ใช้งานระบบ เฉพาะ Admin เท่านั้น
        </p>
      </header>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">สมัครเมื่อ</th>
                <th className="px-4 py-3">สิทธิ์ (Role)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    ไม่พบผู้ใช้งาน
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">
                    {p.full_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{p.email || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {new Date(p.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect profileId={p.id} role={p.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}