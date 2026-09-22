"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import SignOutButton from "@/components/auth/sign-out-button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/machines", label: "เครื่องจักร", adminOnly: false },
  { href: "/alarms", label: "Alarm", adminOnly: false },
  { href: "/maintenance", label: "บำรุงรักษา", adminOnly: false },
  { href: "/users", label: "จัดการผู้ใช้", adminOnly: true },
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
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            M
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Automation</p>
            <p className="text-xs text-zinc-500">Maintenance Manager</p>
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
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700">
              {userFullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {userFullName}
              </p>
              <p className="truncate text-xs text-zinc-500">{userEmail}</p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  userRole === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
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