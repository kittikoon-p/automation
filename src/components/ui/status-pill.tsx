export function StatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    // machine
    Running: "bg-emerald-100 text-emerald-700",
    Stop: "bg-zinc-200 text-zinc-700",
    Alarm: "bg-red-100 text-red-700",
    Maintenance: "bg-amber-100 text-amber-700",
    // alarm
    Open: "bg-red-100 text-red-700",
    "In Progress": "bg-amber-100 text-amber-700",
    Closed: "bg-emerald-100 text-emerald-700",
    // maintenance
    Pending: "bg-zinc-200 text-zinc-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[value] ?? "bg-blue-100 text-blue-700"}`}
    >
      {value}
    </span>
  );
}