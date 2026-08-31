# 🗺️ SmartCrop — District Distress Map

## 1. Overview

Build an interactive **Agricultural District Distress Map** for the SmartCrop Agriculture Officer / Administrator Dashboard.

The map will allow officers to visually identify where agricultural distress is occurring across the district and quickly identify high-risk farmers requiring intervention.

The map is a core component of the **Agricultural Distress Command Center**. It must support:

- Geo-tagged farmer locations
- Crop distress risk visualization
- High / Moderate / Low risk classification
- Interactive farmer information
- District / block / village-level monitoring
- Risk-based filtering
- Crop-based filtering
- Distress-reason filtering
- Farmer intervention workflow

The existing SmartCrop specification defines the officer dashboard around simultaneous monitoring of many farmers and includes a district distress map with High, Medium, and Low risk visualization.

---

# 2. Technology

Use the following technologies:

- **Next.js 16.3.2**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **MapLibre GL JS v5**
- **OpenFreeMap Liberty style**
- Existing SmartCrop API architecture
- Existing AWS RDS MySQL database

Do **not** use Mapbox.

Do **not** use Google Maps.

Do **not** replace the existing application architecture.

---

# 3. Map Library

Use:

**MapLibre GL JS**

Install:

```bash
npm install maplibre-gl
```

Import MapLibre CSS:

```tsx
import "maplibre-gl/dist/maplibre-gl.css";
```

Map style:

```text
https://tiles.openfreemap.org/styles/liberty
```

The map must be initialized using this style.

Example:

```tsx
const map = new maplibregl.Map({
  container: mapContainer.current,
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [86.7, 21.9],
  zoom: 9,
});
```

The exact center should be determined from the selected district rather than hardcoded permanently.

---

# 4. Main Objective

The map should answer:

> **Where is agricultural distress happening, how severe is it, and which farmers need intervention?**

The officer should be able to:

```text
Open Officer Dashboard
        ↓
View District Distress Map
        ↓
Identify High-Risk Areas
        ↓
Click Farmer / Cluster
        ↓
View Risk Information
        ↓
View Risk Factors
        ↓
View Recommended Intervention
        ↓
Assign Field Visit / Contact Farmer
```

This follows the SmartCrop core workflow:

```text
Monitor Crop
      ↓
Detect Distress
      ↓
Explain Why
      ↓
Recommend Intervention
      ↓
Alert / Assign Officer
```

---

# 5. Map Location

The map belongs primarily to:

```text
/app/admin/dashboard
```

and may also be reused in:

```text
/app/officer-dashboard
```

The existing project already defines:

```text
Admin Command Center
/officer-dashboard
/agriculture-officer-dashboard
```

The map component should therefore be reusable.

Recommended component:

```text
components/
└── officer/
    └── DistrictDistressMap.tsx
```

Alternative:

```text
components/
└── admin/
    └── DistrictDistressMap.tsx
```

Prefer placing it in `components/officer/` if both Officer and Administrator dashboards use the same component.

---

# 6. Map Layout

Create a professional command-center style map.

```text
┌─────────────────────────────────────────────────────────────┐
│ DISTRICT DISTRESS MAP                                       │
│ Mayurbhanj District                         🔄 Last updated │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Risk: [All ▼]   Crop: [All ▼]   Block: [All ▼]            │
│  Reason: [All ▼]     [Reset Filters]                       │
│                                                             │
├───────────────────────────────────────────────┬─────────────┤
│                                               │             │
│                                               │  SELECTED   │
│                                               │  FARMER     │
│                                               │             │
│              🟢                               │  Ramesh     │
│                       🟡                      │  Paddy      │
│                                               │             │
│         🔴                                    │  Risk 81    │
│                  🔴                           │  HIGH       │
│                                               │             │
│    🟢                 🟡                      │  Soil LOW   │
│                                               │  Rain ↓35%  │
│                         🔴                    │             │
│                                               │ [View]      │
│                                               │ [Assign]    │
│                                               │             │
├───────────────────────────────────────────────┴─────────────┤
│ 🔴 High     🟡 Moderate     🟢 Low                          │
└─────────────────────────────────────────────────────────────┘
```

---

# 7. Risk Classification

