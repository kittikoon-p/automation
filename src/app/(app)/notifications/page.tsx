import { Bell, BellRing } from "lucide-react";

import NotificationList from "@/components/notifications/notification-list";
import DbSetupNotice from "@/components/ui/db-setup-notice";
import { fetchMyNotifications } from "@/lib/db/data";
import { requireUser } from "@/lib/db/guard";

export default async function NotificationsPage() {
  await requireUser();
  let notifications: Awaited<ReturnType<typeof fetchMyNotifications>> = [];
  let dbReady = true;
  try {
    notifications = await fetchMyNotifications();
  } catch {
    dbReady = false;
  }
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6">
      {!dbReady && <DbSetupNotice />}
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          {unread > 0 ? (
            <BellRing className="h-6 w-6 text-cyan-400" />
          ) : (
            <Bell className="h-6 w-6 text-slate-400" />
          )}
          การแจ้งเตือน
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {unread > 0
            ? `คุณมีการแจ้งเตือนที่ยังไม่ได้อ่าน ${unread} รายการ`
            : "ไม่มีข้อความที่ยังไม่ได้อ่าน"}
        </p>
      </header>

      <NotificationList notifications={notifications} />
    </div>
  );
}