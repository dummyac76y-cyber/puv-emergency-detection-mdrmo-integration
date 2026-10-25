# GSM / 4G cellular crash alerts

## Responsibilities
The device cellular modem sends SMS directly using its SIM/network service. A browser dashboard is not a GSM modem. The same device event is separately uploaded over 4G mobile data to an authenticated receiver. Neither channel proves the other channel succeeded. GSM/SMS here describes the messaging channel; do not assume a 2G-only board supports 4G data or that a selected LTE module/SIM supports SMS without testing it.

This change adds a tested TypeScript routing/message planner and a session-only registry/preview screen. It does not add, flash or test modem firmware. No real SMS sender is connected.

## Recipient registration
A live authorized administrator must register: office ID/name, municipality/jurisdiction, SMS-capable Philippine mobile number, office coordinates, active status, approval reference, permitted test/live mode, and optional designated fallback status. Validate and normalize phone numbers server-side. A number's format does not prove ownership, SMS capability or permission. Confirm these separately before activation. Do not put real numbers or device-user/contact records in a public repository.

The website demo uses in-memory test registrations only. It cannot approve live offices or synchronize configuration to a device. The demo approval string is deliberately labeled non-authoritative and must never be accepted as live authorization by a backend.

## Routing rule
1. Ignore canceled and closed records for new transmission planning.
2. Limit eligibility to approved, active recipients for the configured Kalibo municipality and correct test/live mode. The backend must establish incident jurisdiction; do not infer a municipal boundary from distance or an office's label alone.
3. With a valid recent GNSS fix, rank the eligible registered offices by Haversine straight-line distance. This is not road distance, travel time or an emergency-response promise.
4. Without a valid recent fix, use the explicitly configured authorized fallback. If none exists, keep the event queued/unrouted; do not invent coordinates or silently route using stale location.
5. Select all data from authenticated registrations, not phone numbers supplied by an untrusted device event.
6. Save the chosen recipient/configuration version and a per-event/per-recipient idempotency key. Actual once-only delivery needs durable job/attempt storage; the planner's key alone does not implement it.

Current `Recent fix` uses the existing 120-second display heuristic. Adviser-approved calibration may replace that value. Unknown time and fix-age evidence must not be treated as recent. Offline events retain original occurrence and fix timestamps.

## SMS payload
Required: registered user ID, crash occurrence timestamp with an explicit +08:00 offset, and available GNSS location. Include device ID/event ID for traceability, fix timestamp/freshness and a Google Maps link when coordinates exist. User ID must come from the trusted device-to-user registration, not client input. Missing GNSS is explicitly labeled unavailable. Stale coordinates remain explicitly labeled stale. Do not infer injury/severity.

All test messages begin `TEST ONLY`. Multi-segment SMS handling and actual network charging must be tested on the selected modem/SIM; never truncate away the required fields. A Google Maps link does not need the dashboard's Maps API key.

## Required firmware/backend integration
- Cache the authenticated, approved recipient configuration in non-volatile storage with a version, expiry, integrity/authenticity verification and a documented offline-expiry policy. A fresh unverified website registration is not a trusted modem configuration.
- After automatic crash confirmation/cancellation timing, generate a stable event ID and capture the registered user/device mapping, event time and GNSS fix evidence. Preserve these through retries/reboots.
- Keep a durable outbox and modem-specific SMS encoding/concatenation support. Persist recipient and attempt state before sending. Do not blindly repeat an ambiguous send response: reconcile modem message reference/status to reduce duplicate alerts.
- Record attempted, modem accepted, failed and delivery-confirmed distinctly. Modem acceptance (e.g. CMGS result) is not recipient acknowledgment. Delivery reports are network/module dependent; do not claim one without corresponding evidence.
- Upload the same event and delivery attempts through a protected endpoint; deduplicate by event ID. Authenticated operators read incident/delivery records and record acknowledgments independently.
- Verify power budget, UART logic, antennas, Philippine LTE bands, SMS support, SIM/load, reception and recovery. Do not assign board pins or ship a modem driver until the actual selected board/model and wiring are known.

No official MDRRMO SMS is sent by this implementation. Agency testing requires permission and designated recipients, as specified by the proposal.

## Google Maps setup blocker
No Google Cloud key-management connection or gcloud credentials were available. The Cloud Console credentials page returned "Site Unavailable" in the available browser. No key, billing change, API provisioning or hosting secret was created. The existing app expects `VITE_GOOGLE_MAPS_API_KEY` for Maps JavaScript and Maps Embed APIs, restricted to the intended website domains and APIs. The Google Maps connector's hosted lookup service is not a transferable website key.

References:
- https://developers.google.com/maps/documentation/javascript/get-api-key
- https://developers.google.com/maps/api-security-best-practices
- https://simcom.ee/documents/SIM7600E/SIM7500_SIM7600%20Series_AT%20Command%20Manual%20_V1.10.pdf
