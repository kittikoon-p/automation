import { describe, expect, it } from "vitest";

import {
  alarmSchema,
  machineSchema,
  maintenanceSchema,
  flattenZodError,
} from "@/lib/validation";

describe("machineSchema", () => {
  it("accepts a valid machine", () => {
    const result = machineSchema.safeParse({
      machine_id: "MCH-001",
      name: "Press Machine 1",
      type: "Press",
      location: "Building A",
      status: "Running",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty Machine ID", () => {
    const result = machineSchema.safeParse({
      machine_id: "  ",
      name: "Press Machine 1",
      type: "Press",
      location: "Building A",
      status: "Running",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(flattenZodError(result.error)).toContain(
        "Machine ID ต้องไม่เว้นว่าง"
      );
    }
  });

  it("rejects invalid characters in Machine ID", () => {
    const result = machineSchema.safeParse({
      machine_id: "MCH 001!",
      name: "Press Machine 1",
      type: "Press",
      location: "Building A",
      status: "Running",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = machineSchema.safeParse({
      machine_id: "MCH-001",
      name: "",
      type: "",
      location: "Building A",
      status: "Running",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(flattenZodError(result.error)).toContain(
        "ชื่อเครื่องจักร (Machine Name) ต้องไม่เว้นว่าง"
      );
      expect(flattenZodError(result.error)).toContain(
        "ประเภทเครื่องจักร (Machine Type) ต้องไม่เว้นว่าง"
      );
    }
  });

  it("rejects an invalid status value", () => {
    const result = machineSchema.safeParse({
      machine_id: "MCH-001",
      name: "Press Machine 1",
      type: "Press",
      location: "Building A",
      status: "Idle",
    });
    expect(result.success).toBe(false);
  });
});

describe("alarmSchema", () => {
  it("accepts a valid alarm", () => {
    const result = alarmSchema.safeParse({
      machine_id: "6c9bd1c4-92f0-4b1a-8a2e-123456789abc",
      alarm_code: "AL-1001",
      alarm_description: "Overload current detected",
      occurred_at: "2026-09-22T10:00",
      cause: "",
      status: "Open",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when machine is not selected", () => {
    const result = alarmSchema.safeParse({
      machine_id: "not-a-uuid",
      alarm_code: "AL-1001",
      alarm_description: "Overload current detected",
      occurred_at: "2026-09-22T10:00",
      cause: "",
      status: "Open",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(flattenZodError(result.error)).toContain("กรุณาเลือกเครื่องจักร");
    }
  });

  it("rejects empty alarm description", () => {
    const result = alarmSchema.safeParse({
      machine_id: "6c9bd1c4-92f0-4b1a-8a2e-123456789abc",
      alarm_code: "AL-1001",
      alarm_description: "",
      occurred_at: "2026-09-22T10:00",
      cause: "",
      status: "Open",
    });
    expect(result.success).toBe(false);
  });
});

describe("maintenanceSchema", () => {
  it("accepts a valid maintenance record", () => {
    const result = maintenanceSchema.safeParse({
      machine_id: "6c9bd1c4-92f0-4b1a-8a2e-123456789abc",
      maintenance_type: "Preventive (เชิงป้องกัน)",
      problem: "Lubrication overdue",
      action_taken: "Changed grease and oiled parts",
      technician: "สมชาย ใจดี",
      maintenance_date: "2026-09-22",
      status: "Completed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = maintenanceSchema.safeParse({
      machine_id: "6c9bd1c4-92f0-4b1a-8a2e-123456789abc",
      maintenance_type: "",
      problem: "",
      action_taken: "Replaced part",
      technician: "",
      maintenance_date: "",
      status: "Pending",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = flattenZodError(result.error);
      expect(msgs).toContain("ประเภทงานบำรุงรักษา ต้องไม่เว้นว่าง");
      expect(msgs).toContain("ปัญหา (Problem) ต้องไม่เว้นว่าง");
      expect(msgs).toContain("วันที่ต้องไม่เว้นว่าง");
    }
  });
});