import { ScrollText } from "lucide-react";

import { fetchAuditLogs } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

const ACTION_STYLES: Record<string, string> = {
  INSERT: "bg-emerald-500/20 text-emerald-300",
  UPDATE: "bg-amber-500/20 text-amber-300",
  DELETE: "bg-red-500/20 text-red-300",
};

const TABLE_LABELS: Record<string, string> = {
  machines: "เครื่องจักร",
  alarms: "Alarm",
  maintenance_records: "บำรุงรักษา",
};

function summarize(details: Record<string, unknown> | null): string {
  if (!details) return "-";
  const prev = details.old as Record<string, unknown> | undefined;
  const next = details.new as Record<string, unknown> | undefined;
  if (next && !prev) return "สร้างรายการใหม่";
  if (prev && !next) return "ลบรายการนี้ออกจากระบบ";

  const parts: string[] = [];
  const changed: string[] = [];
  if (next && prev) {
    for (const key of Object.keys(prev)) {
      if (key === "id" || key.endsWith("_at")) continue;
      if (String(prev[key]) !== String(next[key])) {
        changed.push(`${key}: ${prev[key]} → ${next[key]}`);
      }
    }
  }
  if (changed.length) parts.push(changed.join(" | "));
  const raw = JSON.stringify(details);
  if (raw.length > 300) parts.push(raw.slice(0, 300) + "...");
  return parts.join(" ") || "อัปเดตข้อมูล";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser("admin");
  const sp = await searchParams;

  const logs = await fetchAuditLogs({
    table: getParam(sp, "table"),
    action: getParam(sp, "action"),
    from: getParam(sp, "from"),
    to: getParam(sp, "to"),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <ScrollText className="h-6 w-6 text-amber-400" /> Audit Log
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          บันทึกรายการการเปลี่ยนแปลงทั้งหมดในระบบ (ดูได้เฉพาะ Admin)
        </p>
      </header>

      {/* Filter */}
      <form method="get" className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <select name="table" defaultValue={sp.table} className="input">
            <option value="">ทุกตาราง</option>
            <option value="machines">เครื่องจักร</option>
            <option value="alarms">Alarm</option>
            <option value="maintenance_records">บำรุงรักษา</option>
          </select>
          <select name="action" defaultValue={sp.action} className="input">
            <option value="">ทุกการกระทำ</option>
            <option value="INSERT">INSERT (เพิ่ม)</option>
            <option value="UPDATE">UPDATE (แก้ไข)</option>
            <option value="DELETE">DELETE (ลบ)</option>
          </select>
          <input type="date" name="from" defaultValue={sp.from} className="input" />
          <input type="date" name="to" defaultValue={sp.to} className="input" />
          <button type="submit" className="btn-primary">
            ค้นหา
          </button>
          <a href="/audit-log" className="btn-ghost">
            ล้าง
          </a>
        </div>
      </form>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">เวลา</th>
                <th className="px-4 py-3">ผู้ใช้</th>
                <th className="px-4 py-3">ตาราง</th>
                <th className="px-4 py-3">การกระทำ</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    ยังไม่มีบันทึก Audit Log นี้
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {new Date(log.created_at).toLocaleString("th-TH")}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {log.user_name || (log.user_id ? "ระบบ" : "-")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {TABLE_LABELS[log.table_name] ?? log.table_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ACTION_STYLES[log.action] ?? "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {log.record_id ? log.record_id.slice(0, 8) + "…" : "-"}
                  </td>
                  <td className="max-w-[360px] px-4 py-3 text-slate-300">
                    {summarize(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        บันทึกถูกสร้างโดยอัตโนมัติจาก Database Trigger ทุกครั้งที่มีการเพิ่ม / แก้ไข
        / ลบข้อมูล (แสดงล่าสุดสูงสุด 500 รายการ)
      </p>
    </div>
  );
}