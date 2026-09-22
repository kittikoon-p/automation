import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cog,
  Cpu,
  Gauge,
  Hammer,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";

import AlarmByMachineChart from "@/components/dashboard/alarm-by-machine-chart";
import AlarmStatusChart from "@/components/dashboard/alarm-status-chart";
import AlarmTrendChart from "@/components/dashboard/alarm-trend-chart";
import MachineStatusChart from "@/components/dashboard/machine-status-chart";
import StatCard from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/db/guard";

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createClient();

  const [machinesRes, alarmsRes, maintRes, alarmMachinesRes] = await Promise.all([
    supabase.from("machines").select("status"),
    supabase.from("alarms").select("status, occurred_at"),
    supabase.from("maintenance_records").select("status"),
    supabase.from("alarms").select("machine_id, machines(machine_id, name)"),
  ]);

  const machines = machinesRes.data ?? [];
  const alarms = alarmsRes.data ?? [];
  const maintenance = maintRes.data ?? [];
  const alarmMachines = alarmMachinesRes.data ?? [];

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

  // Alarm analysis
  const closeRate =
    alarms.length > 0 ? Math.round((closedAlarms / alarms.length) * 100) : 0;
  const avgPerDay =
    alarms.length > 0 ? (alarms.length / 14).toFixed(1) : "0";
  const perMachine = new Map<
    string,
    { name: string; count: number }
  >();
  for (const a of alarmMachines as unknown as {
    machine_id?: string;
    machines?: { machine_id?: string; name?: string } | null;
  }[]) {
    const label = a.machines?.machine_id ?? a.machine_id ?? "ไม่ทราบเครื่อง";
    const entry = perMachine.get(label) ?? {
      name: a.machines?.name ?? label,
      count: 0,
    };
    entry.count += 1;
    perMachine.set(label, entry);
  }
  const topMachines = Array.from(perMachine.entries())
    .map(([key, v]) => ({ name: v.name || key, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const topMachine = topMachines[0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          ภาพรวมสถานะเครื่องจักร Alarm งานบำรุงรักษา และการวิเคราะห์
        </p>
      </header>

      {/* Machine stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          เครื่องจักร
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={Cpu}
            label="เครื่องจักรทั้งหมด"
            value={totalMachines}
            accent="bg-blue-500/20 text-blue-700 dark:text-blue-300"
          />
          <StatCard
            icon={PlayCircle}
            label="Running"
            value={running}
            accent="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          />
          <StatCard
            icon={PauseCircle}
            label="Stop"
            value={stop}
            accent="bg-slate-500/20 text-slate-700 dark:text-slate-300"
          />
          <StatCard
            icon={AlertTriangle}
            label="Alarm"
            value={alerting}
            accent="bg-red-500/20 text-red-700 dark:text-red-300"
          />
          <StatCard
            icon={Wrench}
            label="Maintenance"
            value={maintaining}
            accent="bg-amber-500/20 text-amber-700 dark:text-amber-300"
          />
        </div>
      </section>

      {/* Workload overview */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          งานที่ต้องติดตาม
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={AlertTriangle}
            label="Alarm ทั้งหมด"
            value={alarms.length}
            accent="bg-red-500/20 text-red-700 dark:text-red-300"
          />
          <StatCard
            icon={Activity}
            label="Alarm เปิดค้าง (Open)"
            value={openAlarms}
            accent="bg-orange-500/20 text-orange-700 dark:text-orange-300"
          />
          <StatCard
            icon={Hammer}
            label="งานบำรุงรักษา"
            value={maintenance.length}
            accent="bg-amber-500/20 text-amber-700 dark:text-amber-300"
          />
          <StatCard
            icon={Cog}
            label="งานรอแก้ไข (Pending)"
            value={pendingMaint}
            accent="bg-purple-500/20 text-purple-700 dark:text-purple-300"
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

      {/* Alarm analysis */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <BarChart3 className="h-4 w-4" /> วิเคราะห์ Alarm
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Gauge}
            label="อัตราการปิด Alarm (Close Rate)"
            value={`${closeRate}%`}
            accent="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          />
          <StatCard
            icon={TrendingUp}
            label="Alarm เฉลี่ยต่อวัน (14 วัน)"
            value={avgPerDay}
            accent="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
          />
          <StatCard
            icon={Cpu}
            label="เครื่องจักรที่ Alarm บ่อยที่สุด"
            value={topMachine ? `${topMachine.name} (${topMachine.count})` : "—"}
            accent="bg-red-500/20 text-red-700 dark:text-red-300"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AlarmByMachineChart data={topMachines} />
          <AlarmTrendChart alarms={alarms} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status summary table */}
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">
            สรุปสถานะงาน Maintenance
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-slate-400">Pending</span>
              <StatusPill value="Pending" />
              <span className="font-semibold text-white">{pendingMaint}</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-slate-400">In Progress</span>
              <StatusPill value="In Progress" />
              <span className="font-semibold text-white">
                {inProgressMaint}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-slate-400">Completed</span>
              <StatusPill value="Completed" />
              <span className="font-semibold text-white">
                {completedMaint}
              </span>
            </li>
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <XCircle className="h-3.5 w-3.5" /> ข้อมูลอัปเดตตามฐานข้อมูลโดยตรง
          </p>
        </div>
      </section>
    </div>
  );
}