Every farmer must have a numerical distress score.

```text
0 – 39
LOW

40 – 69
MODERATE

70 – 100
HIGH
```

Display:

```text
🔴 HIGH
🟡 MODERATE
🟢 LOW
```

Do not depend only on emoji.

The map itself should visually communicate the risk using MapLibre layers.

---

# 8. Map Visualization

Use MapLibre circle layers.

Recommended visual hierarchy:

### High Risk

```text
Risk >= 70
```

Display as:

- Large circle
- Strong visual prominence
- Optional pulsing/animated effect
- Highest priority

### Moderate Risk

```text
40 <= Risk < 70
```

Display as:

- Medium circle

### Low Risk

```text
Risk < 40
```

Display as:

- Smaller circle

The exact visual styling should remain consistent throughout the application.

---

# 9. Farmer Data

Each map point should represent a farmer or farm location.

Minimum data structure:

```ts
interface DistressFarmer {
  id: string;
  farmerId: string;
  name: string;

  latitude: number;
  longitude: number;

  district: string;
  block?: string;
  village?: string;

  crop: string;
  area?: number;

  riskScore: number;

  riskLevel: "HIGH" | "MODERATE" | "LOW";

  rainfallRisk?: number;
  soilMoisture?: number;
  ndvi?: number;
  marketRisk?: number;
  financialRisk?: number;

  primaryReason?: string;

  riskTrend?: "INCREASING" | "STABLE" | "DECREASING";

  lastUpdated?: string;
}
```

---

# 10. GeoJSON

Convert farmer records into GeoJSON.

Example:

```ts
const geojson = {
  type: "FeatureCollection",
  features: farmers.map((farmer) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        farmer.longitude,
        farmer.latitude,
      ],
    },
    properties: {
      id: farmer.id,
      farmerId: farmer.farmerId,
      name: farmer.name,
      crop: farmer.crop,
      riskScore: farmer.riskScore,
      riskLevel: farmer.riskLevel,
      primaryReason: farmer.primaryReason,
    },
  })),
};
```

Use this GeoJSON as the MapLibre source.

---

# 11. MapLibre Source

Create a source:

```ts
map.addSource("farmer-distress", {
  type: "geojson",
  data: geojson,
});
```

Do not create hundreds of React components for individual markers.

Use MapLibre's native source/layer system.

---

# 12. Risk Circle Layer

Create a circle layer based on the risk score.

Conceptually:

```text
70–100 → HIGH
40–69  → MODERATE
0–39   → LOW
```

The layer should dynamically change:

- Circle radius
- Circle opacity
- Stroke
- Risk category

based on the farmer's risk score.

---

# 13. Clustering

The district may eventually contain thousands of farmers.

Therefore enable GeoJSON clustering.

Example concept:

```ts
cluster: true
clusterMaxZoom: 14
clusterRadius: 50
```

When zoomed out:

```text
        ┌───────┐
        │  127  │
        │ FARMERS│
        └───────┘
```

When zooming in:

```text
Cluster
   ↓
Smaller Cluster
   ↓
Individual Farmers
```

Cluster counts must update automatically.

---

# 14. Risk-Aware Clusters

Clusters should communicate risk.

For example:

```text
🔴 127
```

means the cluster contains significant high-risk farmers.

Preferably calculate cluster properties so officers can understand:

```text
Total Farmers: 127
High Risk: 32
Moderate: 51
Low: 44
```

When clicking a cluster, zoom into that region.

---

# 15. Popup / Farmer Card

Clicking an individual farmer must display a compact information card.

Example:

```text
┌────────────────────────────┐
│ 🚨 HIGH DISTRESS           │
│                            │
│ Ramesh                     │
│ Paddy • 2.5 acres          │
│                            │
│ Risk Score                 │
│ 81 / 100                   │
│                            │
│ Main Risk                  │
│ Soil Moisture LOW          │
│                            │
│ Rainfall ↓ 35%             │
│ NDVI ↓ 18%                 │
│ Price ↓ 22%                │
│                            │
│ [VIEW FARMER]              │
│ [ASSIGN FIELD VISIT]       │
└────────────────────────────┘
```

Do not put excessive information directly on the map.

Use the popup/card for details.

---

