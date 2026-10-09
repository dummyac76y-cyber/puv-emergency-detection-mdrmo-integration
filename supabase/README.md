# PUV Command Center - Supabase Setup Guide

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Supabase CLI (optional, for local development)

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_URL=https://your-project-ref.supabase.co
```

### 3. Apply Database Schema

#### Option A: Via Supabase Dashboard (Recommended for first time)

1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste contents of `supabase/schema.sql` and run
3. Copy and paste contents of `supabase/rls.sql` and run

#### Option B: Via Supabase CLI

```bash
# Install CLI
npm i -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

### 4. Enable Real-time

In Supabase Dashboard > Replication:
1. Enable replication for tables: `vehicles`, `incidents`, `alerts`, `devices`, `incident_timeline`
2. Or run this SQL:
```sql
alter publication supabase_realtime add table public.vehicles;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.devices;
alter publication supabase_realtime add table public.incident_timeline;
```

### 5. Configure Authentication

In Supabase Dashboard > Authentication > Providers:
1. Enable Email/Password provider
2. (Optional) Enable OAuth providers (Google, GitHub, etc.)
3. Set Site URL to your deployed URL
4. Add redirect URLs for local development

### 6. Create Custom Roles (via SQL Editor)

```sql
-- Create roles in Supabase Auth
-- This is done via the dashboard or by inserting into auth.users with role claim

-- For existing users, update their role:
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "operator"}'::jsonb
where email = 'operator@yourdomain.com';
```

### 7. Seed Database (Optional)

```bash
# Install dependencies
npm install

# Run seed script
npx tsx supabase/seed.ts
```

Or use the Supabase Dashboard to insert sample data manually.

### 8. Run Development Server

```bash
npm run dev
```

## Project Structure

```
supabase/
├── schema.sql          # Database schema (tables, indexes, triggers)
├── rls.sql             # Row Level Security policies
├── seed.ts             # TypeScript seed script
├── migrate.sh          # Migration helper script
└── README.md           # This file
```

## Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user profiles with roles |
| `operators` | Transport operators (multi-tenant) |
| `vehicles` | Vehicle fleet with GPS position |
| `incidents` | Emergency incidents |
| `incident_timeline` | Audit trail for incidents |
| `alerts` | Alert notifications |
| `devices` | ESP32 device health telemetry |
| `system_stats` | Materialized dashboard stats |

### Key Features

- **PostGIS** for geospatial queries (vehicle positions, incident locations)
- **Row Level Security** for multi-tenant operator isolation
- **Real-time subscriptions** for live updates
- **Automatic timestamps** via triggers
- **Indexes** optimized for common query patterns

## RLS Policy Summary

- **Admin**: Full access to all data
- **Operator**: CRUD on their fleet's vehicles, incidents, alerts, devices
- **Dispatcher**: Read/Update incidents & alerts for their fleet
- **Viewer**: Read-only access to their fleet's data

## Testing the Connection

```bash
# Test Supabase connection
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
const { data, error } = await supabase.from('vehicles').select('count', { count: 'exact', head: true });
console.log('Vehicles count:', data);
if (error) console.error(error);
"
```

## Troubleshooting

### "Supabase credentials not configured"
- Ensure `.env.local` exists with valid credentials
- Restart dev server after changes

### Real-time not working
- Check Replication settings in Supabase Dashboard
- Verify tables are added to `supabase_realtime` publication
- Check browser console for connection errors

### RLS blocking queries
- Verify user has correct role in `profiles` table
- Check `operator_id` is set correctly for operators
- Use service role key for admin operations

## Production Checklist

- [ ] Enable Point-in-Time Recovery
- [ ] Configure automated backups
- [ ] Set up read replicas for analytics
- [ ] Configure custom domain for Auth
- [ ] Enable MFA for admin accounts
- [ ] Set up monitoring alerts
- [ ] Configure rate limiting
- [ ] Review and test RLS policies
- [ ] Set up database connection pooling (PgBouncer)