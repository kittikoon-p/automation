import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserWithProfile } from "@/lib/db/types";

/**
 * Returns the authenticated user joined with their profile (role), or null.
 * Wrapped in React cache() so pages drawing the same info only query once.
 */
export const getUser = cache(async (): Promise<UserWithProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    role: profile?.role ?? "technician",
  };
});

export type MaybeUser = UserWithProfile | null;
export type { UserRole } from "@/lib/db/types";