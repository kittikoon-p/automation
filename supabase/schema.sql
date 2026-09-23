-- ============================================================
-- Automation Web Application - Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL > New query)
--
-- The script is IDEMPOTENT: it can be re-run as many times as needed.
-- Section 0 drops any previously-created objects first, so re-running
-- this file on a dev project is always safe. NOTE: this DELETES all
-- rows in the affected tables.
--
-- If you ever see "ERROR: 42710: type "user_role" already exists"
-- (usually from a previous partial run), just re-run this ENTIRE file:
-- Section 0 resets those types and Section 1 rebuilds them safely.
-- ============================================================

-- ------------------------------------------------------------------
-- 0. RESET (dev-friendly; safe to re-run)
--    Removes every object this schema creates so it can be applied
--    repeatedly without errors.
-- ------------------------------------------------------------------
drop trigger if exists on_auth_user_created      on auth.users;
drop trigger if exists machines_updated_at        on public.machines;
drop trigger if exists alarms_updated_at          on public.alarms;
drop trigger if exists maintenance_updated_at     on public.maintenance_records;
drop trigger if exists machines_history           on public.machines;
drop trigger if exists machines_audit             on public.machines;
drop trigger if exists alarms_audit               on public.alarms;
drop trigger if exists maintenance_audit          on public.maintenance_records;
drop trigger if exists alarms_notify              on public.alarms;
drop trigger if exists machines_notify            on public.machines;
drop trigger if exists maintenance_notify         on public.maintenance_records;

alter table public.machines            disable row level security;
alter table public.alarms              disable row level security;
alter table public.maintenance_records disable row level security;
alter table public.profiles            disable row level security;
alter table public.machine_history     disable row level security;
alter table public.audit_logs          disable row level security;
alter table public.notifications       disable row level security;

drop table if exists public.maintenance_records cascade;
drop table if exists public.alarms      cascade;
drop table if exists public.machines    cascade;
drop table if exists public.profiles    cascade;
drop table if exists public.machine_history cascade;
drop table if exists public.audit_logs      cascade;
drop table if exists public.notifications   cascade;

drop function if exists public.set_updated_at      cascade;
drop function if exists public.handle_new_user     cascade;
drop function if exists public.current_role        cascade;
drop function if exists public.log_machine_history cascade;
drop function if exists public.log_audit           cascade;
drop function if exists public.notify_all          cascade;
drop function if exists public.on_new_alarm        cascade;
drop function if exists public.on_machine_status   cascade;
drop function if exists public.on_new_maintenance  cascade;

drop type if exists public.maint_status   cascade;
drop type if exists public.alarm_status   cascade;
drop type if exists public.machine_status cascade;
drop type if exists public.user_role      cascade;

-- ------------------------------------------------------------------
-- 1. ENUM TYPES
--    Created defensively: if the type already exists (e.g. old version
--    without 'viewer', or a previous partial run) the script repairs it
--    instead of failing with: ERROR: 42710 type "... " already exists.
--    A normal full run still goes through RESET of Section 0 first.
-- ------------------------------------------------------------------
do $$ begin
  -- user_role needs the extra 'viewer' member -> rebuild if missing/outdated
  if not exists (select 1 from pg_type t
                 where t.typname = 'user_role' and t.typnamespace = 'public'::regnamespace)
     or not exists (select 1 from pg_enum e
                    join pg_type t on t.oid = e.enumtypid
                    where t.typname = 'user_role'
                      and t.typnamespace = 'public'::regnamespace
                      and e.enumlabel = 'viewer') then
    drop type if exists public.user_role cascade;
    create type public.user_role as enum ('admin', 'technician', 'viewer');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type t
                 where t.typname = 'machine_status' and t.typnamespace = 'public'::regnamespace) then
    create type public.machine_status as enum ('Running', 'Stop', 'Alarm', 'Maintenance');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type t
                 where t.typname = 'alarm_status' and t.typnamespace = 'public'::regnamespace) then
    create type public.alarm_status as enum ('Open', 'In Progress', 'Closed');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type t
                 where t.typname = 'maint_status' and t.typnamespace = 'public'::regnamespace) then
    create type public.maint_status as enum ('Pending', 'In Progress', 'Completed');
  end if;
end $$;

-- ------------------------------------------------------------------
-- 2. PROFILES (extends auth.users, holds the role)
-- ------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  email      text not null default '',
  role       public.user_role not null default 'technician',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 3. MACHINES (Machine Master)
