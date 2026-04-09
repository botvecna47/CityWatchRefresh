# Frontend UI Integration & Optimization Plan

## Objective
To safely and methodically integrate the newly updated UI and mobile-optimizations from the `FigmaUpdatedRef` repository into the live `frontend/` workspace without breaking our existing backend API wiring, while specifically addressing component spacing and `react-leaflet` integration.

## Current State Analysis
1. **Reference Repository (`FigmaUpdatedRef`)**: Contains updated UI designs via Figma, including mobile responsive layouts, but relies strictly on mock data (Zustand store) and does not map real coordinates (missing map library).
2. **Actual Workspace (`frontend`)**: Fully wired to the `localhost:8081` Spring Boot backend. Properly fetches real complaint data, upvotes, and coordinates.

## Plan of Action

### Phase 1: Layout & Core Routing Synchronization
- **File:** `frontend/src/app/components/Layout.tsx`
- **Action:** Merge the new mobile-friendly `AppLayout` Navigation from the reference.
- **Spacing Optimization:** Review the root `<main>` tags and global margins. We will reduce `max-w-6xl w-full mx-auto px-4 py-8` to tighter, cleaner paddings (e.g., `max-w-[1400px] px-2 py-4` or similar) to ensure minimal unwanted white space on the left/right and denser component packing.

### Phase 2: Page-by-Page Feature Merge
Instead of copy-pasting full files (which would break API hooks), we will surgically inject the new UI classes and elements into the existing logic:
- **`Home.tsx` / `Dashboards.tsx`:** Update the grid layouts and card designs. Tighten gaps (e.g., changing `gap-6` to `gap-4` or tightening internal `p-6` card paddings). Maintain the existing `fetchReports()` API calls.
- **`ReportDetail.tsx`:** Import the new mobile voting layout and refined comment UI. Keep the backend skeleton loader and API hooks intact.
- **`AuthPage.tsx` / `AdminPanel.tsx` / `SettingsPage.tsx`:** Sync visual structural changes while preserving real auth tokens and Supabase dependencies.

### Phase 3: Global Spacing & UI Clean-up
- Audit `frontend/index.css` and local `className` utility arrays.
- Remove excessive `mb-8`, `py-12`, and large empty paddings around headers.
- Ensure side-bars (like the voting bar in ReportDetail or global layouts) don't create trapped white space.

### Phase 4: `react-leaflet` Integration
Because the reference code relies on a static image for the map, we need to completely overhaul the map sections while applying the new aesthetic parameters:
1. **Install Dependencies:** `npm install react-leaflet leaflet` and `@types/leaflet`.
2. **`MapPage.tsx`:** 
   - Integrate `<MapContainer>`, `<TileLayer>`, and `<Marker>` logic using coordinates fetched from the Spring backend (`report.location.lat`, `report.location.lng`).
   - Implement custom leaflet markers that visually match the new Figma aesthetic.
3. **`SubmitReport.tsx`:** 
   - Add a selectable map component using `useMapEvents` for users to pin their exact location, passing `lat`/`lng` to the real backend payload.

## Review Request
Does this plan precisely align with your vision? Once you approve this strategy, I will execute the component syncs step-by-step starting with Layout spacing and Leaflet setup.
