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

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#a78bfa", "#f472b6", "#94a3b8"];

export default function AlarmByMachineChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-200">
        จำนวน Alarm แยกตามเครื่องจักร (Top)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 24, left: 8, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--chart-grid)" }}
              contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--glass-border)", borderRadius: 12, color: "var(--fg)" }}
              itemStyle={{ color: "var(--fg)" }}
            />
            <Bar dataKey="count" name="จำนวน Alarm" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}