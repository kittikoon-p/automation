"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

export default function AlarmStatusChart({
  open,
  inProgress,
  closed,
}: {
  open: number;
  inProgress: number;
  closed: number;
}) {
  const data = [
    { name: "Open", value: open },
    { name: "In Progress", value: inProgress },
    { name: "Closed", value: closed },
  ].filter((d) => d.value > 0);

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-200">
        สัดส่วนสถานะ Alarm
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "var(--chart-grid)" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--glass-border)", borderRadius: 12, color: "var(--fg)" }}
              itemStyle={{ color: "var(--fg)" }}
            />
            <Legend wrapperStyle={{ color: "var(--chart-tick)", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}