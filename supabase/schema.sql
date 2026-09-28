create extension if not exists pgcrypto;

create table if not exists public.managed_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('buildings', 'tanks', 'sockets')),
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists managed_assets_owner_kind_idx
  on public.managed_assets (owner_id, kind, created_at);

alter table public.managed_assets enable row level security;
grant select, insert, update, delete on public.managed_assets to authenticated;

drop policy if exists "Users can read their managed assets" on public.managed_assets;
create policy "Users can read their managed assets"
  on public.managed_assets for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Users can create their managed assets" on public.managed_assets;
create policy "Users can create their managed assets"
  on public.managed_assets for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Users can update their managed assets" on public.managed_assets;
create policy "Users can update their managed assets"
  on public.managed_assets for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Users can delete their managed assets" on public.managed_assets;
create policy "Users can delete their managed assets"
  on public.managed_assets for delete to authenticated
  using (owner_id = (select auth.uid()));

create table if not exists public.device_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  building_name text not null,
  device_name text not null,
  days jsonb not null,
  updated_at timestamptz not null default now(),
  unique (owner_id, building_name, device_name)
);

alter table public.device_schedules enable row level security;
grant select, insert, update, delete on public.device_schedules to authenticated;

drop policy if exists "Users can read their device schedules" on public.device_schedules;
create policy "Users can read their device schedules"
  on public.device_schedules for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Users can create their device schedules" on public.device_schedules;
create policy "Users can create their device schedules"
  on public.device_schedules for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Users can update their device schedules" on public.device_schedules;
create policy "Users can update their device schedules"
  on public.device_schedules for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Users can delete their device schedules" on public.device_schedules;
create policy "Users can delete their device schedules"
  on public.device_schedules for delete to authenticated
  using (owner_id = (select auth.uid()));

create table if not exists public.devices (
  device_id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  building_name text,
  room_name text,
  token_hash text not null,
  active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.devices
  add column if not exists building_name text,
  add column if not exists room_name text;

alter table public.devices enable row level security;
revoke select on public.devices from authenticated;
grant select (device_id, owner_id, display_name, building_name, room_name, active, last_seen_at, created_at)
  on public.devices to authenticated;
drop policy if exists "Users can read their devices" on public.devices;
create policy "Users can read their devices"
  on public.devices for select to authenticated
  using (owner_id = (select auth.uid()));

create table if not exists public.device_telemetry (
  id bigint generated always as identity primary key,
  device_id text not null references public.devices(device_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  temperature_c real,
  humidity_pct real,
  water_distance_cm real,
  water_level_pct real,
  temp_relay_on boolean not null,
  water_relay_on boolean not null,
  temp_overheat boolean not null,
  water_full boolean not null,
  dht_sensor_fault boolean not null default false,
  water_sensor_fault boolean not null default false,
  received_at timestamptz not null default now()
);

alter table public.device_telemetry
  add column if not exists dht_sensor_fault boolean not null default false,
  add column if not exists water_sensor_fault boolean not null default false;

create index if not exists device_telemetry_device_time_idx
  on public.device_telemetry (device_id, measured_at desc);

alter table public.device_telemetry enable row level security;
grant select on public.device_telemetry to authenticated;
drop policy if exists "Users can read their device telemetry" on public.device_telemetry;
create policy "Users can read their device telemetry"
  on public.device_telemetry for select to authenticated
  using (owner_id = (select auth.uid()));

create table if not exists public.device_commands (
  id uuid primary key default gen_random_uuid(),
  device_id text not null references public.devices(device_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('temp_on', 'temp_off', 'water_on', 'water_off')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'rejected')),
  result text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists device_commands_pending_idx
  on public.device_commands (device_id, created_at)
  where status = 'pending';

alter table public.device_commands enable row level security;
grant select, insert on public.device_commands to authenticated;
drop policy if exists "Users can read their device commands" on public.device_commands;
create policy "Users can read their device commands"
  on public.device_commands for select to authenticated
  using (owner_id = (select auth.uid()));
drop policy if exists "Users can request commands for their devices" on public.device_commands;
create policy "Users can request commands for their devices"
  on public.device_commands for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.devices
      where devices.device_id = device_commands.device_id
        and devices.owner_id = (select auth.uid())
        and devices.active
    )
  );

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null references public.devices(device_id) on delete cascade,
  name text not null,
  condition text not null check (condition in ('temperature_above', 'water_level_below', 'sensor_fault', 'device_offline')),
  threshold numeric,
  action text not null check (action in ('turn_temperature_off', 'turn_water_inlet_off', 'notify_only')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  check (
    (condition in ('temperature_above', 'water_level_below') and threshold is not null)
    or (condition in ('sensor_fault', 'device_offline') and threshold is null)
  )
);

create index if not exists automation_rules_owner_device_idx
  on public.automation_rules (owner_id, device_id, created_at desc);

alter table public.automation_rules enable row level security;
grant select, insert, update, delete on public.automation_rules to authenticated;
drop policy if exists "Users can read their automation rules" on public.automation_rules;
create policy "Users can read their automation rules"
  on public.automation_rules for select to authenticated
  using (owner_id = (select auth.uid()));
drop policy if exists "Users can create rules for their devices" on public.automation_rules;
create policy "Users can create rules for their devices"
  on public.automation_rules for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.devices where devices.device_id = automation_rules.device_id and devices.owner_id = (select auth.uid()))
  );
drop policy if exists "Users can update their automation rules" on public.automation_rules;
create policy "Users can update their automation rules"
  on public.automation_rules for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
drop policy if exists "Users can delete their automation rules" on public.automation_rules;
create policy "Users can delete their automation rules"
  on public.automation_rules for delete to authenticated
  using (owner_id = (select auth.uid()));