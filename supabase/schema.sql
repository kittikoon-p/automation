-- ============================================================
-- Automation Web Application - Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL > New query)
-- ============================================================

-- ------------------------------------------------------------------
-- 1. ENUM TYPES
-- ------------------------------------------------------------------
create type public.user_role      as enum ('admin', 'technician');
create type public.machine_status as enum ('Running', 'Stop', 'Alarm', 'Maintenance');
create type public.alarm_status   as enum ('Open', 'In Progress', 'Closed');
create type public.maint_status   as enum ('Pending', 'In Progress', 'Completed');

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
-- 6. AUTO-UPDATE updated_at TRIGGER
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
-- 7. AUTO-CREATE PROFILE ON SIGNUP + FIRST USER BECOMES ADMIN
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
-- 8. ROW LEVEL SECURITY (RLS)
--    Admin   -> full CRUD on masters/alarms/maintenance
--    Technician -> read masters, manage alarms (incl. status) & maintenance
-- ------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.machines            enable row level security;
alter table public.alarms              enable row level security;
alter table public.maintenance_records enable row level security;

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

-- ---------- ALARMS ----------
create policy "Alarms: read (all authed)" on public.alarms
  for select using (auth.role() = 'authenticated');
create policy "Alarms: insert (all authed)" on public.alarms
  for insert with check (auth.role() = 'authenticated');
create policy "Alarms: update (all authed)" on public.alarms
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Alarms: admin delete" on public.alarms
  for delete using (public.current_role() = 'admin');

-- ---------- MAINTENANCE ----------
create policy "Maintenance: read (all authed)" on public.maintenance_records
  for select using (auth.role() = 'authenticated');
create policy "Maintenance: insert (all authed)" on public.maintenance_records
  for insert with check (auth.role() = 'authenticated');
create policy "Maintenance: update (all authed)" on public.maintenance_records
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Maintenance: admin delete" on public.maintenance_records
  for delete using (public.current_role() = 'admin');

-- ------------------------------------------------------------------
-- 9. INDEXES FOR SEARCH / FILTER PERFORMANCE
-- ------------------------------------------------------------------
create index machines_status_idx  on public.machines (status);
create index machines_type_idx    on public.machines (type);
create index alarms_machine_idx   on public.alarms (machine_id);
create index alarms_status_idx    on public.alarms (status);
create index alarms_occurred_idx  on public.alarms (occurred_at);
create index maintenance_machine_idx on public.maintenance_records (machine_id);
create index maintenance_status_idx  on public.maintenance_records (status);
