import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Alarm,
  Machine,
  MaintenanceRecord,
} from "@/lib/db/types";

export interface MachineFilters {
  search?: string;
  status?: string;
  type?: string;
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
      `alarm_code.ilike.${pattern},alarm_description.ilike.${pattern}`
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
  if (filters.from) query = query.gte("maintenance_date", filters.from);
  if (filters.to) query = query.lte("maintenance_date", filters.to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MaintenanceRecord[];
}