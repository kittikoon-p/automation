import {
  Activity,
  AlertTriangle,
  Cog,
  Cpu,
  Hammer,
  PauseCircle,
  PlayCircle,
  Wrench,
  XCircle,
} from "lucide-react";

import StatCard from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import MachineStatusChart from "@/components/dashboard/machine-status-chart";
import AlarmStatusChart from "@/components/dashboard/alarm-status-chart";
import AlarmTrendChart from "@/components/dashboard/alarm-trend-chart";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/db/guard";

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createClient();

  const [machinesRes, alarmsRes, maintRes] = await Promise.all([
    supabase.from("machines").select("status"),
    supabase.from("alarms").select("status, occurred_at"),
    supabase.from("maintenance_records").select("status"),
  ]);

  const machines = machinesRes.data ?? [];
  const alarms = alarmsRes.data ?? [];
  const maintenance = maintRes.data ?? [];

  const totalMachines = machines.length;
  const running = machines.filter((m) => m.status === "Running").length;
  const stop = machines.filter((m) => m.status === "Stop").length;
  const alerting = machines.filter((m) => m.status === "Alarm").length;
  const maintaining = machines.filter((m) => m.status === "Maintenance").length;

  const openAlarms = alarms.filter((a) => a.status === "Open").length;
  const inProgressAlarms = alarms.filter(
    (a) => a.status === "In Progress"
  ).length;
  const closedAlarms = alarms.filter((a) => a.status === "Closed").length;

  const pendingMaint = maintenance.filter(
    (m) => m.status === "Pending"
  ).length;
  const inProgressMaint = maintenance.filter(
    (m) => m.status === "In Progress"
  ).length;
  const completedMaint = maintenance.filter(
    (m) => m.status === "Completed"
  ).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          ภาพรวมสถานะเครื่องจักร Alarm และงานบำรุงรักษา
        </p>
      </header>

      {/* Machine stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          เครื่องจักร
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={Cpu}
            label="เครื่องจักรทั้งหมด"
            value={totalMachines}
            accent="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={PlayCircle}
            label="Running"
            value={running}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={PauseCircle}
            label="Stop"
            value={stop}
            accent="bg-zinc-100 text-zinc-600"
          />
          <StatCard
            icon={AlertTriangle}
            label="Alarm"
            value={alerting}
            accent="bg-red-50 text-red-600"
          />
          <StatCard
            icon={Wrench}
            label="Maintenance"
            value={maintaining}
            accent="bg-amber-50 text-amber-600"
          />
        </div>
      </section>

      {/* Workload overview */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          งานที่ต้องติดตาม
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={AlertTriangle}
            label="Alarm ทั้งหมด"
            value={alarms.length}
            accent="bg-red-50 text-red-600"
          />
          <StatCard
            icon={Activity}
            label="Alarm เปิดค้าง (Open)"
            value={openAlarms}
            accent="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={Hammer}
            label="งานบำรุงรักษา"
            value={maintenance.length}
            accent="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={Cog}
            label="งานรอแก้ไข (Pending)"
            value={pendingMaint}
            accent="bg-purple-50 text-purple-600"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MachineStatusChart
          running={running}
          stop={stop}
          alarm={alerting}
          maintenance={maintaining}
        />
        <AlarmStatusChart
          open={openAlarms}
          inProgress={inProgressAlarms}
          closed={closedAlarms}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlarmTrendChart alarms={alarms} />
        {/* Status summary table */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700">
            สรุปสถานะงาน Maintenance
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="text-zinc-600">Pending</span>
              <StatusPill value="Pending"  />
              <span className="font-semibold text-zinc-900">{pendingMaint}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="text-zinc-600">In Progress</span>
              <StatusPill value="In Progress"  />
              <span className="font-semibold text-zinc-900">
                {inProgressMaint}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="text-zinc-600">Completed</span>
              <StatusPill value="Completed"  />
              <span className="font-semibold text-zinc-900">
                {completedMaint}
              </span>
            </li>
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
            <XCircle className="h-3.5 w-3.5" /> ข้อมูลอัปเดตตามฐานข้อมูลโดยตรง
          </p>
        </div>
      </section>
    </div>
  );
}
