# สถานะบำรุงรักษาเครื่องจักร (Automation Web Application)

ระบบ **Web Application สำหรับสนับสนุนงาน Automation และงานบำรุงรักษาเครื่องจักรในโรงงาน**
พัฒนาโดยใช้เทคโนโลยีสมัยใหม่ (Next.js, Tailwind CSS, Supabase) และใช้ AI ในการวิเคราะห์ ออกแบบ พัฒนา ทดสอบ และปรับปรุงโปรแกรม

---

## 1. วัตถุประสงค์ (Project Objective)

- พัฒนา Web Application สำหรับบันทึกและติดตามข้อมูลเครื่องจักร (Machine Master)
- บันทึกเหตุการณ์ Alarm และงานบำรุงรักษา (Maintenance) ของเครื่องจักรในโรงงาน
- แสดงสถานะภาพรวมของเครื่องจักรผ่าน Dashboard แบบ Realtime กับฐานข้อมูล
- กำหนดสิทธิ์การเข้าถึงตาม Role (Admin / Technician) ด้วย Row Level Security ของ Supabase
- ใช้ AI เป็นตัวช่วยในการวิเคราะห์ ออกแบบ พัฒนา ทดสอบ และปรับปรุงโปรแกรมตลอดกระบวนการพัฒนา

## 2. Function หลัก (Main Features)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| Authentication | Login / Logout / สมัครสมาชิกด้วย Supabase Auth (email/password) |
| Role & Permission | Admin และ Technician ควบคุมด้วย RLS + ตรวจสอบ Role ในทุกหน้า |
| Dashboard | จำนวนเครื่องจักรทั้งหมด, Running / Stop / Alarm / Maintenance, จำนวน Alarm, จำนวนงาน Maintenance พร้อมกราฟแท่ง/วงกลม/แนวโน้ม |
| Machine Master | เพิ่ม / แก้ไข / ลบ / แสดง เครื่องจักร (Machine ID, Name, Type, Location, Status) |
| Alarm Record | เพิ่ม / แก้ไข / ลบ / แสดง Alarm (Machine, Code, Description, Date/Time, Cause, Status) |
| Maintenance Record | เพิ่ม / แก้ไข / ลบ / แสดง งานบำรุงรักษา (Machine, Type, Problem, Action, Technician, Date, Status) |
| Search & Filter | ค้นหา/กรองตาม Machine ID, ชื่อ, Status, Type, Alarm Code, ช่วงวันที่ ฯลฯ |
| Input Validation | Zod validation ทุกฟอร์ม + เช็ค Machine ID ซ้ำ + แสดงข้อความแจ้งเตือน |

### สถานะของแต่ละ Entity
- **เครื่องจักร**: `Running` / `Stop` / `Alarm` / `Maintenance`
- **Alarm**: `Open` / `In Progress` / `Closed`
- **งานบำรุงรักษา**: `Pending` / `In Progress` / `Completed`

## 3. Technology ที่ใช้

