"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS: Record<string, string> = {
  Running: "#10b981",
  Stop: "#a1a1aa",
  Alarm: "#ef4444",
  Maintenance: "#f59e0b",
};

export default function MachineStatusChart({
  running,
  stop,
  alarm,
  maintenance,
}: {
  running: number;
  stop: number;
  alarm: number;
  maintenance: number;
}) {
  const data = [
    { name: "Running", value: running },
    { name: "Stop", value: stop },
    { name: "Alarm", value: alarm },
    { name: "Maintenance", value: maintenance },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-200">
        สถานะเครื่องจักรทั้งหมด
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={{ stroke: "var(--chart-grid)" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--chart-grid)" }}
              contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--glass-border)", borderRadius: 12, color: "var(--fg)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#38bdf8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}