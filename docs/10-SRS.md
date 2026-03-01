# Software Requirements Specification

## CityWatch — A Distributed Civic Complaint Monitoring & Facilitation Platform

**Document Version:** 2.0
**Prepared by:** [Team Name]
**Date:** February 2026
**Institution:** [College/University Name]
**Department:** [Department Name]

**Standard:** IEEE 830-1998 (IEEE Recommended Practice for Software Requirements Specifications)

---

## Table of Contents

1. [Introduction](#1-introduction)
   1. [Purpose](#11-purpose)
   2. [Document Conventions](#12-document-conventions)
   3. [Intended Audience and Reading Suggestions](#13-intended-audience-and-reading-suggestions)
   4. [Product Scope](#14-product-scope)
   5. [References](#15-references)
   6. [Definitions, Acronyms, and Abbreviations](#16-definitions-acronyms-and-abbreviations)
2. [Overall Description](#2-overall-description)
   1. [Product Perspective](#21-product-perspective)
   2. [Product Functions](#22-product-functions)
   3. [User Classes and Characteristics](#23-user-classes-and-characteristics)
   4. [Operating Environment](#24-operating-environment)
   5. [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   6. [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [External Interface Requirements](#3-external-interface-requirements)
   1. [User Interfaces](#31-user-interfaces)
   2. [Hardware Interfaces](#32-hardware-interfaces)
   3. [Software Interfaces](#33-software-interfaces)
   4. [Communication Interfaces](#34-communication-interfaces)
4. [System Features](#4-system-features)
5. [Other Nonfunctional Requirements](#5-other-nonfunctional-requirements)
   1. [Performance Requirements](#51-performance-requirements)
   2. [Safety Requirements](#52-safety-requirements)
   3. [Security Requirements](#53-security-requirements)
   4. [Software Quality Attributes](#54-software-quality-attributes)
6. [Appendix A: Analysis Models](#appendix-a-analysis-models)
7. [Appendix B: Issues List](#appendix-b-issues-list)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete and precise description of the functional and non-functional requirements for **CityWatch**, a web-based civic complaint monitoring and facilitation platform. It is intended to serve as the primary reference for the development team throughout the software lifecycle, and as the binding contract between the development team and the project evaluators.

This document follows the IEEE 830-1998 recommended format for Software Requirements Specifications.

### 1.2 Document Conventions

| Convention | Meaning |
|---|---|
| **Bold text** | Key terms or emphasis |
| `Monospace` | Code elements, entity names, API paths |
| FR-XX | Functional Requirement identifier |
| NFR-XX | Non-Functional Requirement identifier |
| UC-XX | Use Case reference (see `docs/11-use-cases.md`) |
| SHALL | Mandatory requirement (must be implemented) |
| SHOULD | Recommended requirement (implement if time permits) |
| MAY | Optional requirement (future enhancement) |

Priority conventions for requirements:

| Priority | Meaning |
|---|---|
| **P1 — Essential** | Must be in the final deliverable. Project fails without this. |
| **P2 — Desirable** | Should be implemented. Missing it reduces quality but doesn't fail the project. |
| **P3 — Optional** | Nice to have. Implement if time allows after P1 and P2 are complete. |

### 1.3 Intended Audience and Reading Suggestions

| Audience | Sections to Read |
|---|---|
| **Project Evaluators / Examiners** | All sections, especially §2 (Overview), §4 (Features), §5 (NFRs) |
| **Development Team** | §3 (Interfaces), §4 (Features — detailed requirements), §5 (Performance, Security) |
| **Project Guide** | §1 (Scope), §2 (Overview), §4 (Feature summary), §5 (Quality) |
| **Future Maintainers** | §2 (Constraints), §3 (Interfaces), §4 (Features), Appendix A |

### 1.4 Product Scope

CityWatch is a city-restricted civic complaint facilitation platform that enables:

- **Citizens** to submit geo-tagged, photographically evidenced complaints about local infrastructure issues
- **Field Coordinators** to validate complaint authenticity through distributed voting, coordinate resolution, and submit geo-verified proof of completion
- **Administrators** to manage users, areas, escalations, and system integrity

The system does NOT:
- Integrate with any government API or database
- Publicly rank, rate, or shame any government officials or departments
- Operate as a legal or official complaint mechanism
- Provide mobile native applications (web-only)
- Include AI/ML-based classification or analysis

The complete product scope is defined in the Product Requirements Document (`docs/09-PRD.md`).

### 1.5 References

| Document | Location |
|---|---|
| Product Requirements Document (PRD) | `docs/09-PRD.md` |
| Database Schema | `docs/01-database-schema.md` |
| API Contract Documentation | `docs/02-backend-api.md` |
| Use Case Document | `docs/11-use-cases.md` |
| UML Diagrams | `docs/21-uml-diagrams.md` |
| Workflow & Logic | `docs/04-workflows-and-logic.md` |
| Security & Anti-Abuse | `docs/05-security-and-antiabuse.md` |
| Risk Assessment | `docs/14-risk-assessment.md` |
| IEEE 830-1998 | IEEE Recommended Practice for SRS |

### 1.6 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| SLA | Service Level Agreement — maximum time allowed to resolve a complaint by category |
| JWT | JSON Web Token — stateless, self-contained authentication token |
| RBAC | Role-Based Access Control — permissions determined by user role |
| WebRTC | Web Real-Time Communication — browser API for camera/microphone access |
| GPS | Global Positioning System — satellite-based positioning |
| SPA | Single Page Application — web app that dynamically updates without page reloads |
| REST | Representational State Transfer — architectural style for web APIs |
| JPA | Java Persistence API — standard Java ORM specification |
| ORM | Object-Relational Mapping — database abstraction layer |
| BCrypt | Adaptive hash function used for password storage |
| Haversine | Formula for great-circle distance between two GPS points |
| PostGIS | PostgreSQL extension for geographic data types and queries |
| ACID | Atomicity, Consistency, Isolation, Durability — database transaction guarantees |
| CRUD | Create, Read, Update, Delete — basic data operations |
| CSP | Content Security Policy — HTTP headers preventing XSS |
| XSS | Cross-Site Scripting — injection of malicious scripts |
| CORS | Cross-Origin Resource Sharing — browser security for cross-domain requests |
| CSRF | Cross-Site Request Forgery — attack forcing authenticated requests |
| DTO | Data Transfer Object — separate object for API request/response |
| HMR | Hot Module Replacement — instant browser updates during development |
| Coordinator | Offline-verified intermediary between citizens and local governance |
| Intensity Score | Calculated priority metric based on complaint clustering |
| Escalation | Automatic priority increase when SLA is exceeded or resolution is rejected |
| Trust Level | Internal reliability score for citizens (NORMAL / UNDER_REVIEW / RESTRICTED) |

---

## 2. Overall Description

### 2.1 Product Perspective

CityWatch is a **new, self-contained product**. It is not a replacement for, extension of, or integration with any existing government complaint system. It operates as an independent facilitation layer between citizens and local governance.

#### 2.1.1 System Context

```
┌────────────┐           ┌──────────────┐           ┌──────────────┐
│  Citizens  │◄─────────►│              │◄─────────►│ Coordinators │
│  (Browser) │           │  CITYWATCH   │           │  (Browser)   │
└────────────┘   HTTPS   │   SERVER     │   HTTPS   └──────────────┘
                         │ (Spring Boot)│
┌────────────┐           │              │           ┌──────────────┐
│   Admin    │◄─────────►│              │◄─────────►│  PostgreSQL  │
│  (Browser) │           │              │           │  Database    │
└────────────┘           └──────┬───────┘           └──────────────┘
                                │
                         ┌──────┴───────┐
                         │ Google Maps  │
                         │     API      │
                         └──────────────┘
```

#### 2.1.2 System Interfaces

The system consists of three tiers:
1. **Presentation Tier** — React.js SPA (client-side)
2. **Application Tier** — Spring Boot REST API (server-side)
3. **Data Tier** — PostgreSQL 15 RDBMS

### 2.2 Product Functions

The following table summarizes the major functions of CityWatch, grouped by actor:

| # | Function | Actor | Priority |
|---|---|---|---|
| F1 | Register and authenticate users | All | P1 |
| F2 | Submit complaints with live photo and GPS | Citizen | P1 |
| F3 | View, filter, and track complaints | All | P1 |
| F4 | Validate complaints through distributed voting | Coordinator | P1 |
| F5 | Auto-assign coordinator on approval | System | P1 |
| F6 | Track resolution against SLA deadline | System | P1 |
| F7 | Submit geo-verified proof of resolution | Coordinator | P1 |
| F8 | Confirm or reject resolution | Citizen | P1 |
| F9 | Auto-escalate on SLA violation | System | P1 |
| F10 | Manage users, areas, and escalations | Admin | P1 |
| F11 | Maintain append-only audit log | System | P1 |
| F12 | Calculate complaint intensity/priority | System | P2 |
| F13 | Thread-based commenting | All | P2 |
| F14 | In-app notifications | System | P2 |
| F15 | Map view with complaint markers | All | P2 |
| F16 | Duplicate complaint detection | System | P2 |

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Proficiency | Frequency of Use | Security Privilege |
|---|---|---|---|---|
| **Citizen** | Residents of covered areas who report civic issues | Basic (smartphone literacy) | Daily–weekly | Lowest (self-data + submit) |
| **Field Coordinator** | Offline-verified intermediaries | Moderate (trained on platform) | Daily | Medium (review + resolve in area) |
| **System Administrator** | Technical team members managing the platform | Advanced | Weekly | Highest (all data + config) |
| **System (Automated)** | Scheduled processes for SLA and escalation | N/A (software) | Continuous (hourly scheduler) | Full DB access |

### 2.4 Operating Environment

#### 2.4.1 Client Environment

| Requirement | Specification |
|---|---|
| Browsers | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Device | Desktop, laptop, tablet, or smartphone |
| Screen | Responsive design (320px to 2560px width) |
| Camera | Device camera accessible via WebRTC |
| GPS | GPS receiver accessible via Geolocation API |
| Network | Internet connection required |
| Protocol | HTTP (dev), HTTPS (production — required for camera/GPS) |

#### 2.4.2 Server Environment

| Requirement | Specification |
|---|---|
| Runtime | JDK 17+ (OpenJDK recommended) |
| Framework | Spring Boot 3.x |
| Database | PostgreSQL 15+ |
| Build | Maven 3.8+ |
| OS | Platform-independent (Windows, Linux, macOS) |

### 2.5 Design and Implementation Constraints

| # | Constraint | Rationale |
|---|---|---|
| C1 | Must use React.js for frontend | College project requirement |
| C2 | Must use Spring Boot for backend | College project requirement |
| C3 | Must use PostgreSQL for database | College project requirement |
| C4 | Must complete within 8 weeks | Academic semester constraint |
| C5 | 2-person development team | Team size constraint |
| C6 | No direct government system integration | Legal and institutional limitation |
| C7 | No public ranking of officials | Legal risk avoidance |
| C8 | No paid third-party services | Budget constraint (zero budget) |
| C9 | HTTPS required for production deployment | Browser requirement for camera/GPS APIs |
| C10 | No mobile native app | Scope limitation for mini project |

### 2.6 Assumptions and Dependencies

#### Assumptions

| # | Assumption |
|---|---|
| A1 | Users have access to a device with camera and GPS |
| A2 | Users have access to a modern web browser (listed in §2.4.1) |
| A3 | Internet connectivity is available to all users |
| A4 | 3–4 geographic areas are predefined with bounding box coordinates |
| A5 | Coordinators are hired and verified offline before account creation |
| A6 | The development team has access to PostgreSQL installation |
| A7 | A Google Maps API key is available (free tier) |

#### Dependencies

| # | Dependency | Impact if Unavailable |
|---|---|---|
| D1 | Google Maps JavaScript API | Map view non-functional; fallback to coordinate display |
| D2 | Browser Geolocation API | Cannot determine complaint location; submission blocked |
| D3 | Browser MediaDevices API (WebRTC) | Cannot capture photos; submission blocked |
| D4 | PostgreSQL 15+ | No data persistence; application non-functional |
| D5 | JDK 17+ | Backend won't compile |
| D6 | Node.js 18+ | Frontend dev server won't start |

---

## 3. External Interface Requirements

### 3.1 User Interfaces

The system SHALL provide the following user interfaces:

| UI-ID | Interface | Description | Reference |
|---|---|---|---|
| UI-01 | Landing Page | Public page with project description and login/register links | WF-01 |
| UI-02 | Login Page | Email/password form with validation feedback | WF-02 |
| UI-03 | Registration Page | Multi-field form with password strength indicator | WF-03 |
| UI-04 | Citizen Dashboard | Summary statistics, recent complaints, submit button | WF-04 |
| UI-05 | Submit Complaint Wizard | 5-step wizard (category → description → photo → GPS → review) | WF-05 |
| UI-06 | Complaint Detail Page | Full complaint view with status timeline, comments, map | WF-06 |
| UI-07 | Coordinator Review Panel | Pending complaints with vote interface | WF-07 |
| UI-08 | Proof Submission Page | Side-by-side camera + distance verification | WF-08 |
| UI-09 | Admin Dashboard | System statistics, escalation summary, quick actions | WF-09 |
| UI-10 | User Management Page | User table with filter, search, and action dropdowns | WF-10 |
| UI-11 | Notification Panel | Chronological list with read/unread state | WF-11 |
| UI-12 | Map View | Google Maps with complaint markers, filters | WF-12 |
| UI-13 | Confirmation View | Before/after photos with accept/reject actions | WF-13 |

All wireframe references (WF-XX) are detailed in `docs/12-wireframes.md`.

**General UI Requirements:**
- UI-GEN-01: The system SHALL be responsive across screen widths from 320px to 2560px.
- UI-GEN-02: The system SHALL display loading indicators during asynchronous operations.
- UI-GEN-03: The system SHALL display user-friendly error messages (not stack traces).
- UI-GEN-04: The system SHALL provide empty-state messaging when no data is available.

### 3.2 Hardware Interfaces

| HW-ID | Interface | Purpose | API |
|---|---|---|---|
| HW-01 | Device Camera | Live photo capture for complaints and proofs | `navigator.mediaDevices.getUserMedia({video: true})` |
| HW-02 | GPS Receiver | Location capture for complaints and proofs | `navigator.geolocation.getCurrentPosition()` |

### 3.3 Software Interfaces

| SW-ID | Interface | Version | Purpose |
|---|---|---|---|
| SW-01 | Google Maps JavaScript API | 3.x | Map display, markers, clustering, heatmap |
| SW-02 | PostgreSQL JDBC Driver | 42.x | Database connectivity via HikariCP connection pool |
| SW-03 | Spring Security | 6.x | Authentication (JWT), authorization (RBAC) |
| SW-04 | Spring Data JPA | 3.x | ORM, repository auto-generation |
| SW-05 | Swagger/SpringDoc | 2.x | Auto-generated API documentation |

### 3.4 Communication Interfaces

| CI-ID | Interface | Protocol | Data Format | Direction |
|---|---|---|---|---|
| CI-01 | Frontend ↔ Backend | HTTPS (REST) | JSON | Bidirectional |
| CI-02 | Backend ↔ Database | JDBC (TCP:5432) | SQL | Bidirectional |
| CI-03 | Frontend ↔ Google Maps | HTTPS | Google Maps SDK | Frontend → Google |
| CI-04 | Frontend ↔ Browser APIs | In-process | JavaScript API | Frontend → Browser |

---

## 4. System Features

### 4.1 User Registration and Authentication

**Priority:** P1 — Essential

#### 4.1.1 Description and Priority
The system SHALL allow anonymous users to register as citizens and all registered users to authenticate via email/password with JWT-based session management.

#### 4.1.2 Stimulus/Response Sequences

| Stimulus | Response |
|---|---|
| User submits registration form | System creates account, returns JWT token |
| User submits login form | System validates credentials, returns JWT token |
| User accesses protected route without token | System redirects to login page |
| User accesses route with expired token | System redirects to login page |
| User accesses route for unauthorized role | System returns 403 and redirects |

#### 4.1.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | The system SHALL allow user registration with: username (unique, 3–30 chars), email (unique, valid format), password (≥8 chars, ≥1 uppercase, ≥1 number), phone (optional, validated format), city (from allowed list). | P1 |
| FR-1.2 | The system SHALL hash passwords using BCrypt with a minimum cost factor of 12 before storage. Passwords SHALL never be stored or logged in plain text. | P1 |
| FR-1.3 | The system SHALL generate a JWT token containing user_id, role, and expiration (24 hours) upon successful registration or login. | P1 |
| FR-1.4 | The system SHALL return a generic "Invalid credentials" message for both wrong email and wrong password, to prevent email enumeration. | P1 |
| FR-1.5 | The system SHALL reject login attempts for accounts with status = SUSPENDED, returning "Account suspended. Contact administrator." | P1 |
| FR-1.6 | The system SHALL enforce rate limiting on login: maximum 5 attempts per 15 minutes per IP address. Exceeding this SHALL return HTTP 429 with retry information. | P2 |
| FR-1.7 | The system SHALL enforce rate limiting on registration: maximum 3 registrations per hour per IP address. | P2 |
| FR-1.8 | The system SHALL validate the JWT token on every authenticated API request by checking signature validity, expiration, and user status (not SUSPENDED). | P1 |
| FR-1.9 | On logout, the frontend SHALL clear the stored JWT token and all cached user state, and redirect to the login page. | P1 |

---

### 4.2 Complaint Submission

**Priority:** P1 — Essential

#### 4.2.1 Description and Priority
The system SHALL allow authenticated citizens to submit civic complaints through a guided wizard with mandatory live photo and GPS evidence.

#### 4.2.2 Stimulus/Response Sequences

| Stimulus | Response |
|---|---|
| Citizen selects category and enters description | System validates input, moves to next step |
| Citizen captures live photo | System stores photo, moves to next step |
| Citizen's GPS is captured | System validates coverage, shows on map |
| Citizen submits final complaint | System saves, assigns area, notifies coordinators |

#### 4.2.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | The system SHALL present a 5-step wizard: Category → Description → Photo → Location → Review. | P1 |
| FR-2.2 | The system SHALL accept complaints in the following categories: POTHOLE, GARBAGE, STREETLIGHT, DRAINAGE, OTHER. | P1 |
| FR-2.3 | The system SHALL require a text description of minimum 50 characters and maximum 1000 characters, with a live character counter. | P1 |
| FR-2.4 | The system SHALL capture photos exclusively via WebRTC (device camera). No `<input type="file">` SHALL be available. | P1 |
| FR-2.5 | The system SHALL capture GPS coordinates via the browser Geolocation API with `enableHighAccuracy: true`. | P1 |
| FR-2.6 | The system SHALL display the captured GPS coordinates on a map with a pin and allow minor manual adjustment (within 50m). | P2 |
| FR-2.7 | The system SHALL verify that the GPS coordinates fall within a defined area bounding box. Coordinates outside all areas SHALL be rejected with error "Your location is not in our coverage area." | P1 |
| FR-2.8 | The system SHALL assign the complaint to the area whose bounding box contains the GPS coordinates. | P1 |
| FR-2.9 | The system SHALL enforce a rate limit of maximum 5 complaints per 24 hours per citizen. | P1 |
| FR-2.10 | The system SHALL check for duplicate complaints: same category within 100m radius within the last 7 days. Duplicates SHALL be rejected with a link to the existing complaint. | P2 |
| FR-2.11 | The system SHALL reject complaints from citizens with trust_level = RESTRICTED, returning "Your account is under review." | P1 |
| FR-2.12 | Upon successful submission, the system SHALL set complaint status to PENDING_REVIEW and notify all active coordinators in the assigned area. | P1 |
| FR-2.13 | The system SHALL validate server-side: description length, image presence, GPS presence, trust level, rate limit, and area coverage — regardless of frontend validation. | P1 |

---

### 4.3 Distributed Complaint Validation (Voting)

**Priority:** P1 — Essential

#### 4.3.1 Description and Priority
The system SHALL enable distributed validation of complaint authenticity through independent coordinator voting with majority-based decisions.

#### 4.3.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | The system SHALL allow coordinators assigned to the complaint's area to vote on complaints with status PENDING_REVIEW. | P1 |
| FR-3.2 | Each vote SHALL be one of: VALID, INVALID, or NEEDS_CLARIFICATION. | P1 |
| FR-3.3 | The system SHALL enforce one vote per coordinator per complaint via a database UNIQUE constraint on (complaint_id, coordinator_id). | P1 |
| FR-3.4 | The system SHALL NOT reveal individual vote decisions to any coordinator until all eligible coordinators have voted or the voting timeout expires. The system SHALL only display the total vote count (e.g., "3 of 5 voted"). | P1 |
| FR-3.5 | When ≥60% of votes are VALID, the system SHALL set status to APPROVED, calculate intensity score, and trigger auto-assignment. | P1 |
| FR-3.6 | When ≥60% of votes are INVALID, the system SHALL set status to REJECTED and increment the citizen's strike count. | P1 |
| FR-3.7 | When no majority is reached after all coordinators have voted, the system SHALL escalate to admin for manual review. | P1 |
| FR-3.8 | If the voting period exceeds 48 hours without sufficient votes for a majority, the system SHALL auto-escalate to admin. | P2 |
| FR-3.9 | The system SHALL only allow coordinators whose area_id matches the complaint's area_id to vote. Cross-area voting SHALL be rejected with HTTP 403. | P1 |
| FR-3.10 | Coordinators with status ≠ ACTIVE SHALL NOT be allowed to vote. | P1 |

---

### 4.4 Coordinator Assignment and SLA Tracking

**Priority:** P1 — Essential

#### 4.4.1 Description and Priority
The system SHALL automatically assign coordinators to approved complaints and monitor resolution against SLA deadlines with automatic escalation.

#### 4.4.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | Upon complaint approval, the system SHALL automatically assign a random active coordinator from the complaint's area, weighted by current active assignment count (load balancing). | P1 |
| FR-4.2 | If the complaint was previously assigned (reopened), the system SHALL exclude all previously assigned coordinators. | P1 |
| FR-4.3 | If no active, eligible coordinators are available, the system SHALL create a Level 1 escalation and notify the admin. | P1 |
| FR-4.4 | Upon assignment, the system SHALL calculate the SLA deadline as: `sla_deadline = NOW() + sla_config.sla_hours` based on the complaint category. | P1 |
| FR-4.5 | The system SHALL run an SLA monitoring scheduled task every 60 minutes. | P1 |
| FR-4.6 | For complaints where `status IN (ASSIGNED, IN_PROGRESS) AND sla_deadline < NOW()`, the system SHALL set status to DELAYED and create escalation records: Level 1 (0–24h overdue), Level 2 (24–48h overdue), Level 3 (48h+ overdue). | P1 |
| FR-4.7 | The assigned coordinator SHALL be able to update status from ASSIGNED to IN_PROGRESS to acknowledge the assignment. | P1 |

---

### 4.5 Geo-Verified Proof of Completion

**Priority:** P1 — Essential

#### 4.5.1 Description and Priority
The system SHALL require coordinators to submit location-verified photographic evidence of complaint resolution.

#### 4.5.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | Only the assigned coordinator SHALL be allowed to submit proof for a complaint. | P1 |
| FR-5.2 | Proof submission SHALL only be allowed when complaint status is IN_PROGRESS. | P1 |
| FR-5.3 | Proof SHALL consist of a live photo (WebRTC, no file upload) and auto-captured GPS coordinates. | P1 |
| FR-5.4 | The system SHALL calculate the Haversine distance between the proof GPS coordinates and the original complaint GPS coordinates. | P1 |
| FR-5.5 | If distance ≤ 100 meters, the proof SHALL be accepted. If distance > 100 meters, the proof SHALL be rejected with the message "You are Xm away from the complaint location. You must be within 100m." | P1 |
| FR-5.6 | Upon proof acceptance, the system SHALL set complaint status to COMPLETED and notify the citizen. | P1 |
| FR-5.7 | The system SHALL store all proof records (including rejected ones) for audit purposes. | P2 |

---

### 4.6 Citizen Confirmation

**Priority:** P1 — Essential

#### 4.6.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-6.1 | Only the citizen who submitted the complaint SHALL be able to confirm or reject a resolution. | P1 |
| FR-6.2 | Confirmation SHALL only be available when complaint status is COMPLETED. | P1 |
| FR-6.3 | If accepted: status → CLOSED, `closed_at` recorded, coordinator notified. | P1 |
| FR-6.4 | If rejected: mandatory reason (≥20 chars), status → REOPENED, `reopen_count++`, `escalation_level++`, new coordinator assigned (excluding previous). | P1 |
| FR-6.5 | Maximum 3 reopens per complaint. After 3rd rejection, status → ADMIN_REVIEW. | P1 |
| FR-6.6 | If no citizen response within 7 days of COMPLETED status, the system SHALL auto-close the complaint with note "Auto-closed: no citizen response within 7 days." | P1 |

---

### 4.7 Comment System

**Priority:** P2 — Desirable

#### 4.7.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-7.1 | Any authenticated user SHALL be able to post comments on complaints. | P2 |
| FR-7.2 | Comments SHALL support threading via optional parent_id. | P2 |
| FR-7.3 | Comments SHALL have a minimum length of 5 characters. | P2 |
| FR-7.4 | The system SHALL run a profanity filter on comment content before saving. | P2 |
| FR-7.5 | Comments SHALL be rate-limited to 10 per hour per user. | P2 |
| FR-7.6 | Admins SHALL be able to soft-delete (moderate) comments. Deleted comments SHALL show "Comment removed by moderator." | P3 |

---

### 4.8 Notification System

**Priority:** P2 — Desirable

#### 4.8.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-8.1 | The system SHALL create in-app notifications for: status changes, vote requests, SLA warnings, escalations, and comment replies. | P2 |
| FR-8.2 | Notifications SHALL support mark-as-read (individual and bulk). | P2 |
| FR-8.3 | The notification list SHALL be paginated. | P2 |
| FR-8.4 | The system SHALL display an unread notification count badge in the navigation bar. | P2 |

---

### 4.9 Administrative Functions

**Priority:** P1 — Essential

#### 4.9.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-9.1 | Admins SHALL be able to create coordinator accounts with assigned area. | P1 |
| FR-9.2 | Admins SHALL be able to change any user's status (ACTIVE / WARNING / SUSPENDED). | P1 |
| FR-9.3 | Admins SHALL be able to change citizen trust levels (NORMAL / UNDER_REVIEW / RESTRICTED). | P1 |
| FR-9.4 | The system SHALL prevent admins from modifying their own account status. | P1 |
| FR-9.5 | Admins SHALL be able to view, filter, and search audit logs. | P1 |
| FR-9.6 | Admins SHALL be able to review and resolve escalations. | P1 |
| FR-9.7 | Admins SHALL be able to create and edit geographic areas with bounding box coordinates. | P2 |
| FR-9.8 | The system SHALL NOT allow deletion of areas with active complaints. | P2 |
| FR-9.9 | Admins SHALL have access to system statistics (complaint counts by status, category, area, and time period). | P2 |

---

### 4.10 Audit Logging

**Priority:** P1 — Essential

#### 4.10.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | The system SHALL automatically log every state-changing action to the `audit_logs` table. | P1 |
| FR-10.2 | Each audit log entry SHALL contain: timestamp, actor (user_id), action description, entity type, entity ID, old value, new value, and IP address. | P1 |
| FR-10.3 | The `audit_logs` table SHALL be append-only. No UPDATE or DELETE operations SHALL be permitted on this table, enforced at the database user permission level. | P1 |
| FR-10.4 | Audit logs SHALL be accessible only to administrators. | P1 |

---

### 4.11 Map View

**Priority:** P2 — Desirable

#### 4.11.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-11.1 | The system SHALL display complaints as markers on a Google Maps interface. | P2 |
| FR-11.2 | Markers SHALL be color-coded by category or priority/status. | P2 |
| FR-11.3 | Clicking a marker SHALL display a popup with complaint summary and a link to the detail page. | P2 |
| FR-11.4 | The system SHOULD implement marker clustering for dense areas. | P3 |

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements

| ID | Requirement | Metric | Target |
|---|---|---|---|
| NFR-1.1 | Page load time | Time to interactive | < 3 seconds |
| NFR-1.2 | API response time | 95th percentile latency | < 500 ms |
| NFR-1.3 | Concurrent user capacity | Simultaneous active users | ≥ 50 |
| NFR-1.4 | Database query time | Average query execution | < 200 ms |
| NFR-1.5 | Image processing time | Upload + compress + save | < 5 seconds |
| NFR-1.6 | Map rendering time | Initial map load with markers | < 4 seconds |

### 5.2 Safety Requirements

| ID | Requirement |
|---|---|
| NFR-2.1 | The system SHALL include a disclaimer stating it is not an official government platform. |
| NFR-2.2 | The system SHALL NOT display any content that publicly ranks, shames, or rates government officials or departments. |
| NFR-2.3 | The system SHALL strip EXIF metadata from uploaded images before storage to protect user location privacy beyond what is explicitly captured. |

### 5.3 Security Requirements

| ID | Requirement | Priority |
|---|---|---|
| NFR-3.1 | All passwords SHALL be hashed using BCrypt with cost factor ≥ 12. | P1 |
| NFR-3.2 | All API endpoints (except /auth/register, /auth/login) SHALL require valid JWT authentication. | P1 |
| NFR-3.3 | All endpoints with role restrictions SHALL enforce authorization via Spring Security annotations at the controller level. | P1 |
| NFR-3.4 | All user input SHALL be validated server-side, regardless of client-side validation. | P1 |
| NFR-3.5 | All database queries SHALL use parameterized queries (JPA) to prevent SQL injection. | P1 |
| NFR-3.6 | The system SHALL set appropriate HTTP security headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security. | P2 |
| NFR-3.7 | Image uploads SHALL be validated by checking magic bytes (file header) to ensure they are JPEG or PNG, regardless of file extension. | P1 |
| NFR-3.8 | The system SHALL limit image upload size to maximum 5 MB. | P1 |
| NFR-3.9 | The system SHALL enforce CORS to only allow requests from the configured frontend origin. | P1 |
| NFR-3.10 | Error responses SHALL NOT expose stack traces, internal paths, or database details. | P1 |

### 5.4 Software Quality Attributes

#### 5.4.1 Reliability
| ID | Requirement |
|---|---|
| NFR-4.1 | All state-changing operations SHALL be wrapped in database transactions (`@Transactional`) to ensure atomicity. |
| NFR-4.2 | The SLA scheduler SHALL be idempotent — running it multiple times for the same period SHALL produce the same result. |
| NFR-4.3 | The system SHALL handle concurrent modifications using optimistic locking (`@Version` on entities). |

#### 5.4.2 Usability
| ID | Requirement |
|---|---|
| NFR-5.1 | The system SHALL use semantic HTML elements for accessibility. |
| NFR-5.2 | All form inputs SHALL have visible labels or accessible ARIA attributes. |
| NFR-5.3 | Error messages SHALL be specific and actionable (e.g., "Description must be at least 50 characters. You have 23." — not "Invalid input."). |

#### 5.4.3 Maintainability
| ID | Requirement |
|---|---|
| NFR-6.1 | Backend code SHALL follow the layered architecture: Controller → Service → Repository. |
| NFR-6.2 | Frontend code SHALL use reusable React components. |
| NFR-6.3 | Configuration values (JWT secret, SLA hours, rate limits) SHALL be stored in environment variables or database tables, NOT hardcoded. |
| NFR-6.4 | The project SHALL maintain version control using Git with meaningful commit messages. |

#### 5.4.4 Portability
| ID | Requirement |
|---|---|
| NFR-7.1 | The backend SHALL run on any platform with JDK 17+ (Windows, Linux, macOS). |
| NFR-7.2 | The frontend SHALL function in all browsers listed in §2.4.1. |

---

## Appendix A: Analysis Models

The following analysis models are maintained as separate documents for readability:

| Model | Document |
|---|---|
| Data Flow Diagrams (Level 0, 1, 2) | `docs/21-uml-diagrams.md` §1 |
| Sequence Diagrams | `docs/21-uml-diagrams.md` §2 |
| Class Diagram | `docs/21-uml-diagrams.md` §3 |
| State Transition Diagram | `docs/21-uml-diagrams.md` §4 |
| Activity Diagram | `docs/21-uml-diagrams.md` §5 |
| Component Diagram | `docs/21-uml-diagrams.md` §6 |
| ER Diagram | `docs/01-database-schema.md` |
| Wireframes | `docs/12-wireframes.md` |

---

## Appendix B: Issues List

| ID | Issue | Status | Resolution |
|---|---|---|---|
| ISS-01 | Refresh token not implemented | Accepted | Users re-login every 24h. Acceptable for mini project. |
| ISS-02 | No email verification | Accepted | Admin verifies coordinator emails offline. Citizens self-register. |
| ISS-03 | JWT in localStorage (XSS risk) | Accepted | Mitigated by CSP headers. HttpOnly cookies recommended for production. |
| ISS-04 | No automated tests | Accepted | 60+ manual test cases defined. Automated testing out of scope for 8-week timeline. |
| ISS-05 | GPS spoofing possible | Accepted | Defense-in-depth (voting, citizen confirmation, strikes). No perfect browser solution exists. |
| ISS-06 | No password reset flow | Accepted | Admin-assisted reset for mini project. Self-service reset deferred. |
| ISS-07 | WebRTC not supported on all browsers | Accepted | Supported on Chrome/Firefox/Safari/Edge (covers 95%+ market). Error fallback provided. |