# 16. Farmer Details Navigation

When:

```text
[VIEW FARMER]
```

is clicked, navigate to:

```text
/officer-dashboard/farmers/[farmerId]
```

or use the existing farmer detail route if one already exists.

The project already defines:

```text
GET /api/officer/farmers/[farmerId]
```

for detailed farmer history and inspection records.

Use the existing API rather than creating a duplicate farmer-detail system.

---

# 17. Filters

The map must contain filters.

### Risk

```text
All
High
Moderate
Low
```

### Crop

```text
All Crops
Paddy
Maize
Groundnut
Wheat
Other
```

The crop list should preferably come dynamically from backend data.

### Block

```text
All Blocks
Block A
Block B
Block C
...
```

### Distress Reason

```text
All
Weather
Soil Moisture
Crop Health
Market
Financial
Pest / Disease
```

---

# 18. Filter Behavior

Filters must update the map immediately.

Example:

```text
Risk = HIGH

       ↓

Only farmers with:

riskScore >= 70

       ↓

Map updates
```

Do not reload the entire page.

Use React state and update the MapLibre source data.

---

# 19. Search

Add a farmer/location search.

Example:

```text
🔍 Search farmer, village or block...
```

Search should support:

- Farmer name
- Farmer ID
- Village
- Block

Example:

```text
Search: Ramesh

→ Ramesh Kumar
  Paddy
  Risk: 81
```

Selecting the result should:

1. Center the map
2. Zoom to the farmer
3. Open the farmer popup

---

# 20. District Boundary

Display the selected district boundary if boundary GeoJSON is available.

Example:

```text
District Boundary
       ↓
MapLibre GeoJSON source
       ↓
Polygon layer
```

The district boundary should be subtle and should not hide farmer points.

If official boundary data is not available, do not fabricate boundaries.

---

# 21. Block-Level Visualization

Support block-level analysis.

Example:

```text
Mayurbhanj

Baripada
├── High: 12
├── Moderate: 24
└── Low: 51

Udala
├── High: 5
├── Moderate: 18
└── Low: 33
```

When a block is selected:

```text
Map
 ↓
Zoom to Block
 ↓
Display Farmers
```

---

# 22. Map Statistics

Display a small statistics bar above or beside the map.

```text
┌────────────┬────────────┬────────────┬──────────────┐
│ FARMERS    │ HIGH RISK  │ MODERATE   │ INCREASING   │
│ 1,248      │ 17         │ 34         │ 42           │
└────────────┴────────────┴────────────┴──────────────┘
```

The SmartCrop officer dashboard already specifies district-level statistics such as:

- Farmers monitored
- High-risk farmers
- Increasing-risk farmers

Use backend values rather than hardcoded values.

---

# 23. API Integration

Use the existing officer API architecture.

Primary endpoint:

```http
GET /api/officer/farmers
```

This endpoint should provide the farmer data required for mapping.

If the current endpoint does not return coordinates, extend it rather than creating an unrelated endpoint.

Required backend response:

```json
{
  "success": true,
  "farmers": [
    {
      "id": "F001",
      "farmerId": "SC10001",
      "name": "Ramesh",
      "latitude": 21.932,
      "longitude": 86.735,
      "district": "Mayurbhanj",
      "block": "Baripada",
      "village": "Example Village",
      "crop": "Paddy",
      "area": 2.5,
      "riskScore": 81,
      "riskLevel": "HIGH",
      "primaryReason": "Low Soil Moisture",
      "riskTrend": "INCREASING"
    }
  ]
}
```

---

# 24. Backend Database Requirements

The map requires reliable geographic information.

Farmer/farm profile data should contain:

```text
farmer_id
latitude
longitude
district
block
village
```

Risk data should contain:

```text
risk_score
risk_level
weather_risk
soil_risk
crop_health_risk
market_risk
financial_risk
primary_reason
risk_trend
updated_at
```

Use the existing AWS RDS MySQL database.

The project already contains farmer profiles, crops, and crop risk/risk score tables.

Do not create duplicate tables unnecessarily.

---

# 25. Data Security

This is an administrator/officer feature.

Only authorized users should access the map.

The existing project specifies:

```text
/admin/*
/officer-dashboard/*
```

