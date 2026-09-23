-- ============================================================
-- Seed data - sample machines, alarms and maintenance records
-- Run AFTER schema.sql and AFTER signing up (so profiles exist).
--
-- ข้อมูลตัวอย่างหลากประเภทสำหรับ Demo ทั้งระบบ:
--   - 24 เครื่องจักร (11 ประเภท, 7 อาคาร, ครบทุกสถานะ)
--   - 41 Alarm (Open / In Progress / Closed, กระจาย ~37 วันล่าสุด)
--   - 25 งานบำรุงรักษา (6 ประเภทงาน, ครบทุกสถานะ, กระจาย ~40 วัน)
--   - ประวัติเปลี่ยนสถานะเครื่องจักรย้อนหลัง (Machine History)
--
-- สคริปต์นี้ IDEMPOTENT: รันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ
-- (machines = on conflict, alarms = คุมด้วย alarm_code,
--  maintenance = คุมด้วย machine + problem, history = คุมด้วย transition)
--
-- Trigger ใน schema จะสร้าง machine_history / audit_logs / notifications
-- ให้อัตโนมัติระหว่างรันสคริปต์นี้ด้วย
-- ============================================================

-- ------------------------------------------------------------------
-- 1. MACHINES (Machine Master) - 24 เครื่อง หลากหลาย type/location/status
-- ------------------------------------------------------------------
insert into public.machines (machine_id, name, type, location, status) values
  ('MCH-001', 'Press Machine 1',      'Press',     'Building A', 'Running'),
  ('MCH-002', 'Press Machine 2',      'Press',     'Building A', 'Running'),
  ('MCH-003', 'CNC Milling 1',        'CNC',       'Building B', 'Stop'),
  ('MCH-004', 'CNC Milling 2',        'CNC',       'Building B', 'Running'),
  ('MCH-005', 'Injection Mold 1',     'Injection', 'Building C', 'Alarm'),
  ('MCH-006', 'Robot Welder 1',       'Robotic',   'Building D', 'Maintenance'),
  ('MCH-007', 'Conveyor Line 3',      'Conveyor',  'Building C', 'Running'),
  ('MCH-008', 'Packaging Line 1',     'Packaging', 'Building E', 'Stop'),
  ('MCH-009', 'Compressor 2',         'Utility',   'Building F', 'Alarm'),
  ('MCH-010', 'HVAC Unit 1',          'Utility',   'Building F', 'Running'),
  ('MCH-011', 'Lathe Machine 1',      'Lathe',     'Building B', 'Running'),
  ('MCH-012', 'Lathe Machine 2',      'Lathe',     'Building B', 'Stop'),
  ('MCH-013', 'Grinder 1',            'Grinding',  'Building B', 'Running'),
  ('MCH-014', 'Robot Welder 2',       'Robotic',   'Building D', 'Running'),
  ('MCH-015', 'Laser Cutter 1',       'Cutting',   'Building D', 'Alarm'),
  ('MCH-016', 'Plasma Cutter 1',      'Cutting',   'Building D', 'Running'),
  ('MCH-017', 'Filling Line 1',       'Packaging', 'Building E', 'Running'),
  ('MCH-018', 'Labeling Machine 1',   'Packaging', 'Building E', 'Stop'),
  ('MCH-019', 'Palletizer 1',         'Robotic',   'Building E', 'Running'),
  ('MCH-020', 'Chiller 1',            'Utility',   'Building F', 'Maintenance'),
  ('MCH-021', 'Boiler 1',             'Utility',   'Building F', 'Running'),
  ('MCH-022', 'Water Pump 1',         'Utility',   'Building G', 'Running'),
  ('MCH-023', 'Assembly Line 1',      'Assembly',  'Building C', 'Running'),
  ('MCH-024', 'Assembly Line 2',      'Assembly',  'Building C', 'Alarm')
on conflict (machine_id) do nothing;

