import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Alarm,
  AuditLogRow,
  Machine,
  MachineHistoryRow,
  MaintenanceRecord,
  NotificationRow,
} from "@/lib/db/types";

export interface MachineFilters {
  search?: string;
  status?: string;
  type?: string;
  location?: string;
}

export async function fetchMachines(filters: MachineFilters = {}): Promise<{
  machines: Machine[];
  types: string[];
}> {
  const supabase = await createClient();
  let query = supabase.from("machines").select("*").order("machine_id");

  if (filters.search) {
    // Search machine_id OR name (ilike via the PostgREST rangestart).
    const pattern = `%${filters.search}%`;
    query = query.or(`machine_id.ilike.${pattern},name.ilike.${pattern}`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const types = Array.from(new Set((data ?? []).map((m) => m.type)))
    .filter(Boolean)
    .sort();

  return { machines: (data ?? []) as Machine[], types };
}

export async function fetchMachineOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("machines")
    .select("id, machine_id, name, status")
    .order("machine_id");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchMaintenanceTypes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_records")
    .select("maintenance_type")
    .order("maintenance_type");

  if (error) throw new Error(error.message);
  return Array.from(
    new Set((data ?? []).map((r) => r.maintenance_type).filter(Boolean))
  ).sort();
}

export interface AlarmFilters {
  search?: string;
  status?: string;
  machineId?: string;
  from?: string;
  to?: string;
}

export async function fetchAlarms(filters: AlarmFilters = {}): Promise<Alarm[]> {
  const supabase = await createClient();
  let query = supabase
    .from("alarms")
    .select("*, machines(machine_id, name)")
    .order("occurred_at", { ascending: false });

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    query = query.or(
      `alarm_code.ilike.${pattern},alarm_description.ilike.${pattern},cause.ilike.${pattern}`
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.machineId) query = query.eq("machine_id", filters.machineId);
  if (filters.from) query = query.gte("occurred_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("occurred_at", `${filters.to}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Alarm[];
}

export interface MaintenanceFilters {
  search?: string;
  status?: string;
  machineId?: string;
  type?: string;
  from?: string;
  to?: string;
}

export async function fetchMaintenanceRecords(
  filters: MaintenanceFilters = {}
): Promise<MaintenanceRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("maintenance_records")
    .select("*, machines(machine_id, name)")
    .order("maintenance_date", { ascending: false });

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    query = query.or(
      `problem.ilike.${pattern},action_taken.ilike.${pattern},technician.ilike.${pattern}`
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.machineId) query = query.eq("machine_id", filters.machineId);
  if (filters.type) query = query.eq("maintenance_type", filters.type);
  if (filters.from) query = query.gte("maintenance_date", filters.from);
  if (filters.to) query = query.lte("maintenance_date", filters.to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MaintenanceRecord[];
}

export interface MachineHistoryFilters {
  machineId?: string;
  from?: string;
  to?: string;
}

export async function fetchMachineHistory(
  filters: MachineHistoryFilters = {}
): Promise<MachineHistoryRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("machine_history")
    .select("*, machines(machine_id, name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.machineId) query = query.eq("machine_id", filters.machineId);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MachineHistoryRow[];
}

export interface AuditFilters {
  table?: string;
  action?: string;
  from?: string;
  to?: string;
}

export async function fetchAuditLogs(filters: AuditFilters = {}): Promise<
  AuditLogRow[]
> {
  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.table) query = query.eq("table_name", filters.table);
  if (filters.action) query = query.eq("action", filters.action.toUpperCase());
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditLogRow[];
}

export async function fetchMyNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as NotificationRow[];
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}