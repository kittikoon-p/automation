"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Cpu,
  Hammer,
  LayoutDashboard,
  Users,
} from "lucide-react";

import SignOutButton from "@/components/auth/sign-out-button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/machines", label: "เครื่องจักร", icon: Cpu, adminOnly: false },
  { href: "/alarms", label: "Alarm", icon: Bell, adminOnly: false },
  { href: "/maintenance", label: "บำรุงรักษา", icon: Hammer, adminOnly: false },
  { href: "/users", label: "จัดการผู้ใช้", icon: Users, adminOnly: true },
];

export default function AppShell({
  children,
  userFullName,
  userEmail,
  userRole,
}: {
  children: React.ReactNode;
  userFullName: string;
  userEmail: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#0a101c]/95">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 font-black text-white shadow-[0_0_18px_rgba(14,165,233,0.5)]">
            M
          </div>
          <div>
            <p className="text-sm font-bold text-white">Automation</p>
            <p className="text-xs text-slate-400">Maintenance Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                )}
                <item.icon
                  className={`h-4 w-4 transition ${active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="glass mb-3 flex items-center gap-3 rounded-xl p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-sm font-bold text-white">
              {userFullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {userFullName}
              </p>
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  userRole === "admin"
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                <span className="inline-block h-1 w-1 rounded-full bg-current" />
                {userRole === "admin" ? "Admin" : "Technician"}
              </span>
            </div>
          </div>
          <SignOutButton compact />
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}