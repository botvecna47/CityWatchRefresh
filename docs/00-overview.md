# CityWatch — Project Overview & Architecture

## 1. What Is CityWatch?

CityWatch is a **city-restricted civic complaint facilitation platform** that enables citizens to report local infrastructure issues (potholes, garbage, streetlights, drainage) and have them validated, tracked, and resolved through a distributed coordinator model.

It is designed as a **college mini project** with potential for limited pilot deployment in 3–4 areas.

---

## 2. Core Problem

Current civic complaint systems fail because:

| Problem | CityWatch Solution |
|---|---|
| No accountability | SLA-based deadlines with auto-escalation |
| Fake/spam complaints | Multi-coordinator voting validation |
| Untracked resolutions | Full status lifecycle with 11 states |
| No proof of work | Geo-verified live photo for closure |
| Corruption risk | Random assignment, no leaderboards, audit logs |
| No prioritization | Intensity scoring based on complaint clustering |

---

## 3. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│          React SPA (Vite or CRA)                │
│  ┌──────────┬──────────────┬──────────────────┐ │
│  │ Citizen  │ Coordinator  │  Admin Dashboard │ │
│  │Dashboard │  Dashboard   │                  │ │
│  └──────────┴──────────────┴──────────────────┘ │
│         Google Maps  │  WebRTC Camera            │
└─────────────────────┬───────────────────────────┘
                      │  Axios (REST + JWT)
                      ▼
┌─────────────────────────────────────────────────┐
│                   BACKEND                        │
│           Spring Boot (Java 17+)                │
│  ┌──────────────────────────────────────────┐   │
│  │  Controllers (REST)                      │   │
│  │  ├── AuthController                      │   │
│  │  ├── ComplaintController                 │   │
│  │  ├── VoteController                      │   │
│  │  ├── ProofController                     │   │
│  │  ├── CommentController                   │   │
│  │  ├── AdminController                     │   │
│  │  └── NotificationController              │   │
│  ├──────────────────────────────────────────┤   │
│  │  Services (Business Logic)               │   │
│  │  ├── ComplaintService                    │   │
│  │  ├── VotingService                       │   │
│  │  ├── IntensityService                    │   │
│  │  ├── SLAService                          │   │
│  │  ├── EscalationService                   │   │
│  │  ├── GeoVerificationService              │   │
│  │  ├── TrustService                        │   │
│  │  └── AuditService                        │   │
│  ├──────────────────────────────────────────┤   │
│  │  Security                                │   │
│  │  ├── JwtTokenProvider                    │   │
│  │  ├── SecurityConfig                      │   │
│  │  └── RoleBasedAccessFilter               │   │
│  ├──────────────────────────────────────────┤   │
│  │  Scheduled Tasks                         │   │
│  │  ├── SLADeadlineChecker                  │   │
│  │  └── EscalationScheduler                 │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │  JPA / Hibernate
                      ▼
┌─────────────────────────────────────────────────┐
│                  DATABASE                        │
│            PostgreSQL 15+                       │
│   ┌────────────────────────────────────────┐    │
│   │  users, areas, complaints, votes,      │    │
│   │  proofs, comments, escalations,        │    │
│   │  notifications, audit_logs             │    │
│   │  (+ PostGIS extension for geo queries) │    │
│   └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 4. Three Actors

| Actor | Authority | Key Actions |
|---|---|---|
| **Citizen** | LOW | Submit complaints, view status, confirm/reject resolution |
| **Field Coordinator** | MEDIUM | Vote on complaints, update progress, submit geo-verified proof |
| **Admin** | HIGH | Manage users/zones, handle escalations, review audit logs |

---

## 5. Tech Stack Details

### Frontend
| Technology | Purpose |
|---|---|
| React 18+ | SPA framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |
| Google Maps JavaScript API | Map display, complaint markers, heatmap |
| WebRTC (`getUserMedia`) | Live camera capture for complaint photos and proof |
| CSS Modules or Styled Components | Component-scoped styling |

### Backend
| Technology | Purpose |
|---|---|
| Java 17+ | Language |
| Spring Boot 3.x | Application framework |
| Spring Security | JWT auth + role-based access |
| Spring Data JPA | ORM / database access |
| Spring Scheduler (`@Scheduled`) | SLA checking, auto-escalation |
| Hibernate Spatial (optional) | PostGIS integration for geo queries |
| Swagger / SpringDoc | API documentation |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL 15+ | Primary relational database |
| PostGIS extension (optional) | Spatial queries (radius search, clustering) |

### DevOps (Optional for mini project)
| Technology | Purpose |
|---|---|
| Docker | Containerized deployment |
| Nginx | Reverse proxy / static serving |
| Git + GitHub | Version control |

---

## 6. Project Scope (Mini Project Phase)

### In Scope
- 1 city
- 3–4 areas/zones
- 3–5 coordinators per area
- 5 complaint categories: Pothole, Garbage, Streetlight, Drainage, Other
- Complete complaint lifecycle (submit → validate → assign → resolve → close)
- SLA tracking with auto-escalation
- Geo-verified proof of completion
- Comment system
- Notification system (in-app)
- Audit logging

### Out of Scope
- Full city-wide deployment
- AI/ML features
- Mobile native apps (PWA possible in Phase 3)
- Direct government API integration
- Political performance dashboards
- Public ranking/leaderboards

---

## 7. Five Core Design Principles

1. **No gamified competition** — No leaderboards, no coordinator rankings
2. **No public shaming** — No department performance metrics exposed
3. **No uncontrolled authority** — Even admin has restrictions (can't alter audit logs)
4. **No single-point manipulation** — Distributed voting, random assignment
5. **No legal overreach** — Disclaimer, privacy policy, no personal data exposure

---

## 8. File / Folder Structure (Recommended)

```
CityWatchRevive_V_01/
├── docs/                          # Implementation plans (gitignored)
├── frontend/                      # React application
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instances, API helpers
│   │   ├── assets/                # Images, icons
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Button, Input, Modal, Badge
│   │   │   ├── complaint/         # ComplaintCard, ComplaintForm, ComplaintMap
│   │   │   ├── voting/            # VotePanel
│   │   │   ├── proof/             # CameraCapture, ProofView
│   │   │   └── layout/            # Navbar, Sidebar, Footer
│   │   ├── contexts/              # AuthContext, NotificationContext
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Route-level pages
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── citizen/           # CitizenDashboard, SubmitComplaint, MyComplaints
│   │   │   ├── coordinator/       # CoordinatorDashboard, PendingReviews, AssignedComplaints
│   │   │   └── admin/             # AdminDashboard, UserManagement, AreaManagement
│   │   ├── utils/                 # Helpers, constants, validation
│   │   ├── styles/                # Global CSS, variables
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                       # Spring Boot application
│   ├── src/main/java/com/citywatch/
│   │   ├── config/                # SecurityConfig, CorsConfig, SchedulerConfig
│   │   ├── controller/            # REST controllers
│   │   ├── dto/                   # Request/Response DTOs
│   │   ├── exception/             # Custom exceptions + GlobalExceptionHandler
│   │   ├── model/                 # JPA Entity classes
│   │   ├── repository/           # JPA Repositories
│   │   ├── security/             # JWT provider, filters
│   │   ├── service/              # Business logic services
│   │   ├── scheduler/            # Scheduled tasks (SLA, escalation)
│   │   └── CityWatchApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql               # Seed data (areas, admin account)
│   ├── src/test/                   # Unit + integration tests
│   └── pom.xml
├── plan.md                         # Original project plan
├── .gitignore
└── README.md
```
