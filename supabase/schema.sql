-- PUV Command Center - Supabase Schema
-- Run this in Supabase SQL Editor or via migration

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "postgis";

-- ============================================
-- ENUMS
-- ============================================
create type vehicle_type as enum ('jeepney', 'tricycle', 'uv-express', 'bus');
create type vehicle_status as enum ('normal', 'emergency', 'sos', 'offline');
create type incident_type as enum ('crash', 'sos', 'medical', 'threat', 'other');
create type incident_priority as enum ('critical', 'high', 'medium', 'low');
create type incident_status as enum ('new', 'acknowledged', 'responding', 'resolved', 'false-alarm');
create type device_status as enum ('online', 'offline', 'degraded', 'maintenance');
create type user_role as enum ('admin', 'operator', 'dispatcher', 'viewer');

-- ============================================
-- USERS & AUTH (extends Supabase Auth)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'viewer',
  operator_id uuid, -- references operators table
  region text, -- geographic region for multi-tenancy
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- ============================================
-- OPERATORS (for multi-tenant support)
-- ============================================
create table if not exists public.operators (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique, -- short code like 'MDRRMO', 'MMDA'
  region text not null, -- e.g., 'NCR', 'Region IV-A'
  contact_email text,
  contact_phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operators enable row level security;

-- ============================================
-- VEHICLES
-- ============================================
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  plate_number text not null unique,
  type vehicle_type not null,
  device_id text not null unique,
  driver text not null,
  operator_id uuid not null references public.operators(id) on delete restrict,
  status vehicle_status not null default 'normal',
  registration_status text not null check (registration_status in ('active', 'expired', 'pending')) default 'active',
  last_communication timestamptz not null default now(),
  emergency_contact text,
  position geography(point, 4326) not null default 'SRID=4326;POINT(120.9842 14.5995)'::geography,
  speed numeric not null default 0,
  passengers integer not null default 0,
  fuel_level integer not null default 100 check (fuel_level >= 0 and fuel_level <= 100),
  route text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_vehicles_operator on public.vehicles(operator_id);
create index if not exists idx_vehicles_status on public.vehicles(status);
create index if not exists idx_vehicles_device on public.vehicles(device_id);
create index if not exists idx_vehicles_position on public.vehicles using gist(position);

alter table public.vehicles enable row level security;

-- ============================================
-- INCIDENTS
-- ============================================
create table if not exists public.incidents (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  vehicle_type vehicle_type not null,
  type incident_type not null,
  priority incident_priority not null,
  status incident_status not null default 'new',
  timestamp timestamptz not null default now(),
  location text not null,
  coordinates geography(point, 4326) not null,
  assigned_responder uuid references auth.users(id) on delete set null,
  notes text,
  alert_delivery_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_incidents_vehicle on public.incidents(vehicle_id);
create index if not exists idx_incidents_status on public.incidents(status);
create index if not exists idx_incidents_priority on public.incidents(priority);
create index if not exists idx_incidents_timestamp on public.incidents(timestamp desc);
create index if not exists idx_incidents_coordinates on public.incidents using gist(coordinates);

alter table public.incidents enable row level security;

-- ============================================
-- INCIDENT TIMELINE (audit trail)
-- ============================================
create table if not exists public.incident_timeline (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  timestamp timestamptz not null default now(),
  action text not null,
  actor uuid references auth.users(id) on delete set null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists idx_timeline_incident on public.incident_timeline(incident_id, timestamp);

alter table public.incident_timeline enable row level security;

-- ============================================
-- ALERTS
-- ============================================
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  type incident_type not null,
  priority incident_priority not null,
  message text not null,
  timestamp timestamptz not null default now(),
  acknowledged boolean not null default false,
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_alerts_incident on public.alerts(incident_id);
create index if not exists idx_alerts_acknowledged on public.alerts(acknowledged, timestamp desc);
create index if not exists idx_alerts_vehicle on public.alerts(vehicle_id);

alter table public.alerts enable row level security;

-- ============================================
-- DEVICES (ESP32 health telemetry)
-- ============================================
create table if not exists public.devices (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  device_id text not null unique,
  status device_status not null default 'offline',
  battery_level integer not null default 0 check (battery_level >= 0 and battery_level <= 100),
  signal_strength integer not null default 0 check (signal_strength >= 0 and signal_strength <= 100),
  gps_accuracy numeric not null default 0,
  last_heartbeat timestamptz not null default now(),
  firmware_version text,
  uptime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_devices_vehicle on public.devices(vehicle_id);
create index if not exists idx_devices_status on public.devices(status);
create index if not exists idx_devices_device_id on public.devices(device_id);

alter table public.devices enable row level security;

-- ============================================
-- SYSTEM STATS (materialized view refreshed by cron)
-- ============================================
create table if not exists public.system_stats (
  id integer primary key default 1,
  active_emergencies integer not null default 0,
  unacknowledged_alerts integer not null default 0,
  vehicles_monitored integer not null default 0,
  incidents_resolved_today integer not null default 0,
  avg_alert_delivery_ms integer not null default 0,
  devices_offline integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.system_stats enable row level security;

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger operators_updated_at before update on public.operators
  for each row execute function public.handle_updated_at();

create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.handle_updated_at();

create trigger incidents_updated_at before update on public.incidents
  for each row execute function public.handle_updated_at();

create trigger devices_updated_at before update on public.devices
  for each row execute function public.handle_updated_at();

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
alter publication supabase_realtime add table public.vehicles;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.devices;
alter publication supabase_realtime add table public.incident_timeline;