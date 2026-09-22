"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Alarm {
  occurred_at: string;
}

export default function AlarmTrendChart({ alarms }: { alarms: Alarm[] }) {
  // Group alarms by day (last 14 days)
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const alarm of alarms) {
    const key = alarm.occurred_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const data = Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-200">
        จำนวน Alarm ต่อวัน (14 วันล่าสุด)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
          >
            <defs>
              <linearGradient id="alarmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={{ stroke: "var(--chart-grid)" }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--glass-border)", borderRadius: 12, color: "var(--fg)" }}
              itemStyle={{ color: "var(--fg)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="จำนวน Alarm"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#alarmGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}