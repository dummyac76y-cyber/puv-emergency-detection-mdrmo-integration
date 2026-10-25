# PUV Guard: Kalibo tricycle research prototype

The active interface follows the supplied October 2026 revised proposal, pages 7–8 and 13–16. Scope is motorized tricycle prototypes operating in Kalibo, Aklan.

## Active interface
- Incident queue, search, status filtering and record export.
- Automatic suspected-crash events only, following the user’s clarified scope.
- Google Maps Embed API for the selected event, GNSS fix timestamp and missing/stale/future-time handling.
- Distinct SMS attempt, modem acceptance, verified delivery, server receipt and acknowledgment evidence.
- Acknowledge then close workflow with session event history.
- Prototype power, IMU, 801S, cellular and offline queue examples.
- Controlled test protocol and proposed firmware timing requirements.

## Current implementation boundary
This redesign is a **demo preview**, not a live monitoring installation. It loads only explicitly synthetic, in-memory records. It never loads the previous Supabase providers, sends SMS, dispatches responders or writes to a cloud database. Leaving the demo or refreshing clears session edits. No real user authentication is claimed or simulated.

The previous Supabase code remains in the repository for reference and migration; it is not mounted by App.tsx. A complete Firebase migration is not implemented. No existing private data is moved or deleted. Do not publish this as a completed operational system.

## Required before live use
1. Select the actual Firebase project and Firestore database edition, enable Authentication, and configure authorized domains.
2. Implement authenticated role-based dashboard access with server-enforced authorization. Do not trust client-editable user metadata for roles.
3. Add a protected device ingestion backend with schema validation, registered-device authentication, event-ID deduplication and rate limiting. Admin credentials stay server-side.
4. Read devices, incidents and deliveryAttempts only for authorized users. Write acknowledgment plus auditLogs atomically; reject invalid state transitions on the server.
5. Protect contact details and location records with least-privilege rules and a reviewed retention policy.
6. Verify firmware: 10-second automatic-event cancellation, durable queue and accurate modem/delivery receipts.
7. Run hardware, authentication/rules and end-to-end tests with designated recipients before any pilot. Government notifications require written permission.

A GNSS fix is displayed as recent for 120 seconds relative to the current browser time. This is a documented display heuristic, not an approved research threshold or position-accuracy result. Clock uncertainty must be handled in the live ingestion implementation.

## Excluded
Automated dispatch, responder management, inferred injury severity, general Aklan fleet tracking, buses/jeepneys, and invented performance results.

## Verification
- `npx tsc --noEmit -p tsconfig.guard.json` checks the new interface.
- `npx vitest run src/test/guard.test.ts` tests evidence separation, legal state transitions, stale-fix handling and CSV safety.
- `npm run build` produces the deployment bundle.
- The repository-wide typecheck has existing failures in legacy pages/tests. The dedicated config does not replace or hide that command.

Design references: https://www.nngroup.com/articles/principles-visual-design/ and https://www.w3.org/WAI/WCAG22/Understanding/use-of-color/ . Use clear hierarchy, restrained emphasis, explicit status text, visible keyboard focus, responsive layouts and reduced-motion support.

## Clarified scope and mapping
The user explicitly removed manual SOS and driver assistance from this website, overriding those parts of the supplied proposal. Only automatic crash detection is represented.

The active map uses Google Maps Embed API, not OpenStreetMap or Leaflet. Configure VITE_GOOGLE_MAPS_API_KEY with an API key enabled for Maps Embed API and restrict it to the deployed website domains and that API. The browser key is public by design; never use a server credential here. Without a key the UI shows a configuration message and coordinates, without requesting a map. No project billing or API provisioning was changed. Iframe errors from Google remain visible inside the map; cross-origin response contents cannot be verified by this app.

## Crash dashboard
The default workspace tab is now Dashboard. It contains the Google Maps crash overview, active-crash list, missing-GNSS count and a selected-event review link. Only new/acknowledged events are active; closed records remain in incident records. Missing locations are retained in the list and never assigned invented coordinates.

The overview map uses Google Maps JavaScript API and Advanced Markers via the official @googlemaps/js-api-loader package. Enable Maps JavaScript API for VITE_GOOGLE_MAPS_API_KEY as well as Maps Embed API for the individual incident detail map. VITE_GOOGLE_MAPS_MAP_ID is optional in this demo (DEMO_MAP_ID is the fallback). Configure a production map ID before live operation. Markers reflect supplied event state; a protected real-time Firebase data subscription still needs implementation and verification. The dashboard explicitly labels this as a disconnected demo feed and does not simulate actual incoming accidents.

## Cellular SMS and MDRRMO recipient routing
The Cellular & recipients tab now provides a session-only test recipient registry and exact crash-SMS preview. Incident records and CSV exports include registered user ID. The pure routing planner selects the nearest eligible registered office using a recent position, and requires an explicitly configured fallback for missing/stale GNSS. It separates test/live registrations and blocks invalid, canceled and closed events. It does not send SMS, authorize live offices or synchronize the registry to hardware. No real MDRRMO numbers are seeded. See docs/CELLULAR_ALERTS.md for the modem/backend integration contract and the Google Cloud provisioning blocker.
