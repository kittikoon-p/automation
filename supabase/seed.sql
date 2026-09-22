-- ============================================================
-- Seed data - sample machines, alarms and maintenance records
-- Run AFTER schema.sql and AFTER signing up (so profiles exist).
-- ============================================================

insert into public.machines (machine_id, name, type, location, status) values
  ('MCH-001', 'Press Machine 1',   'Press',   'Building A', 'Running'),
  ('MCH-002', 'Press Machine 2',   'Press',   'Building A', 'Running'),
  ('MCH-003', 'CNC Milling 1',     'CNC',     'Building B', 'Stop'),
  ('MCH-004', 'CNC Milling 2',     'CNC',     'Building B', 'Running'),
  ('MCH-005', 'Injection Mold 1',  'Injection', 'Building C', 'Alarm'),
  ('MCH-006', 'Robot Welder 1',    'Robotic',  'Building D', 'Maintenance'),
  ('MCH-007', 'Conveyor Line 3',   'Conveyor', 'Building C', 'Running'),
  ('MCH-008', 'Packaging Line 1',  'Packaging', 'Building E', 'Stop'),
  ('MCH-009', 'Compressor 2',      'Utility',   'Building F', 'Alarm'),
  ('MCH-010', 'HVAC Unit 1',       'Utility',   'Building F', 'Running')
on conflict (machine_id) do nothing;

-- sample alarms (machine ids resolved via subquery)
insert into public.alarms (machine_id, alarm_code, alarm_description, occurred_at, cause, status)
select m.id, 'AL-1001', 'Overload current detected on main motor', now() - interval '1 hour', 'Motor bearing worn', 'Open'
from public.machines m where m.machine_id = 'MCH-005'
on conflict do nothing;

insert into public.alarms (machine_id, alarm_code, alarm_description, occurred_at, cause, status)
select m.id, 'AL-1002', 'Low air pressure in pneumatic circuit', now() - interval '3 hours', 'Air leak in hose', 'In Progress'
from public.machines m where m.machine_id = 'MCH-009'
on conflict do nothing;

insert into public.alarms (machine_id, alarm_code, alarm_description, occurred_at, cause, status)
select m.id, 'AL-0998', 'Door safety switch opened', now() - interval '1 day', 'Operator opened guard', 'Closed'
from public.machines m where m.machine_id = 'MCH-001'
on conflict do nothing;

insert into public.alarms (machine_id, alarm_code, alarm_description, occurred_at, cause, status)
select m.id, 'AL-1003', 'Servo drive error (axis over-travel)', now() - interval '5 hours', 'Limit switch misaligned', 'Open'
from public.machines m where m.machine_id = 'MCH-004'
on conflict do nothing;

-- sample maintenance records
insert into public.maintenance_records (machine_id, maintenance_type, problem, action_taken, technician, maintenance_date, status)
select m.id, 'Preventive (เชิงป้องกัน)', 'Lubrication overdue', 'Changed grease and oiled all moving parts', 'สมชาย ใจดี', current_date - 2, 'Completed'
from public.machines m where m.machine_id = 'MCH-003'
on conflict do nothing;

insert into public.maintenance_records (machine_id, maintenance_type, problem, action_taken, technician, maintenance_date, status)
select m.id, 'Corrective (แก้ไข)', 'Vibration abnormal', 'Replaced worn bearing and align shaft', 'อนุชา แก้วกล้า', current_date - 1, 'Completed'
from public.machines m where m.machine_id = 'MCH-005'
on conflict do nothing;

insert into public.maintenance_records (machine_id, maintenance_type, problem, action_taken, technician, maintenance_date, status)
select m.id, 'Corrective (แก้ไข)', 'Cooling fan not spinning', 'Replacing fan motor (waiting part)', 'สมชาย ใจดี', current_date, 'In Progress'
from public.machines m where m.machine_id = 'MCH-009'
on conflict do nothing;

insert into public.maintenance_records (machine_id, maintenance_type, problem, action_taken, technician, maintenance_date, status)
select m.id, 'Preventive (เชิงป้องกัน)', 'PM scheduled this week', 'Pend PM checklist for robot arm', 'อนุชา แก้วกล้า', current_date, 'Pending'
from public.machines m where m.machine_id = 'MCH-006'
on conflict do nothing;