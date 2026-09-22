import { redirect } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import { getUser } from "@/lib/db/auth";
import { fetchUnreadNotificationCount } from "@/lib/db/data";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  let notificationCount = 0;
  try {
    notificationCount = await fetchUnreadNotificationCount();
  } catch {
    notificationCount = 0;
  }

  return (
    <AppShell
      userFullName={user.full_name}
      userEmail={user.email}
      userRole={user.role}
      notificationCount={notificationCount}
    >
      {children}
    </AppShell>
  );
}