as administrator-protected routes.

The backend must also enforce authorization.

Do not rely only on frontend route protection.

The API should reject unauthorized requests:

```text
Unauthenticated
      ↓
401 Unauthorized

Authenticated but unauthorized
      ↓
403 Forbidden
```

Never expose sensitive farmer information to unauthorized users.

---

# 26. Loading State

When the map is loading:

```text
┌──────────────────────────────┐
│                              │
│       Loading distress       │
│            map...            │
│                              │
└──────────────────────────────┘
```

Use a skeleton/spinner consistent with the SmartCrop design.

Do not show an empty map without explaining that data is loading.

---

# 27. Error State

If the API fails:

```text
⚠️ Unable to load distress data

We couldn't retrieve the latest
farmer distress information.

[RETRY]
```

Do not silently fail.

---

# 28. Empty State

If filters produce no farmers:

```text
No farmers found

No farmers match the selected
risk, crop, block, or distress filters.

[RESET FILTERS]
```

---

# 29. Last Updated

Display:

```text
Last updated: 2 minutes ago
```

or:

```text
Updated: 30 Aug 2026, 17:25
```

Use the backend timestamp.

Do not fabricate timestamps.

Provide a refresh button:

```text
↻ Refresh
```

---

# 30. Responsive Design

Desktop:

```text
┌──────────────────────────────────────────────┐
│ Filters                                      │
├──────────────────────────────────┬───────────┤
│                                  │ Farmer    │
│              MAP                 │ Details   │
│                                  │           │
└──────────────────────────────────┴───────────┘
```

Tablet:

```text
┌─────────────────────────────┐
│ Filters                     │
├─────────────────────────────┤
│                             │
│             MAP             │
│                             │
├─────────────────────────────┤
│ Selected Farmer              │
└─────────────────────────────┘
```

Mobile:

```text
┌───────────────────┐
│ Distress Map      │
│ Filters           │
├───────────────────┤
│                   │
│       MAP         │
│                   │
├───────────────────┤
│ Farmer Details    │
└───────────────────┘
```

The map must have a usable height on mobile.

---

# 31. Map Controls

Include:

- Zoom in
- Zoom out
- Reset / fit district
- Fullscreen
- Locate selected farmer
- Optional navigation control

Avoid unnecessary controls.

The interface should feel like a professional government/agriculture command center.

---

# 32. Legend

Always display the risk legend.

```text
DISTRESS LEVEL

🔴 High       70–100
🟡 Moderate   40–69
🟢 Low        0–39
```

Do not rely on color alone.

Include text labels for accessibility.

---

# 33. Accessibility

Ensure:

- Buttons have accessible labels
- Filter controls are keyboard accessible
- Popup actions can be reached by keyboard
- Do not communicate risk using color alone
- Sufficient contrast
- Screen-reader labels for important actions

Example:

```tsx
<button aria-label="Refresh distress map">
  ↻
</button>
```

---

# 34. Performance Requirements

The map must remain responsive with large datasets.

Requirements:

- Use GeoJSON source
- Use MapLibre layers
- Enable clustering
- Avoid rendering every farmer as a React component
- Avoid unnecessary map recreation
- Do not initialize MapLibre on every React render
- Clean up the map instance on component unmount

Use:

```tsx
useRef()
```

for:

```text
map instance
map container
```

---

# 35. Next.js Client Component

Because MapLibre requires browser APIs, the map component should be a client component.

Start the component with:

```tsx
"use client";
```

Do not initialize MapLibre during server-side rendering.

Recommended pattern:

```text
DistrictDistressMap.tsx

"use client"

React lifecycle
      ↓
Create MapLibre instance
      ↓
Load Liberty style
      ↓
Fetch distress data
      ↓
Create GeoJSON source
      ↓
Create layers
      ↓
Attach interactions
```

---

# 36. Map Initialization

The component should roughly follow:

```text
Component Mount
      ↓
Create MapLibre Map
      ↓
Load OpenFreeMap Liberty
      ↓
Add Navigation Control
      ↓
Add Farmer GeoJSON Source
      ↓
Add Cluster Layers
      ↓
Add Risk Layers
      ↓
Add Popup Interaction
      ↓
Map Ready
```

