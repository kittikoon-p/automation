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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700">
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
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}