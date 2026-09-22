"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  Cpu,
  Hammer,
  History,
  LayoutDashboard,
  Menu,
  ScrollText,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import SignOutButton from "@/components/auth/sign-out-button";
import ThemeToggle from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/machines", label: "เครื่องจักร", icon: Cpu, adminOnly: false },
  { href: "/alarms", label: "Alarm", icon: Bell, adminOnly: false },
  { href: "/maintenance", label: "บำรุงรักษา", icon: Hammer, adminOnly: false },
  { href: "/machine-history", label: "ประวัติเครื่องจักร", icon: History, adminOnly: false },
  { href: "/notifications", label: "การแจ้งเตือน", icon: BellRing, adminOnly: false },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText, adminOnly: true },
  { href: "/users", label: "จัดการผู้ใช้", icon: Users, adminOnly: true },
];

function RoleBadge({ role }: { role: string }) {
  const styles =
    role === "admin"
      ? "bg-violet-500/20 text-violet-700 dark:text-violet-300"
      : role === "viewer"
        ? "bg-sky-500/20 text-sky-700 dark:text-sky-300"
        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
  const label =
    role === "admin" ? "Admin" : role === "viewer" ? "Viewer" : "Technician";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles}`}
    >
      <span className="inline-block h-1 w-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Sidebar({
  pathname,
  isAdmin,
  userFullName,
  userEmail,
  userRole,
  notificationCount,
  onNavigate,
}: {
  pathname: string;
  isAdmin: boolean;
  userFullName: string;
  userEmail: string;
  userRole: string;
  notificationCount: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 font-black text-[#fff] shadow-[0_0_18px_rgba(14,165,233,0.5)]">
          M
        </div>
        <div>
          <p className="text-sm font-bold text-white">Automation</p>
          <p className="text-xs text-slate-400">Maintenance Manager</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {userRole === "viewer" && (
            <span className="hidden sm:inline-flex">
              <RoleBadge role={userRole} />
            </span>
          )}
          <ThemeToggle />
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
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-700 dark:text-cyan-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
              )}
              <item.icon
                className={`h-4 w-4 transition ${
                  active ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.href === "/notifications" && notificationCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-[#fff] shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="glass mb-3 flex items-center gap-3 rounded-xl p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-sm font-bold text-[#fff]">
            {userFullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {userFullName}
            </p>
            <p className="truncate text-xs text-slate-400">{userEmail}</p>
            <RoleBadge role={userRole} />
          </div>
          <Link
            href="/users"
            title="จัดการผู้ใช้"
            className={`icon-btn ${isAdmin ? "" : "pointer-events-none opacity-30"}`}
          >
            <UserCheck className="h-4 w-4" />
          </Link>
        </div>
        <SignOutButton compact />
      </div>
    </div>
  );
}

export default function AppShell({
  children,
  userFullName,
  userEmail,
  userRole,
  notificationCount,
}: {
  children: React.ReactNode;
  userFullName: string;
  userEmail: string;
  userRole: string;
  notificationCount: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = userRole === "admin";

  const sidebarProps = {
    pathname,
    isAdmin,
    userFullName,
    userEmail,
    userRole,
    notificationCount,
  };

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[var(--surface)]/95 px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 font-black text-[#fff] text-sm">
            M
          </div>
          <span className="text-sm font-bold text-white">Automation</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/notifications" className="icon-btn relative">
            <BellRing className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-[#fff]">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="icon-btn"
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[var(--surface)]/95 lg:flex">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-[var(--surface)]">
            <button
              onClick={() => setMobileOpen(false)}
              className="icon-btn absolute right-3 top-4 z-10"
              aria-label="ปิดเมนู"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="p-4 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}