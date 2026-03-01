# CityWatch — Project Abstract / Synopsis

**Project Title:** CityWatch — A Distributed Civic Complaint Monitoring & Facilitation Platform

**Team Size:** 1 member (Solo Developer)

**Duration:** 8 Weeks

**Technology:** React.js, Spring Boot (Java), PostgreSQL

---

## Abstract

Urban civic complaint systems in India currently suffer from a lack of structured accountability, delayed or untracked resolutions, vulnerability to spam and fake complaints, and absence of verified proof-of-completion. Citizens face a gap between reporting local infrastructure issues and having them resolved transparently.

**CityWatch** is a web-based civic complaint facilitation platform that addresses these challenges through a multi-layered validation and tracking architecture. The system introduces **field coordinators** as offline-verified intermediaries between citizens and local governance, creating a controlled facilitation layer that avoids direct government system integration while improving operational transparency.

The platform implements five core innovations:

1. **Distributed Coordinator Validation** — Each complaint is reviewed through an independent voting mechanism by 3–5 field coordinators. A ≥60% majority threshold determines complaint validity, preventing single-point manipulation and ensuring complaints are genuine before resource allocation.

2. **Intensity-Based Prioritization** — A logarithmic clustering algorithm groups similar complaints within a geographic radius and assigns dynamic priority levels (Low, Medium, High, Critical), ensuring critical issues surface without gamified ranking.

3. **SLA-Based Resolution Tracking** — Each complaint category has a predefined Service Level Agreement deadline. A scheduled monitoring process automatically detects delays and triggers a three-level escalation system, creating systemic accountability.

4. **Geo-Verified Proof of Completion** — Resolution claims require coordinators to physically visit the complaint location and capture live evidence. The system calculates the Haversine distance between the proof location and the original complaint, rejecting submissions from outside 100 meters.

5. **Anti-Abuse Framework** — Rate limiting, duplicate detection, citizen trust scoring, coordinator performance monitoring, and append-only audit logging provide layered protection against spam, collusion, and data manipulation.

The system enforces a strict **11-state complaint lifecycle** through a validated state machine, preventing invalid status transitions and ensuring every complaint follows the defined workflow from submission to closure.

CityWatch is designed as a **college mini project** with potential pilot deployment in 3–4 controlled urban zones after institutional consultation. The initial scope covers 1 city, 4 zones, limited complaint categories, and in-app notifications. The architecture is designed to be modular, allowing future expansion to mobile PWA, advanced analytics, and formal municipal integration.

**Keywords:** Civic Complaint System, Distributed Validation, SLA Tracking, Geo-Verification, Role-Based Access Control, Anti-Abuse, State Machine, WebRTC, Geolocation API

---

## Objectives

1. Build a city-restricted complaint management platform with structured multi-role workflow.
2. Implement distributed coordinator validation to prevent single-point complaint manipulation.
3. Design an intensity-based prioritization model using geographic complaint clustering.
4. Implement SLA-based resolution tracking with automatic escalation.
5. Integrate geo-verified proof-of-completion using live camera capture and GPS distance validation.
6. Build a comprehensive anti-abuse framework with trust scoring, rate limiting, and audit logging.
7. Maintain fairness and legal safety — no public ranking, no government shaming, no unnecessary data collection.
