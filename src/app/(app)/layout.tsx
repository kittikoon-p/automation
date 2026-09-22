import { redirect } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import { getUser } from "@/lib/db/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      userFullName={user.full_name}
      userEmail={user.email}
      userRole={user.role}
    >
      {children}
    </AppShell>
  );
}