-- ------------------------------------------------------------------
create table public.machines (
  id         uuid primary key default gen_random_uuid(),
  machine_id text not null unique,                 -- unique, non-empty
  name       text not null,
  type       text not null,
  location   text not null,
  status     public.machine_status not null default 'Stop',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 4. ALARMS (Alarm Record)
-- ------------------------------------------------------------------
create table public.alarms (
  id                uuid primary key default gen_random_uuid(),
  machine_id        uuid not null references public.machines (id) on delete cascade,
  alarm_code        text not null,
  alarm_description text not null,
  occurred_at       timestamptz not null,
  cause             text,
  status            public.alarm_status not null default 'Open',
  created_by        uuid references public.profiles (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 5. MAINTENANCE RECORDS
-- ------------------------------------------------------------------
create table public.maintenance_records (
  id               uuid primary key default gen_random_uuid(),
  machine_id       uuid not null references public.machines (id) on delete cascade,
  maintenance_type text not null,
  problem          text not null,
  action_taken     text not null,
  technician       text,
  maintenance_date date not null default current_date,
  status           public.maint_status not null default 'Pending',
  created_by       uuid references public.profiles (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 6. MACHINE HISTORY (status change log)
-- ------------------------------------------------------------------
create table public.machine_history (
  id              uuid primary key default gen_random_uuid(),
  machine_id      uuid not null references public.machines (id) on delete cascade,
  old_status      public.machine_status,
  new_status      public.machine_status not null,
  changed_by_name text,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 7. AUDIT LOG (append-only trail of every change)
-- ------------------------------------------------------------------
create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id),
  user_name  text,
  table_name text not null,
  record_id  uuid,
  action     text not null,                 -- INSERT / UPDATE / DELETE
  details    jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 8. NOTIFICATIONS (per-user feed, written by triggers)
-- ------------------------------------------------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null default 'info',  -- info / alarm / machine / maintenance
  title      text not null,
  message    text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 9. AUTO-UPDATE updated_at TRIGGER
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger machines_updated_at before update on public.machines
  for each row execute function public.set_updated_at();
create trigger alarms_updated_at before update on public.alarms
  for each row execute function public.set_updated_at();
create trigger maintenance_updated_at before update on public.maintenance_records
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- 10. AUTO-CREATE PROFILE ON SIGNUP + FIRST USER BECOMES ADMIN
-- ------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    -- The very first user to ever sign up becomes the admin
    case when not exists (select 1 from public.profiles) then 'admin'::public.user_role
         else 'technician'::public.user_role end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- 11. MACHINE HISTORY TRIGGER
-- ------------------------------------------------------------------
create or replace function public.log_machine_history()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor text;
begin
  select full_name into actor from public.profiles where id = auth.uid();
  if tg_op = 'INSERT' then
    insert into public.machine_history (machine_id, old_status, new_status, changed_by_name)
    values (new.id, null, new.status, actor);
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.machine_history (machine_id, old_status, new_status, changed_by_name)
    values (new.id, old.status, new.status, actor);
  end if;
  return new;
end $$;

create trigger machines_history after insert or update on public.machines
  for each row execute function public.log_machine_history();

-- ------------------------------------------------------------------
-- 12. AUDIT TRIGGER (machines / alarms / maintenance)
-- ------------------------------------------------------------------
create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor text;
begin
  select full_name into actor from public.profiles where id = auth.uid();
  insert into public.audit_logs (user_id, user_name, table_name, record_id, action, details)
  values (
    auth.uid(),
    actor,
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    case tg_op
      when 'INSERT' then jsonb_build_object('new', to_jsonb(new))
      when 'DELETE' then jsonb_build_object('old', to_jsonb(old))
      else jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
    end
  );
  return coalesce(new, old);
end $$;

create trigger machines_audit after insert or update or delete on public.machines
  for each row execute function public.log_audit();
create trigger alarms_audit after insert or update or delete on public.alarms
  for each row execute function public.log_audit();
create trigger maintenance_audit after insert or update or delete on public.maintenance_records
  for each row execute function public.log_audit();

-- ------------------------------------------------------------------
-- 13. NOTIFICATION TRIGGERS (fan-out to every user)
-- ------------------------------------------------------------------
create or replace function public.notify_all(title text, message text, ntype text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, title, message)
  select id, ntype, title, message from public.profiles;
end $$;

create or replace function public.on_new_alarm()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Open' then
    perform public.notify_all(
      'Alarm ใหม่: ' || new.alarm_code,
      new.alarm_description,
      'alarm'
    );
  end if;
  return new;
end $$;

create trigger alarms_notify after insert on public.alarms
  for each row execute function public.on_new_alarm();

create or replace function public.on_machine_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Alarm' and old.status is distinct from new.status then
    perform public.notify_all(
      'เครื่องจักรเข้า Alarm',
      new.machine_id || ' — ' || new.name,
      'machine'
    );
  end if;
  return new;
end $$;

create trigger machines_notify after update on public.machines
  for each row execute function public.on_machine_status();

create or replace function public.on_new_maintenance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_all(
    'งานบำรุงรักษาใหม่',
    new.maintenance_type || ' — ' || new.status,
    'maintenance'
  );
  return new;
end $$;

create trigger maintenance_notify after insert on public.maintenance_records
  for each row execute function public.on_new_maintenance();

-- ------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS)
--    Admin    -> full CRUD on masters/alarms/maintenance, read audit
--    Technician -> read everything, manage alarms & maintenance
--    Viewer   -> read-only on everything
-- ------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.machines            enable row level security;
alter table public.alarms              enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.machine_history     enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.notifications       enable row level security;

-- helper to read current role safely
create or replace function public.current_role()
returns public.user_role language sql stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ---------- PROFILES ----------
create policy "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles: admin read all" on public.profiles
  for select using (public.current_role() = 'admin');
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles: admin update all" on public.profiles
  for update using (public.current_role() = 'admin');

-- ---------- MACHINES ----------
create policy "Machines: read (all authed)" on public.machines
  for select using (auth.role() = 'authenticated');
create policy "Machines: admin write" on public.machines
  for insert with check (public.current_role() = 'admin');
create policy "Machines: admin update" on public.machines
  for update using (public.current_role() = 'admin');
create policy "Machines: admin delete" on public.machines
  for delete using (public.current_role() = 'admin');

-- ---------- ALARMS (write = admin & technician, not viewer) ----------
create policy "Alarms: read (all authed)" on public.alarms
  for select using (auth.role() = 'authenticated');
create policy "Alarms: insert (staff)" on public.alarms
  for insert with check (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role));
create policy "Alarms: update (staff)" on public.alarms
  for update using (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role))
  with check (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role));
create policy "Alarms: admin delete" on public.alarms
  for delete using (public.current_role() = 'admin');

-- ---------- MAINTENANCE (write = admin & technician, not viewer) ----------
create policy "Maintenance: read (all authed)" on public.maintenance_records
  for select using (auth.role() = 'authenticated');
create policy "Maintenance: insert (staff)" on public.maintenance_records
  for insert with check (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role));
