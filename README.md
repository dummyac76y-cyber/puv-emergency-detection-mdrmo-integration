# PUVGUARD — PUV Emergency Monitoring

PUVGUARD is a responsive dashboard prototype for monitoring public utility vehicle (PUV) emergency alerts and coordinating with the Municipal Disaster Risk Reduction and Management Office (MDRRMO).

## Prototype scope

- Operations overview and incident queue
- Incident acknowledgment and status tracking
- PUV fleet and device-health views
- Schematic location preview (not live GPS)
- Reports and CSV export of sample records
- Proposed role model for MDRRMO staff, supervisors, operators, and evaluators
- Integration placeholders for Supabase and the Cato.com API

> **Safety notice:** The prototype is not connected to emergency services, vehicle hardware, SMS dispatch, live GPS, or a production database. Demo incidents and actions are illustrative only. Do not use this prototype for operational emergency response.

## Stack

- React + TypeScript + Vite
- Supabase integration planned (credentials and schema to be added later)
- Cato.com API integration planned (confirm the exact API/product and access method before implementing)

## Run locally

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Netlify deployment

Build command: `npm run build`  
Publish directory: `dist`

The repository includes `netlify.toml` with the build settings and SPA fallback. Connect this repository in Netlify to enable automatic deployments from `main`.

## Environment variables

Add public client configuration only when ready:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never place service-role keys, private Cato API tokens, or other secrets in `VITE_*` variables or client-side code. Private API calls should go through a secured server-side function. Keep integrations disabled until credentials, access controls, and incident-handling behavior have been tested.

## Suggested next steps

1. Rename this GitHub repository to `PUVGUARD` in **Settings → General → Repository name**.
2. Connect the repository to Netlify and set the build command and publish directory above.
3. Add Supabase schema, authentication, row-level security policies, and realtime incident updates.
4. Confirm the Cato API product and API documentation before building its adapter.
5. Replace all demo records with authenticated device events and validate the system in a non-emergency test environment.
