# CityWatch — Project Snapshot
> Last updated: 2026-04-08

---

## Project Structure — What's What

```
CityWatchRevive_V_01/
├── frontend/                       ✅ ACTIVE FRONTEND — React 18, Supabase SDK, refactored logic.
├── backend/                        ✅ ACTIVE BACKEND — Spring Boot backend
├── Reference/                      ⚠️ REFERENCE ONLY — Archives of deprecated frontends
├── database/                       📁 Supabase/SQL configurations
├── Diary/                          📁 Developer notes and logs
├── Report/                         📁 Status/Analysis reports
├── docs/                           📁 Documentations, implementation plans, architecture guides
├── run_project.bat                 🚀 Unified launcher script
└── README.md                       📖 Clean, accurate startup guide
```

---

## Recent Migrations Completed
| Task | Status | Details |
|------|--------|---------|
| **Directory Restructure** | ✅ | Removed duplicated code, consolidated all active frontend components into `frontend/`. |
| **Frontend Mock Data Purge** | ✅ | `store.tsx` successfully decoupled from fake data, explicitly wired to Spring Boot `/api/`. |
| **UX Stabilization** | ✅ | Extensively implemented `Skeleton` loading states across `Home`, `ReportDetail` and `Dashboards`. |
| **Code Splitting** | ✅ | Implemented React `lazy()` and `SuspenseLayout` components in `routes.tsx` to turbocharge loading. |
| **Leaflet Architecture Analysis**| ✅ | Formulated structural implementation plan for incoming github updates. |

---

## Migration TODO Checklist (Next Steps)
When updated frontend GitHub is provided:
- [ ] Ingest new UI over `.git` or direct clone.
- [ ] Merge active `store.tsx` API logic into new UI flawlessly.
- [ ] Integrate React-Leaflet inside `MapPage.tsx` and `SubmitReport.tsx`.
- [ ] Spin up `run_project.bat` to test cohesive database connections, backend SLA logic, and active map rendering.
