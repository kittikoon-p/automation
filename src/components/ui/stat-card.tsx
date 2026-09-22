import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = "bg-blue-500/20 text-blue-300",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition hover:border-cyan-400/40">
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />
      </div>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent} shadow-lg`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}