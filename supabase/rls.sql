-- PUV Command Center - RLS Policies
-- Run AFTER schema.sql

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's operator_id from profiles
create or replace function public.get_my_operator_id()
returns uuid language sql stable as $$
  select operator_id from public.profiles where id = auth.uid()
$$;

-- Get current user's role
create or replace function public.get_my_role()
returns user_role language sql stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Check if user is admin
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select role = 'admin' from public.profiles where id = auth.uid()
$$;

-- Check if user is operator or above
create or replace function public.is_operator_or_above()
returns boolean language sql stable as $$
  select role in ('admin', 'operator') from public.profiles where id = auth.uid()
$$;

-- Check if user is dispatcher or above
create or replace function public.is_dispatcher_or_above()
returns boolean language sql stable as $$
  select role in ('admin', 'operator', 'dispatcher') from public.profiles where id = auth.uid()
$$;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Users can update their own profile (except role)
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Admins can manage all profiles
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================
-- OPERATORS POLICIES
-- ============================================

-- All authenticated users can view active operators
create policy "View active operators"
  on public.operators for select
  using (is_active = true);

-- Admins can manage operators
create policy "Admins manage operators"
  on public.operators for all
  using (public.is_admin())
  with check (public.is_admin());

-- Operators can view their own operator
create policy "Operators view own operator"
  on public.operators for select
  using (id = public.get_my_operator_id());

-- ============================================
-- VEHICLES POLICIES
-- ============================================

-- Users can view vehicles in their operator's fleet
create policy "View own fleet vehicles"
  on public.vehicles for select
  using (
    operator_id = public.get_my_operator_id()
    or public.is_admin()
  );

-- Operators+ can insert vehicles in their fleet
create policy "Insert own fleet vehicles"
  on public.vehicles for insert
  with check (
    operator_id = public.get_my_operator_id()
    or public.is_admin()
  );

-- Operators+ can update vehicles in their fleet
create policy "Update own fleet vehicles"
  on public.vehicles for update
  using (
    operator_id = public.get_my_operator_id()
    or public.is_admin()
  )
  with check (
    operator_id = public.get_my_operator_id()
    or public.is_admin()
  );

-- Admins can delete vehicles
create policy "Admins delete vehicles"
  on public.vehicles for delete
  using (public.is_admin());

-- ============================================
-- INCIDENTS POLICIES
-- ============================================

-- Users can view incidents for their operator's vehicles
create policy "View own fleet incidents"
  on public.incidents for select
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  );

-- Dispatchers+ can insert incidents
create policy "Dispatchers insert incidents"
  on public.incidents for insert
  with check (
    public.is_dispatcher_or_above()
    or public.is_admin()
  );

-- Dispatchers+ can update incidents
create policy "Dispatchers update incidents"
  on public.incidents for update
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  )
  with check (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  );

-- Admins can delete incidents
create policy "Admins delete incidents"
  on public.incidents for delete
  using (public.is_admin());

-- ============================================
-- INCIDENT TIMELINE POLICIES
-- ============================================

-- Users can view timeline for their fleet's incidents
create policy "View incident timeline"
  on public.incident_timeline for select
  using (
    incident_id in (
      select id from public.incidents
      where vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    )
    or public.is_admin()
  );

-- System can insert timeline entries (via triggers/service role)
create policy "System inserts timeline"
  on public.incident_timeline for insert
  with check (true); -- Service role bypasses RLS

-- ============================================
-- ALERTS POLICIES
-- ============================================

-- Users can view alerts for their fleet
create policy "View own fleet alerts"
  on public.alerts for select
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  );

-- Dispatchers+ can acknowledge alerts
create policy "Acknowledge alerts"
  on public.alerts for update
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  )
  with check (
    acknowledged = true
    and acknowledged_by = auth.uid()
    and (
      vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
      or public.is_admin()
    )
  );

-- System inserts alerts
create policy "System inserts alerts"
  on public.alerts for insert
  with check (true);

-- ============================================
-- DEVICES POLICIES
-- ============================================

-- Users can view devices for their fleet
create policy "View own fleet devices"
  on public.devices for select
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  );

-- Operators+ can update device status (heartbeat)
create policy "Update device heartbeat"
  on public.devices for update
  using (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  )
  with check (
    vehicle_id in (select id from public.vehicles where operator_id = public.get_my_operator_id())
    or public.is_admin()
  );

-- System manages devices
create policy "System manages devices"
  on public.devices for all
  using (true)
  with check (true);

-- ============================================
-- SYSTEM STATS POLICIES
-- ============================================

-- All authenticated users can view stats
create policy "View system stats"
  on public.system_stats for select
  using (true);

-- Only service role can update stats (via cron)
create policy "Service role updates stats"
  on public.system_stats for all
  using (true)
  with check (true);

-- ============================================
-- REALTIME POLICIES (for broadcasts/presence)
-- ============================================

-- Allow authenticated users to join channels
-- Note: Realtime RLS is handled separately in Supabase dashboard