const DOT: Record<string, string> = {
  Running: "bg-emerald-400",
  Stop: "bg-slate-400",
  Alarm: "bg-red-400",
  Maintenance: "bg-amber-400",
  Open: "bg-red-400",
  "In Progress": "bg-amber-400",
  Closed: "bg-emerald-400",
  Pending: "bg-slate-400",
  Completed: "bg-emerald-400",
};

const BG: Record<string, string> = {
  Running: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Stop: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  Alarm: "bg-red-500/15 text-red-300 border-red-400/30",
  Maintenance: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  Open: "bg-red-500/15 text-red-300 border-red-400/30",
  "In Progress": "bg-amber-500/15 text-amber-300 border-amber-400/30",
  Closed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Pending: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  Completed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BG[value] ?? "bg-blue-500/15 text-blue-300 border-blue-400/30"}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT[value] ?? "bg-blue-400"}`} />
      {value}
    </span>
  );
}