Never initialize the map more than once for the same component instance.

---

# 37. Map Interaction

Implement:

### Hover

Hovering over a farmer:

```text
Cursor → pointer
```

Optional tooltip:

```text
Ramesh
Risk: 81 HIGH
```

### Click

Click:

```text
Farmer marker
      ↓
Popup / Side panel
```

### Cluster Click

Click:

```text
Cluster
      ↓
Zoom into cluster
```

---

# 38. High-Risk Priority

High-risk farmers should be visually prominent.

The officer should immediately identify:

```text
🔴 HIGH RISK
```

The map must make it easy to answer:

> Which areas need immediate attention?

High-risk locations should therefore not be hidden behind multiple interactions.

---

# 39. Risk Trend

If available, display risk trend:

```text
↗ Increasing
→ Stable
↘ Decreasing
```

Example:

```text
Risk: 81 🔴
Trend: ↗ Increasing
```

This is important because a farmer with:

```text
Risk = 65
Trend = Increasing
```

may deserve attention even though the farmer is not currently classified as high risk.

---

# 40. Distress Reason

The popup should identify the primary reason.

Examples:

```text
🌧️ Weather Stress
💧 Low Soil Moisture
🌱 Crop Health Decline
💰 Market Decline
💳 Financial Risk
🐛 Pest / Disease
```

The backend should determine the primary reason.

The frontend should not invent the reason.

---

# 41. Intervention Actions

The farmer popup should support:

```text
[VIEW FARMER]
[ASSIGN FIELD VISIT]
```

If supported by the existing application:

```text
[CALL FARMER]
[SEND SMS]
```

These actions connect the map to the existing intervention workflow.

The existing SmartCrop specification explicitly defines field inspection, farmer contact, SMS, and assigning field visits as officer actions.

---

# 42. Field Visit

When:

```text
ASSIGN FIELD VISIT
```

is clicked:

Open a modal:

```text
ASSIGN FIELD VISIT

Farmer:
Ramesh

Priority:
HIGH

Reason:
Low Soil Moisture

Officer:
[Select Officer]

Date:
[Select Date]

Time:
[Select Time]

Notes:
[........................]

[Cancel] [Assign Visit]
```

After successful assignment:

```text
✓ Field visit assigned successfully
```

---

# 43. Recommended Component Structure

Create:

```text
components/
└── officer/
    ├── DistrictDistressMap.tsx
    ├── DistressMapFilters.tsx
    ├── DistressMapLegend.tsx
    ├── FarmerMapPopup.tsx
    ├── DistressMapStats.tsx
    └── AssignFieldVisitModal.tsx
```

If unnecessary, components can be combined, but keep the main map component manageable.

---

# 44. Recommended Page Structure

```text
app/
└── admin/
    └── dashboard/
        └── page.tsx
```

Example:

```tsx
<AdminDashboard>
  <DistressMapStats />

  <DistressMapFilters />

  <DistrictDistressMap />

  <DistressMapLegend />
</AdminDashboard>
```

---

# 45. Do Not Break Existing Features

The implementation must not break:

- Authentication
- RBAC
- Farmer dashboard
- Officer dashboard
- Bank portal
- Government portal
- Notifications
- Crop monitoring
- Existing API routes
- Existing database connection
- Existing language system

The current project uses Next.js 16.3.2, React 19, Tailwind CSS v4, AWS RDS MySQL, and role-based middleware. Preserve these systems.

---

# 46. Multilingual Support

The existing application supports multiple Indian languages, including:

```text
English
Hindi
Odia
Bengali
Telugu
Tamil
Marathi
Gujarati
Punjabi
Kannada
Malayalam
Assamese
...
```

Map UI text should use the existing translation system where practical.

Examples:

```text
District Distress Map
High Risk
Moderate Risk
Low Risk
Refresh
View Farmer
Assign Field Visit
```

Do not create a second translation system.

Use the existing:

```text
language-context.tsx
```

---

# 47. Mock Data

For development, mock data may be used temporarily.

Example:

