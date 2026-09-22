import { Search } from "lucide-react";

import MaintenanceManager from "@/components/maintenance/maintenance-manager";
import { fetchMachineOptions, fetchMaintenanceRecords } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";
import { MAINTENANCE_STATUSES } from "@/lib/db/types";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const sp = await searchParams;
  const [records, machines] = await Promise.all([
    fetchMaintenanceRecords({
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
        <h1 className="text-2xl font-bold text-zinc-900">งานบำรุงรักษา</h1>
        <p className="mt-1 text-sm text-zinc-500">
          บันทึกและติดตามงานบำรุงรักษาเครื่องจักร
        </p>
      </header>

      {/* Search & Filter */}
      <form
        method="get"
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              name="search"
              defaultValue={sp.search}
              placeholder="ค้นหาปัญหา, การดำเนินการ หรือ ช่าง..."
              className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            name="status"
            defaultValue={sp.status}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">สถานะทั้งหมด</option>
            {MAINTENANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="machineId"
            defaultValue={sp.machineId}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">เครื่องจักรทั้งหมด</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_id} — {m.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="from"
            defaultValue={sp.from}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="date"
            name="to"
            defaultValue={sp.to}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              ค้นหา
            </button>
            <a
              href="/maintenance"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              ล้าง
            </a>
          </div>
        </div>
      </form>

      <MaintenanceManager
        records={records}
        machines={machines}
        isAdmin={isAdmin}
        currentUserName={user.full_name}
      />
    </div>
  );
}