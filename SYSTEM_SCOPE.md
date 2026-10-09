# PUV Emergency Command Center - System Scope

## Current Focus Area
This system is specifically designed for **vehicle accidents and driver threats** monitoring and response.

## Supported Incident Types
1. **Crash Detection** - Automatic collision detection via vehicle sensors
2. **Manual SOS** - Driver-activated emergency alerts
3. **Medical Emergency** - Health-related incidents affecting driver or passengers
4. **Threat/Hold-up** - Security threats against drivers or vehicles
5. **Other Emergency** - Miscellaneous vehicle-related emergencies

## NOT Included
- Fire disasters
- Building emergencies
- Natural disasters
- Infrastructure failures
- Non-vehicle related incidents

## System Components
- **Overview Dashboard** - Real-time statistics and active emergencies
- **Live Map** - Vehicle tracking with incident markers (Leaflet + OpenStreetMap)
- **Incident Management** - Full incident lifecycle management
- **Vehicle Registry** - Registered PUV database with device assignments
- **Alert History** - Complete log of all alerts with acknowledgment tracking
- **Reports & Analytics** - Charts and metrics for accident/threat analysis
- **Device Health** - ESP32 device status monitoring
- **Settings** - System configuration and notification preferences

## Data Sources
- **Current**: Simulated/demo data (clearly marked)
- **Future Integration**: ESP32 hardware, GPS tracking, GSM/SMS alerts, backend API

## Target Users
- MDRRMO (Municipal Disaster Risk Reduction and Management Office) operators
- Emergency response coordinators
- Fleet managers
- Authorized emergency personnel

## Key Features
- Real-time vehicle tracking with status indicators
- Priority-based alert system (Critical, High, Medium, Low)
- Incident timeline tracking
- Response team dispatch management
- Device health monitoring
- Analytics and reporting
- Responsive design (desktop, tablet, mobile)
- Accessibility compliant (keyboard navigation, proper contrast, text labels)

## Technical Stack
- React 18 + TypeScript
- Tailwind CSS (dark theme)
- Leaflet (interactive maps)
- Recharts (analytics)
- Lucide React (icons)
- Context API (state management)