create policy "Maintenance: update (staff)" on public.maintenance_records
  for update using (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role))
  with check (public.current_role() in ('admin'::public.user_role, 'technician'::public.user_role));
create policy "Maintenance: admin delete" on public.maintenance_records
  for delete using (public.current_role() = 'admin');

-- ---------- MACHINE HISTORY ----------
create policy "MachineHistory: read (all authed)" on public.machine_history
  for select using (auth.role() = 'authenticated');

-- ---------- AUDIT LOG ----------
create policy "Audit: read (admin)" on public.audit_logs
  for select using (public.current_role() = 'admin');

-- ---------- NOTIFICATIONS ----------
create policy "Notif: read own" on public.notifications
  for select using (user_id = auth.uid());
create policy "Notif: update own (mark read)" on public.notifications
  for update using (user_id = auth.uid());

-- ------------------------------------------------------------------
-- 15. INDEXES FOR SEARCH / FILTER PERFORMANCE
-- ------------------------------------------------------------------
create index machines_status_idx  on public.machines (status);
create index machines_type_idx    on public.machines (type);
create index alarms_machine_idx   on public.alarms (machine_id);
create index alarms_status_idx    on public.alarms (status);
create index alarms_occurred_idx  on public.alarms (occurred_at);
create index maintenance_machine_idx on public.maintenance_records (machine_id);
create index maintenance_status_idx  on public.maintenance_records (status);
create index machine_history_machine_idx on public.machine_history (machine_id);
create index machine_history_created_idx on public.machine_history (created_at desc);
create index audit_logs_table_idx   on public.audit_logs (table_name);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index notifications_user_idx on public.notifications (user_id, read_at);