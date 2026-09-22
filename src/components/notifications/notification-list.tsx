"use client";

import { useState } from "react";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { NotificationRow, NotificationType } from "@/lib/db/types";

const TYPE_STYLES: Record<NotificationType, string> = {
  alarm: "bg-red-500/20 text-red-700 dark:text-red-300",
  machine: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  maintenance: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  info: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
};

const TYPE_LABELS: Record<NotificationType, string> = {
  alarm: "Alarm",
  machine: "เครื่องจักร",
  maintenance: "บำรุงรักษา",
  info: "แจ้งเตือน",
};

export default function NotificationList({
  notifications,
}: {
  notifications: NotificationRow[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function markRead(id: string) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .is("read_at", null);
    router.refresh();
  }

  async function markAllRead() {
    setBusy(true);
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {notifications.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-slate-500">
          ยังไม่มีการแจ้งเตือน
        </div>
      )}

      {notifications.map((n) => {
        const unread = !n.read_at;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => unread && markRead(n.id)}
            disabled={!unread}
            className={`glass block w-full rounded-2xl p-4 text-left transition ${
              unread
                ? "border-cyan-400/40 hover:border-cyan-400/70"
                : "cursor-default opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLES[n.type] ?? TYPE_STYLES.info}`}
                  >
                    {TYPE_LABELS[n.type] ?? "info"}
                  </span>
                  <p className="truncate text-sm font-semibold text-white">
                    {n.title}
                  </p>
                  {unread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(n.created_at).toLocaleString("th-TH")}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      {notifications.length > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          disabled={busy}
          className="btn-primary"
        >
          <CheckCheck className="h-4 w-4" /> มาร์กอ่านทั้งหมด
        </button>
      )}
    </div>
  );
}