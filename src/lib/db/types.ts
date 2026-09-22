export const ROLES = ["admin", "technician", "viewer"] as const;
export type UserRole = (typeof ROLES)[number];

/** Writer roles can create/update alarms & maintenance; viewer is read-only. */
export function canWrite(role: UserRole): boolean {
  return role === "admin" || role === "technician";
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Machine {
  id: string;
  machine_id: string;
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  created_at: string;
  updated_at: string;
}

export const MACHINE_STATUSES = [
  "Running",
  "Stop",
  "Alarm",
  "Maintenance",
] as const;
export type MachineStatus = (typeof MACHINE_STATUSES)[number];

export interface Alarm {
  id: string;
  machine_id: string;
  alarm_code: string;
  alarm_description: string;
  occurred_at: string;
  cause: string | null;
  status: AlarmStatus;
  created_at: string;
  updated_at: string;
  machines?: Pick<Machine, "machine_id" | "name"> | null;
}

export const ALARM_STATUSES = ["Open", "In Progress", "Closed"] as const;
export type AlarmStatus = (typeof ALARM_STATUSES)[number];

export interface MaintenanceRecord {
  id: string;
  machine_id: string;
  maintenance_type: string;
  problem: string;
  action_taken: string;
  technician: string | null;
  maintenance_date: string;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
  machines?: Pick<Machine, "machine_id" | "name"> | null;
}

export const MAINTENANCE_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export interface MachineHistoryRow {
  id: string;
  machine_id: string;
  old_status: MachineStatus | null;
  new_status: MachineStatus;
  changed_by_name: string | null;
  created_at: string;
  machines?: Pick<Machine, "machine_id" | "name"> | null;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  table_name: string;
  record_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type NotificationType = "info" | "alarm" | "machine" | "maintenance";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}