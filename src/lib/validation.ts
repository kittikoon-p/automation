import { z } from "zod";
import {
  ALARM_STATUSES,
  MACHINE_STATUSES,
  MAINTENANCE_STATUSES,
} from "@/lib/db/types";

const requiredText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} ต้องไม่เว้นว่าง`)
    .max(max, `${label} ยาวเกินไป (สูงสุด ${max} ตัวอักษร)`);

export const machineSchema = z.object({
  machine_id: z
    .string()
    .trim()
    .min(1, "Machine ID ต้องไม่เว้นว่าง")
    .max(50, "Machine ID ยาวเกินไป (สูงสุด 50 ตัวอักษร)")
    .regex(/^[A-Za-z0-9_-]+$/, "Machine ID ใช้ได้เฉพาะ A-Z, 0-9, _ และ -"),
  name: requiredText("ชื่อเครื่องจักร (Machine Name)", 100),
  type: requiredText("ประเภทเครื่องจักร (Machine Type)", 100),
  location: requiredText("ตำแหน่งที่ตั้ง (Location)", 100),
  status: z.enum(MACHINE_STATUSES, {
    message: "กรุณาเลือกสถานะที่ถูกต้อง",
  }),
});

export const alarmSchema = z.object({
  machine_id: z.string().uuid("กรุณาเลือกเครื่องจักร"),
  alarm_code: requiredText("Alarm Code", 50),
  alarm_description: requiredText("Alarm Description", 500),
  occurred_at: z.string().min(1, "วันที่/เวลา ต้องไม่เว้นว่าง"),
  cause: z
    .union([z.string().trim().max(500, "สาเหตุยาวเกินไป"), z.literal("")])
    .optional(),
  status: z.enum(ALARM_STATUSES, {
    message: "กรุณาเลือกสถานะที่ถูกต้อง",
  }),
});

export const maintenanceSchema = z.object({
  machine_id: z.string().uuid("กรุณาเลือกเครื่องจักร"),
  maintenance_type: requiredText("ประเภทงานบำรุงรักษา", 100),
  problem: requiredText("ปัญหา (Problem)", 500),
  action_taken: requiredText("การดำเนินการ (Action Taken)", 500),
  technician: z
    .union([z.string().trim().max(100, "ชื่อช่างยาวเกินไป"), z.literal("")])
    .optional(),
  maintenance_date: z.string().min(1, "วันที่ต้องไม่เว้นว่าง"),
  status: z.enum(MAINTENANCE_STATUSES, {
    message: "กรุณาเลือกสถานะที่ถูกต้อง",
  }),
});

export type MachineInput = z.infer<typeof machineSchema>;
export type AlarmInput = z.infer<typeof alarmSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export function flattenZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}