```ts
const mockFarmers = [
  {
    id: "F001",
    farmerId: "SC1001",
    name: "Ramesh",
    latitude: 21.93,
    longitude: 86.73,
    district: "Mayurbhanj",
    block: "Baripada",
    village: "Village A",
    crop: "Paddy",
    area: 2.5,
    riskScore: 81,
    riskLevel: "HIGH",
    primaryReason: "Low Soil Moisture",
    riskTrend: "INCREASING",
  },
];
```

Mock data must be clearly separated from production API logic.

Do not leave fake farmer data in the production build.

---

# 48. Important Data Rule

Never hardcode:

```text
1,248 farmers
17 high-risk
34 moderate
128 low
```

These values are examples from the UI specification.

Production values must come from the backend.

The map must reflect actual database/API data.

---

# 49. Security Requirements

Never expose:

- Passwords
- Authentication tokens
- Private financial credentials
- Aadhaar numbers
- Sensitive KYC information

through map properties.

The map only needs the minimum information required for officer intervention.

---

# 50. Final User Experience

The finished map should allow an Agriculture Officer to do this within seconds:

```text
1. Open Command Center
          ↓
2. See district-wide distress
          ↓
3. Identify 🔴 high-risk region
          ↓
4. Zoom into region
          ↓
5. Click farmer
          ↓
6. See risk score + reason
          ↓
7. Open farmer details
          ↓
8. Assign field inspection
```

The map is not just a geographic visualization.

It is an **operational distress-monitoring and intervention tool**.

---

# 51. Acceptance Criteria

The feature is complete only when all of the following work:

- [ ] MapLibre GL JS is installed
- [ ] MapLibre CSS is imported
- [ ] OpenFreeMap Liberty style loads
- [ ] Map loads correctly in Next.js
- [ ] District is displayed
- [ ] Farmer coordinates are loaded from API
- [ ] Farmers are displayed as GeoJSON
- [ ] High-risk farmers are visually distinct
- [ ] Moderate-risk farmers are visually distinct
- [ ] Low-risk farmers are visually distinct
- [ ] Clustering works
- [ ] Clicking a cluster zooms in
- [ ] Clicking a farmer opens details
- [ ] Farmer search works
- [ ] Risk filter works
- [ ] Crop filter works
- [ ] Block filter works
- [ ] Distress-reason filter works
- [ ] Reset filters works
- [ ] Map refresh works
- [ ] Loading state works
- [ ] Error state works
- [ ] Empty state works
- [ ] Last-updated timestamp is displayed
- [ ] Farmer details navigation works
- [ ] Field visit assignment works
- [ ] Unauthorized users cannot access the map data
- [ ] Mobile layout works
- [ ] No sensitive farmer data is exposed
- [ ] Existing SmartCrop features remain unaffected
- [ ] TypeScript has no errors
- [ ] Production build succeeds

---

# 52. Verification

Run:

```bash
npx tsc --noEmit
```

Then:

```bash
npm run build
```

Finally:

```bash
npm run dev
```

Test:

```text
/admin/dashboard
```

and:

```text
/officer-dashboard
```

Verify the map using:

- Desktop
- Tablet
- Mobile
- Different risk filters
- Different crop filters
- Multiple farmer clusters
- No-data condition
- API failure condition
- Unauthorized account

---

# 53. Definition of Done

The District Distress Map is considered complete when an authorized Agriculture Officer can:

> **View all monitored farmers geographically, identify high-risk distress areas, filter farmers by risk/crop/block/reason, inspect individual farmer risk information, and initiate an intervention directly from the map.**

The implementation must integrate with the existing SmartCrop architecture rather than becoming a separate standalone mapping application.

---

## Core Flow

```text
                 SMARTCROP
                     │
                     ▼
          AGRICULTURE OFFICER
                     │
                     ▼
          DISTRESS COMMAND CENTER
                     │
                     ▼
             DISTRICT MAP
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        🔴 HIGH   🟡 MODERATE  🟢 LOW
          │          │          │
          └──────────┼──────────┘
                     ▼
              FARMER / CLUSTER
                     │
                     ▼
              RISK INFORMATION
                     │
                     ▼
             RISK EXPLANATION
                     │
                     ▼
           RECOMMENDED ACTION
                     │
                     ▼
            FIELD INTERVENTION
```

**The primary goal is not simply to show farmers on a map. The goal is to turn geographic distress data into an actionable officer intervention workflow.**