| เทคโนโลยี | บทบาท |
|---|---|
| [Next.js 16](https://nextjs.org) | Frontend + Backend (App Router, Server Components, Server Actions) |
| [Tailwind CSS](https://tailwindcss.com) | Styling / UI |
| [Supabase](https://supabase.com) | Authentication + PostgreSQL Database + Row Level Security |
| [Recharts](https://recharts.org) | กราฟ Dashboard |
| [Zod](https://zod.dev) | Input Validation |
| [GitHub](https://github.com) | จัดเก็บ Source Code + Git history |
| [GitHub Actions](https://github.com/features/actions) | CI: install / lint / typecheck / test / build |
| [Vercel](https://vercel.com) | Deployment |

## 4. Database Structure

ฐานข้อมูล Supabase PostgreSQL ประกอบด้วย 4 ตารางหลัก พร้อม FK, enum, index, RLS และ trigger ดูโค้ดเต็มได้ที่ `supabase/schema.sql`

```
┌─────────────────┐      ┌──────────────────────────┐
│   auth.users    │      │       profiles            │
│  (จาก Supabase) │◄────►│ id (PK -> auth.users.id)  │
└─────────────────┘      │ full_name, email          │
                         │ role: admin|technician    │
                         └────────────┬──────────────┘
                                      │ created_by
┌─────────────────────┐  ┌────────────┴──────────────────┐
│      machines       │  │            alarms             │
│ id (PK)             │◄─┤ machine_id (FK -> machines.id)│
│ machine_id (UNIQUE) │  │ alarm_code, alarm_description │
│ name, type, location│  │ occurred_at, cause            │
│ status (enum)       │  │ status: Open|In Progress|Closed│
└─────────────────────┘  └───────────────────────────────┘
        ▲
        │ machine_id (FK)
        │
┌───────────────────────────┐
│    maintenance_records     │
│ maintenance_type, problem  │
│ action_taken, technician   │
│ maintenance_date, status   │
└───────────────────────────┘
```

**ความสัมพันธ์ (Relationships)**
- `profiles.id → auth.users.id` (1:1) บันทึก Role ของผู้ใช้
- `alarms.machine_id → machines.id` (N:1)
- `maintenance_records.machine_id → machines.id` (N:1)
- `created_by → profiles.id` ใช้บันทึกผู้สร้างข้อมูล

**Row Level Security (RLS)**
- ผู้ใช้ใดก็ตามที่ Login แล้ว: อ่าน machines / alarms / maintenance ได้
- **Admin**: เพิ่ม/แก้ไข/ลบ machines และลบ alarms/maintenance ได้ และจัดการ Role ผู้ใช้ได้
- **Technician**: เพิ่ม/แก้ไขบันทึก alarm และ maintenance ได้ (เปลี่ยนสถานะได้) แต่ควบคุมเครื่องจักรไม่ได้

## 5. วิธีติดตั้ง / ใช้งาน (Installation)

### 5.1 ระบบกลาง (เตรียม Project)

1. **Clone โปรเจกต์**
   ```bash
   git clone https://github.com/kittikoon-p/automation.git
   cd automation
   npm install
   ```

2. **สร้าง Supabase Project** ที่ https://supabase.com
   - เปิดหน้า **SQL Editor** และรันสคริปต์ `supabase/schema.sql` (สร้างตาราง + Trigger + RLS)
   - รันสคริปต์ `supabase/seed.sql` เพื่อใส่ข้อมูลตัวอย่าง (ไม่บังคับ แต่แนะนำ)
   - เข้า **Authentication > Providers** เปิด Email และปิด `Confirm email` (เพื่อความสะดวกในการทดลอง)

3. **ตั้งค่า Environment Variables**
   คัดลอก `.env.local.example` ไปเป็น `.env.local` แล้วกรอกค่า
   ```bash
   cp .env.local.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   หาค่าได้ที่ Supabase Dashboard > **Project Settings > API**

4. **รัน Local Development**
   ```bash
   npm run dev
   ```
   เปิด `http://localhost:3000` — ผู้ใช้รายแรกที่สมัครจะได้สิทธิ์ **Admin** อัตโนมัติ

### 5.2 คำสั่งที่ใช้บ่อย

```bash
npm run dev        # run dev server
npm run build      # production build
npm run start      # run production build
npm run lint       # eslint
npm run typecheck  # TypeScript check
npm test           # vitest unit tests
```

## 6. GitHub & GitHub Actions

- Source Code ทั้งหมดเก็บที่ GitHub (ดู commit history ได้ที่แท็บ Commits)
- Workflow ใน `.github/workflows/ci.yml` จะรันอัตโนมัติเมื่อ Push / Pull Request ไปที่ `main`
- CI จะตรวจสอบ: `npm ci` → `lint` → `typecheck` → `test` → `build`
- ตั้งค่า Secrets ใน GitHub (Settings > Secrets and variables > Actions):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 7. Deployment (Vercel)

**Vercel URL:** https://automation-phi-peach.vercel.app

1. เข้า https://vercel.com แล้ว **Add New Project** → เชื่อมกับ GitHub Repo
2. Framework Preset เลือก **Next.js** (Vercel ตรวจจับอัตโนมัติ)
3. ตั้งค่า Environment Variables (เหมือน `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = ใส่โดเมนที่ Vercel ให้
4. กด **Deploy** → Vercel จะ Build และรัน CI ให้อัตโนมัติทุกครั้งที่ Push
5. ขั้นตอน (Advance) เปิด https://supabase.com/dashboard → **Authentication > URL Configuration** เพิ่มโดเมน Vercel ของเรา เข้า **Redirect URLs**

## 8. การใช้ AI ในการพัฒนา (AI Usage)

โปรเจกต์นี้ใช้ AI (OpenCode / LLM Assistant) เป็นผู้ช่วยตลอดกระบวนการพัฒนา:

| ขั้นตอน | บทบาทของ AI |
|---|---|
| วิเคราะห์ Requirement | สรุปขอบเขตระบบ, แยกโมดูล, กำหนด Business Rules |
| ออกแบบ Database | ออกแบบ ER Diagram, enum, FK, RLS Policy, Trigger สร้าง Profile อัตโนมัติ |
| พัฒนา Frontend | สร้าง UI ทั้งหมดด้วย Tailwind CSS (Dashboard, Tables, Forms, Modals) |
| พัฒนา Backend | Supabase Auth, Server Components, Zod Validation, RBAC |
| ทดสอบ (Testing) | เขียน unit tests ด้วย Vitest, **10 test cases ผ่านทั้งหมด** |
| ปรับปรุง (Refactor) | แก้ไข pattern ที่ไม่เหมาะสม เช่น แก้ `setState in effect` ให้ใช้ key remount, แก้ Zod v4 API |
| Documentation | จัดทำ README, Database Structure, CI/CD |

### ตัวอย่างปัญหา/การแก้ไขที่ AI ช่วย
- Next.js 16 เปลี่ยนชื่อ `middleware.ts` → `proxy.ts` → AI ตรวจเจอจาก documentation และปรับโค้ดให้ถูกต้อง
- Zod v4 ไม่รับ `errorMap` ใน `z.enum()` → AI แก้ให้ใช้ message ตาม API ใหม่
- เครื่องมือ lint เตือน `react-hooks/set-state-in-effect` → AI refactor เป็นการ remount ด้วย `key` เพื่อไม่ให้เกิด cascading render

## 9. โครงสร้างโปรเจกต์

```
├── .github/workflows/ci.yml      # GitHub Actions CI
├── supabase/
│   ├── schema.sql                # DDL: tables, enums, RLS, trigger, indexes
│   └── seed.sql                  # ข้อมูลตัวอย่าง
├── src/
│   ├── app/
│   │   ├── (app)/                # กลุ่มหน้าหลัง Login
│   │   │   ├── layout.tsx        # Protected layout + Sidebar
│   │   │   ├── dashboard/        # Dashboard + กราฟ
│   │   │   ├── machines/         # Machine Master (CRUD + filter)
│   │   │   ├── alarms/           # Alarm Record (CRUD + filter)
│   │   │   ├── maintenance/      # Maintenance Record (CRUD + filter)
│   │   │   └── users/            # จัดการผู้ใช้ (Admin only)
│   │   ├── login/                # หน้า Login
│   │   ├── signup/               # หน้าสมัครสมาชิก
│   │   └── layout.tsx            # Root layout
│   ├── components/               # UI components (forms, managers, charts)
│   ├── lib/
│   │   ├── supabase/             # Supabase client (browser/server)
│   │   ├── db/                   # queries, auth, guard, types
│   │   └── validation.ts         # Zod schemas
│   └── proxy.ts                  # Next.js 16 guard (เดิมคือ middleware)
└── tests/validation.test.ts      # Unit tests
```

## 10. License / Contact

- โปรเจกต์นักศึกษาเพื่อการศึกษา
- หากมีคำถามติดต่อผู้พัฒนา