-- ------------------------------------------------------------------
-- 2. ALARMS - 41 รายการ กระจายย้อนหลัง ~37 วัน (กราฟ 14 วันมีข้อมูลเต็ม)
--    คุม idempotency ด้วย alarm_code
-- ------------------------------------------------------------------
insert into public.alarms (machine_id, alarm_code, alarm_description, occurred_at, cause, status)
select m.id, v.code, v.description, now() - make_interval(hours => v.hours), v.cause, v.status::public.alarm_status
from (values
  -- เดิมจาก seed รุ่นก่อน (ข้ามถ้ามีอยู่แล้ว)
  ('MCH-001', 'AL-0998', 'Door safety switch opened',                      24,  'Operator opened guard',            'Closed'),
  ('MCH-005', 'AL-1001', 'Overload current detected on main motor',        1,   'Motor bearing worn',               'Open'),
  ('MCH-009', 'AL-1002', 'Low air pressure in pneumatic circuit',          3,   'Air leak in hose',                 'In Progress'),
  ('MCH-004', 'AL-1003', 'Servo drive error (axis over-travel)',           5,   'Limit switch misaligned',          'Open'),
  -- รายการใหม่
  ('MCH-015', 'AL-1004', 'Laser source temperature too high',              2,   'Cooling water flow low',           'Open'),
  ('MCH-024', 'AL-1005', 'Station 2 torque out of specification',          7,   'Worn socket holder',               'In Progress'),
  ('MCH-005', 'AL-1006', 'Heat zone 3 temperature deviation',              12,  'Thermocouple wire loose',          'Open'),
  ('MCH-003', 'AL-1007', 'Spindle overload during roughing',               18,  'Tool wear exceeded limit',         'Closed'),
  ('MCH-009', 'AL-1008', 'Discharge pressure high',                        26,  'Dirty suction filter',             'In Progress'),
  ('MCH-006', 'AL-1009', 'Servo following error axis Z',                   30,  'Cable carrier damaged',            'Closed'),
  ('MCH-002', 'AL-1010', 'Hydraulic oil temperature high',                 36,  'Oil cooler blocked',               'Closed'),
  ('MCH-007', 'AL-1011', 'Photo sensor not detecting box',                 40,  'Sensor lens dirty',                'Closed'),
  ('MCH-005', 'AL-1012', 'Mold not closing completely',                    50,  'Foreign material on mold face',    'In Progress'),
  ('MCH-020', 'AL-1013', 'Chiller high pressure trip',                     55,  'Condenser coil dirty',             'Open'),
  ('MCH-008', 'AL-1014', 'Sealing jaw temperature low',                    60,  'Heater strip broken',              'Closed'),
  ('MCH-004', 'AL-1015', 'Tool change failed (pot mismatch)',              70,  'Pot repeatability drift',          'Closed'),
  ('MCH-017', 'AL-1016', 'Fill volume below setpoint',                     80,  'Nozzle partially blocked',         'In Progress'),
  ('MCH-012', 'AL-1017', 'Chuck pressure loss',                            90,  'Clamp seal leaking',               'Closed'),
  ('MCH-024', 'AL-1018', 'Fixture clamp not locked',                       95,  'Proximity switch faulty',          'Open'),
  ('MCH-010', 'AL-1019', 'Filter differential pressure high',              100, 'Filter element due for change',    'Closed'),
  ('MCH-001', 'AL-1020', 'Ram position deviation',                         110, 'Encoder coupling loose',           'Closed'),
  ('MCH-018', 'AL-1021', 'Label web break',                                120, 'Label roll tension lost',          'Closed'),
  ('MCH-015', 'AL-1022', 'Beam quality check failed',                      130, 'Optics need cleaning',             'In Progress'),
  ('MCH-005', 'AL-1023', 'Ejector stroke incomplete',                      140, 'Ejector pin bent',                 'Closed'),
  ('MCH-009', 'AL-1024', 'Emergency stop circuit trip',                    155, 'E-stop button pressed',            'Closed'),
  ('MCH-021', 'AL-1025', 'Burner flame failure',                           165, 'Igniter electrode dirty',          'Open'),
  ('MCH-003', 'AL-1026', 'Coolant level low',                              180, 'Coolant leak at fitting',          'Closed'),
  ('MCH-014', 'AL-1027', 'Wire feed speed abnormal',                       195, 'Wire spool tension loose',         'Closed'),
  ('MCH-007', 'AL-1028', 'Motor overload conveyor',                        210, 'Belt misaligned or jammed',        'Closed'),
  ('MCH-024', 'AL-1029', 'Riveting force out of range',                    230, 'Rivet feeder jam',                 'In Progress'),
  ('MCH-019', 'AL-1030', 'Gripper vacuum lost',                            250, 'Vacuum cup worn',                  'Closed'),
  ('MCH-002', 'AL-1031', 'Safety light curtain interrupted',               270, 'Material staged in light path',    'Closed'),
  ('MCH-006', 'AL-1032', 'Teach pendant communication lost',               300, 'Cable connector loose',            'Closed'),
  ('MCH-008', 'AL-1033', 'Film reel diameter sensor error',                330, 'Sensor misaligned',               'Closed'),
  ('MCH-005', 'AL-1034', 'Injection pressure not reached',                 360, 'Check valve leaking',              'Closed'),
  ('MCH-022', 'AL-1035', 'Pump cavitation noise',                          400, 'Suction strainer clogged',         'Closed'),
  ('MCH-013', 'AL-1036', 'Wheel dressing required',                        450, 'Grinding wheel loaded',            'Closed'),
  ('MCH-004', 'AL-1037', 'Chip conveyor jam',                              500, 'Chip buildup in chute',            'Closed'),
  ('MCH-017', 'AL-1038', 'Capper torque out of specification',             550, 'Chuck wear',                       'Closed'),
  ('MCH-001', 'AL-1039', 'Oil mist pressure low',                          700, 'Oil line filter clogged',          'Closed'),
  ('MCH-015', 'AL-1040', 'Extraction fan not running',                     900, 'Fan belt broken',                  'Closed')
) as v(machine_key, code, description, hours, cause, status)
join public.machines m on m.machine_id = v.machine_key
where not exists (
  select 1 from public.alarms a where a.alarm_code = v.code
);

