# CityWatch — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** February 2026
**Authors:** [Team Name]
**Status:** Draft

---

## 1. Product Overview

### 1.1 Product Name
CityWatch — A Distributed Civic Complaint Monitoring & Facilitation Platform

### 1.2 Product Vision
Enable citizens in controlled urban zones to report local civic issues with geo-tagged evidence, have them validated through distributed coordinator review, tracked against SLA deadlines, and resolved with geo-verified proof — all while maintaining accountability, transparency, and anti-abuse safeguards.

### 1.3 Product Type
Web-based platform (Single Page Application + REST API)

### 1.4 Target Deployment
- **Phase:** College mini project (pilot-ready)
- **Scale:** 1 city, 3–4 areas, 3–5 coordinators per area
- **Timeline:** 8 weeks

---

## 2. Problem Statement

Urban civic complaint systems suffer from:

| Problem | Impact |
|---|---|
| No structured accountability | Complaints go unanswered |
| Delayed or untracked resolutions | Citizens lose trust |
| Fake or spam complaints | Resources wasted |
| No priority classification | Critical issues buried |
| Weak transparency | No audit trail |
| No proof of resolution | Complaints marked "resolved" without evidence |
| Direct government interaction barriers | Independent platforms can't bypass bureaucracy |

### 2.1 Current Gap
There is no system that:
- Validates complaint authenticity through distributed review
- Enforces geo-verified proof of completion
- Tracks resolution against defined SLA timelines
- Maintains anti-abuse safeguards for all actors
- Operates within legal and ethical boundaries

---

## 3. Target Users

### 3.1 Primary Users

| User | Profile | Need |
|---|---|---|
| **Citizens** | Residents of covered areas | Report issues, track resolution, confirm completion |
| **Field Coordinators** | Hired/verified intermediaries | Validate complaints, coordinate resolution, provide proof |
| **Admins** | System administrators | Manage users, zones, escalations, system integrity |

### 3.2 User Demographics
- Citizens: 18–60 years, basic smartphone/computer literacy
- Coordinators: Locally hired, trained on the platform
- Admins: Technical team members

---

## 4. Core Features (MVP)

### 4.1 Complaint Submission
- Citizens select category, write description (min 50 chars)
- Live photo capture via device camera (no file upload)
- Auto GPS capture from browser
- Duplicate detection within 100m radius
- Rate limiting (max 5/day/citizen)

### 4.2 Distributed Validation (Voting)
- 3–5 coordinators per area vote independently
- Options: Valid / Invalid / Needs Clarification
- ≥60% majority determines outcome
- Votes hidden until all cast (prevents herd behavior)
- Ties escalated to admin

### 4.3 Intensity-Based Prioritization
- Cluster similar complaints within 500m radius
- Weighted by citizen trust level
- Priority levels: Low, Medium, High, Critical
- No gamification — internal metric only

### 4.4 SLA-Based Tracking
- Each category has predefined resolution deadline
- Auto-calculated on assignment
- System auto-detects delays
- 3-level automatic escalation

### 4.5 Random Coordinator Assignment
- System selects randomly (load-balanced)
- No self-assignment
- Reassignment on reopening excludes previous coordinator

### 4.6 Geo-Verified Proof of Completion
- Coordinator must visit site
- Live photo via camera (no upload)
- GPS auto-captured and distance-verified (≤100m)
- No closure without valid proof

### 4.7 Citizen Confirmation
- Citizen accepts → Closed
- Citizen rejects (with reason) → Reopened
- Auto-close after 7 days of no response

### 4.8 Comment System
- Threaded discussions on complaints
- Profanity filtering
- Admin moderation capability

### 4.9 Notification System
- In-app notifications for all status changes
- Vote requests, SLA warnings, escalations

### 4.10 Admin Panel
- User management (create coordinators, suspend users, manage trust)
- Area/zone management
- Escalation review
- SLA configuration
- Audit log viewer
- System statistics dashboard

### 4.11 Trust & Reputation (Non-Public)
- Citizen trust: Normal → Under Review → Restricted
- Coordinator status: Active → Warning → Suspended
- No leaderboards — internal metrics only

### 4.12 Anti-Abuse Mechanisms
- Rate limiting
- Duplicate detection
- Strike system for rejected complaints
- Coordinator vote auditing
- Mandatory audit logging
- GPS verification

---

## 5. Explicitly Out of Scope

| Feature | Reason |
|---|---|
| Full city-wide deployment | Mini project scale limitation |
| AI/ML-based classification | Scope and timeline |
| Mobile native apps | Web-only for mini project; PWA in Phase 3 |
| Direct government API integration | Legal/bureaucratic barriers |
| Political performance dashboards | Legal risk |
| Public ranking/leaderboards | Prevents unhealthy competition |
| Push notifications | In-app only for mini project |
| Email verification | Stretch goal |
| Password reset flow | Admin-assisted for mini project |
| Payment/billing | Not applicable |
| Multi-language support | English only for mini project |
| Offline mode | Requires internet |

---

## 6. Success Criteria

| Metric | Target |
|---|---|
| Complete complaint lifecycle works end-to-end | ✅ |
| All 3 roles can perform their defined actions | ✅ |
| SLA tracking and auto-escalation functions | ✅ |
| Geo-verification rejects proofs from wrong location | ✅ |
| Audit log captures all state changes | ✅ |
| No invalid status transitions possible | ✅ |
| Rate limiting prevents spam | ✅ |
| System handles 50 concurrent users | ✅ |

---

## 7. Assumptions

1. Users have access to a device with a camera and GPS
2. Users have a modern browser (Chrome, Firefox, Edge, Safari)
3. Internet connectivity is available
4. HTTPS is available for production (required for camera/GPS APIs)
5. PostgreSQL database server is available
6. Google Maps API key is available (free tier sufficient)
7. 3–4 geographic areas are predefined with bounding boxes
8. Coordinators are hired/verified offline before account creation

---

## 8. Constraints

1. 8-week development timeline
2. 2-person development team
3. No budget for paid cloud services (use free tiers)
4. Must operate within legal boundaries (no government system integration)
5. Must not publicly rank or shame any officials
6. Must not collect unnecessary personal data

---

## 9. Dependencies

| Dependency | Type | Risk |
|---|---|---|
| Google Maps JavaScript API | External | API key required, free tier limits |
| PostgreSQL 15+ | Infrastructure | Must be installed and configured |
| Modern browser with WebRTC | Client | Older browsers won't work |
| HTTPS for production | Infrastructure | Camera/GPS blocked without it |
| JDK 17+ | Development | Must be installed |
| Node.js 18+ | Development | Must be installed |

---

## 10. Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| Project Guide | | | |
| Team Member 1 | | | |
| Team Member 2 | | | |
