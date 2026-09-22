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

  const sp = await searchParams;
  const { machines, types } = await fetchMachines({
    search: getParam(sp, "search"),
    status: getParam(sp, "status"),
    type: getParam(sp, "type"),
    location: getParam(sp, "location"),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          เครื่องจักร (Machine Master)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          จัดการข้อมูลเครื่องจักร และสถานะประจำโรงงาน
        </p>
      </header>

      {/* Search & Filter (Advanced) */}
      <form method="get" className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              name="search"
              defaultValue={sp.search}
              placeholder="ค้นหา Machine ID หรือชื่อเครื่องจักร..."
              className="input pl-9"
            />
          </div>
          <select name="status" defaultValue={sp.status} className="input">
            <option value="">สถานะทั้งหมด</option>
            {MACHINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select name="type" defaultValue={sp.type} className="input">
            <option value="">ประเภททั้งหมด</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            name="location"
            defaultValue={sp.location}
            placeholder="ตำแหน่ง (Location)..."
            className="input"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              ค้นหา
            </button>
            <a href="/machines" className="btn-ghost">
              ล้าง
            </a>
          </div>
        </div>
      </form>

      <MachineManager machines={machines} role={user.role} />
    </div>
  );
}