-- ------------------------------------------------------------------
-- 3. MAINTENANCE RECORDS - 25 รายการ หลายประเภทงาน/สถานะ กระจาย ~40 วัน
--    คุม idempotency ด้วย (machine_id + problem)
-- ------------------------------------------------------------------
insert into public.maintenance_records (machine_id, maintenance_type, problem, action_taken, technician, maintenance_date, status)
select m.id, v.mtype, v.problem, v.action, v.tech, current_date - v.days, v.status::public.maint_status
from (values
  -- เดิมจาก seed รุ่นก่อน (ข้ามถ้ามีอยู่แล้ว)
  ('MCH-003', 'Preventive (เชิงป้องกัน)',        'Lubrication overdue',            'Changed grease and oiled all moving parts',        'สมชาย ใจดี',    2,  'Completed'),
  ('MCH-005', 'Corrective (แก้ไข)',               'Vibration abnormal',             'Replaced worn bearing and align shaft',           'อนุชา แก้วกล้า', 1,  'Completed'),
  ('MCH-009', 'Corrective (แก้ไข)',               'Cooling fan not spinning',       'Replacing fan motor (waiting part)',              'สมชาย ใจดี',    0,  'In Progress'),
  ('MCH-006', 'Preventive (เชิงป้องกัน)',        'PM scheduled this week',         'Pend PM checklist for robot arm',                 'อนุชา แก้วกล้า', 0,  'Pending'),
  -- รายการใหม่
  ('MCH-001', 'Predictive (ทำนายความเสียหาย)',   'Motor vibration trending high',  'วิเคราะห์สั่นด้วย vibration analyzer พบ bearing defect', 'กิตติศักดิ์ วงศ์ดี', 3,  'Completed'),
  ('MCH-015', 'Corrective (แก้ไข)',               'เลเซอร์ยิงไม่ออก',              'เปลี่ยน laser source และ calibration ใหม่',          'อนุชา แก้วกล้า', 4,  'In Progress'),
  ('MCH-024', 'Preventive (เชิงป้องกัน)',        'PM ประจำเดือน สายการประกอบ',    'ตรวจ torque wrench และหล่อลื่น fixture',           'สมชาย ใจดี',    5,  'Completed'),
  ('MCH-004', 'Condition Monitoring (ตรวจสอบสภาพ)', 'Spindle current ผิดปกติ',       'วัด insulation resistance ผ่านเกณฑ์ เปลี่ยนรอบหน้า', 'กิตติศักดิ์ วงศ์ดี', 6,  'Pending'),
  ('MCH-007', 'Corrective (แก้ไข)',               'สายพาน Conveyor หย่อน',          'ปรับ tension และเปลี่ยน bearing ลูกโรลเลอร์ 2 ตัว',  'อนุชา แก้วกล้า', 7,  'Completed'),
  ('MCH-020', 'Emergency (ฉุกเฉิน)',             'Chiller หยุดกลางคืน',            'เปลี่ยน pressure switch และเติมน้ำยา',             'สมชาย ใจดี',    8,  'Completed'),
  ('MCH-008', 'Corrective (แก้ไข)',               'ฟิล์มหดไม่ตึง',                  'เปลี่ยน film reel brake และตั้ง tension ใหม่',        'สายใจ มั่นคง',  9,  'In Progress'),
  ('MCH-011', 'Preventive (เชิงป้องกัน)',        'PM รายสัปดาห์ รถกลึง',           'ตรวจ chuck หล่อลื่น ways ทดสอบระบบไฟฟ้า',           'กิตติศักดิ์ วงศ์ดี', 10, 'Completed'),
  ('MCH-005', 'Overhaul (ปรับปรุงใหญ่)',         'เปลี่ยน guide bushing ชุดแม่พิมพ์', 'รื้อ mold ทำความสะอาด เปลี่ยน bushing ทั้งชุด',    'อนุชา แก้วกล้า', 12, 'Completed'),
  ('MCH-021', 'Preventive (เชิงป้องกัน)',        'Boiler ตรวจประจำปี',            'ตรวจ pressure vessel ตามกฎหมาย พรบ. โรงงาน',        'สายใจ มั่นคง',  14, 'Pending'),
  ('MCH-013', 'Corrective (แก้ไข)',               'งานเจียร์ผิวไม่เรียบ',           'เปลี่ยนล้อเจียร์และตั้ง runout ใหม่',                'กิตติศักดิ์ วงศ์ดี', 15, 'Completed'),
  ('MCH-018', 'Corrective (แก้ไข)',               'เครื่องติดฉลากเพี้ยน',           'เปลี่ยน stepper motor สายพานฉลาก',                  'สายใจ มั่นคง',  16, 'Completed'),
  ('MCH-002', 'Condition Monitoring (ตรวจสอบสภาพ)', 'Oil analysis น้ำมันไฮดรอลิก',  'ส่งตัวอย่างน้ำมันตรวจ ค่า particle สูง กำหนด flush',  'อนุชา แก้วกล้า', 18, 'In Progress'),
  ('MCH-019', 'Preventive (เชิงป้องกัน)',        'PM หุ่นยนต์ palletizer',          'ตรวจสอบ single point lifting และ gear oil',          'สมชาย ใจดี',    20, 'Completed'),
  ('MCH-012', 'Corrective (แก้ไข)',               'กล้ามจับ slip',                  'เปลี่ยน seal ชุด hydraulic chuck',                    'กิตติศักดิ์ วงศ์ดี', 22, 'Completed'),
  ('MCH-017', 'Emergency (ฉุกเฉิน)',             'หัวบรรจุหยดใส่ขวด',             'ถอดหัวบรรจุล้าง ตรวจสอบ check valve',                'สายใจ มั่นคง',  25, 'Completed'),
  ('MCH-023', 'Preventive (เชิงป้องกัน)',        'PM สายประกอบ รอบ 3 เดือน',      'ตรวจ fixture ทั้งสายและ torque ทุก station',         'สมชาย ใจดี',    28, 'Completed'),
  ('MCH-006', 'Predictive (ทำนายความเสียหาย)',   'วิเคราะห์กระแสเชื่อม',           'บันทึก welding current พบ erratic วางแผนเปลี่ยน liner', 'อนุชา แก้วกล้า', 30, 'Pending'),
  ('MCH-022', 'Condition Monitoring (ตรวจสอบสภาพ)', 'เสียงปั๊มผิดปกติ',              'ตรวจ vibration พบ cavitation วางแผนเปลี่ยน strainer',  'กิตติศักดิ์ วงศ์ดี', 33, 'Completed'),
  ('MCH-010', 'Preventive (เชิงป้องกัน)',        'PM ระบบ HVAC รายเดือน',          'ล้าง filter ตรวจ pressure พัดลม',                    'สายใจ มั่นคง',  35, 'Completed'),
  ('MCH-003', 'Corrective (แก้ไข)',               'สแตนด์ดิ้งย่อยไม่ผ่าน',          'เปลี่ยน end mill และตั้ง tool offset',               'กิตติศักดิ์ วงศ์ดี', 40, 'Completed')
) as v(machine_key, mtype, problem, action, tech, days, status)
join public.machines m on m.machine_id = v.machine_key
where not exists (
  select 1 from public.maintenance_records r
  where r.machine_id = m.id and r.problem = v.problem
);

