import { Search } from "lucide-react";

import AlarmManager from "@/components/alarms/alarm-manager";
import { fetchAlarms, fetchMachineOptions } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";
import { ALARM_STATUSES } from "@/lib/db/types";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export default async function AlarmsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const [alarms, machines] = await Promise.all([
    fetchAlarms({
      search: getParam(sp, "search"),
      status: getParam(sp, "status"),
      machineId: getParam(sp, "machineId"),
      from: getParam(sp, "from"),
      to: getParam(sp, "to"),
    }),
    fetchMachineOptions(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">บันทึก Alarm</h1>
        <p className="mt-1 text-sm text-slate-400">
          บันทึกและติดตามสถานะ Alarm ของเครื่องจักร
        </p>
      </header>

      {/* Search & Filter */}
      <form method="get" className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              name="search"
              defaultValue={sp.search}
              placeholder="ค้นหา Alarm Code หรือ Description..."
              className="input pl-9"
            />
          </div>
          <select name="status" defaultValue={sp.status} className="input">
            <option value="">สถานะทั้งหมด</option>
            {ALARM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              ค้นหา
            </button>
            <a href="/alarms" className="btn-ghost">
              ล้าง
            </a>
          </div>
        </div>
      </form>

      <AlarmManager alarms={alarms} machines={machines} role={user.role} />
    </div>
  );
}