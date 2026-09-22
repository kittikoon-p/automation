import { History } from "lucide-react";

import DbSetupNotice from "@/components/ui/db-setup-notice";
import { StatusPill } from "@/components/ui/status-pill";
import { fetchMachineHistory, fetchMachineOptions } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export default async function MachineHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;

  let history: Awaited<ReturnType<typeof fetchMachineHistory>> = [];
  let machines: Awaited<ReturnType<typeof fetchMachineOptions>> = [];
  let dbReady = true;
  try {
    [history, machines] = await Promise.all([
      fetchMachineHistory({
        machineId: getParam(sp, "machineId"),
        from: getParam(sp, "from"),
        to: getParam(sp, "to"),
      }),
      fetchMachineOptions(),
    ]);
  } catch {
    dbReady = false;
  }

  return (
    <div className="space-y-6">
      {!dbReady && <DbSetupNotice />}
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <History className="h-6 w-6 text-violet-400" /> ประวัติเครื่องจักร
          (Machine History)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          บันทึกการเปลี่ยนแปลงสถานะของเครื่องจักร อัตโนมัติทุกครั้งที่อัปเดต
        </p>
      </header>

      {/* Filter */}
      <form method="get" className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select name="machineId" defaultValue={sp.machineId} className="input">
            <option value="">เครื่องจักรทั้งหมด</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_id} — {m.name}
              </option>
            ))}
          </select>
          <input type="date" name="from" defaultValue={sp.from} className="input" />
          <input type="date" name="to" defaultValue={sp.to} className="input" />
          <button type="submit" className="btn-primary">
            ค้นหา
          </button>
          <a href="/machine-history" className="btn-ghost">
            ล้าง
          </a>
        </div>
      </form>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">เครื่องจักร</th>
                <th className="px-4 py-3">สถานะเดิม</th>
                <th className="px-4 py-3">สถานะใหม่</th>
                <th className="px-4 py-3">ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    ยังไม่มีประวัติการเปลี่ยนแปลง (รอการบันทึกจากระบบ)
                  </td>
                </tr>
              )}
              {history.map((h) => (
                <tr key={h.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {new Date(h.created_at).toLocaleString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-white">
                      {h.machines?.machine_id ?? "-"}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {h.machines?.name ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {h.old_status ? (
                      <StatusPill value={h.old_status} />
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill value={h.new_status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {h.changed_by_name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        แสดงรายการล่าสุดสูงสุด 500 รายการ และสรุปสถานะใหม่ล่าสุดของเครื่องจักรแต่ละเครื่อง
      </p>
    </div>
  );
}