-- ------------------------------------------------------------------
-- 4. MACHINE HISTORY เพิ่มย้อนหลัง (รายการจาก trigger มีเฉพาะตอน insert)
--    คุม idempotency ด้วย (machine + old -> new + ผู้ดำเนินการ)
-- ------------------------------------------------------------------
insert into public.machine_history (machine_id, old_status, new_status, changed_by_name, created_at)
select m.id, v.old_status::public.machine_status, v.new_status::public.machine_status, v.actor, now() - make_interval(days => v.days)
from (values
  ('MCH-001', 'Stop',      'Running',     'สมชาย ใจดี',     1),
  ('MCH-003', 'Running',   'Stop',        'กิตติศักดิ์ วงศ์ดี', 2),
  ('MCH-005', 'Running',   'Alarm',       'อนุชา แก้วกล้า',  3),
  ('MCH-009', 'Running',   'Alarm',       'สมชาย ใจดี',     5),
  ('MCH-006', 'Running',   'Maintenance', 'อนุชา แก้วกล้า',  6),
  ('MCH-020', 'Running',   'Maintenance', 'สมชาย ใจดี',     8),
  ('MCH-015', 'Running',   'Alarm',       'สายใจ มั่นคง',   10),
  ('MCH-008', 'Running',   'Stop',        'สายใจ มั่นคง',   12),
  ('MCH-024', 'Stop',      'Alarm',       'สมชาย ใจดี',     14),
  ('MCH-012', 'Running',   'Stop',        'กิตติศักดิ์ วงศ์ดี', 16)
) as v(machine_key, old_status, new_status, actor, days)
join public.machines m on m.machine_id = v.machine_key
where not exists (
  select 1 from public.machine_history h
  where h.machine_id = m.id
    and h.old_status is not distinct from v.old_status::public.machine_status
    and h.new_status = v.new_status::public.machine_status
    and h.changed_by_name = v.actor
    and h.created_at::date = (now() - make_interval(days => v.days))::date
);
