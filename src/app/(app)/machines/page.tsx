import { Search } from "lucide-react";

import MachineManager from "@/components/machines/machine-manager";
import { fetchMachines } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";
import { MACHINE_STATUSES } from "@/lib/db/types";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const sp = await searchParams;
  const { machines, types } = await fetchMachines({
    search: getParam(sp, "search"),
    status: getParam(sp, "status"),
    type: getParam(sp, "type"),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">
          เครื่องจักร (Machine Master)
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          จัดการข้อมูลเครื่องจักร และสถานะประจ าโรงงาน
        </p>
      </header>

      {/* Search & Filter */}
      <form
        method="get"
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              name="search"
              defaultValue={sp.search}
              placeholder="ค้นหา Machine ID หรือชื่อเครื่องจักร..."
              className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            name="status"
            defaultValue={sp.status}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">สถานะทั้งหมด</option>
            {MACHINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={sp.type}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">ประเภททั้งหมด</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              ค้นหา
            </button>
            <a
              href="/machines"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              ล้าง
            </a>
          </div>
        </div>
      </form>

      <MachineManager machines={machines} isAdmin={isAdmin} />
    </div>
  );
}