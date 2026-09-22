import "server-only";

import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/auth";
import type { UserRole } from "@/lib/db/types";

/**
 * Ensures the current user is authenticated and (optionally) has a
 * required role. Redirects to /login or /dashboard on failure.
 */
export async function requireUser(role?: UserRole) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (role && user.role !== role) {
    redirect("/dashboard");
  }

  return user;
}