# CityWatch — Glossary of Professional Terms

> Every term a professional developer, product manager, or examiner might use — defined clearly with CityWatch context.

---

## A

**API (Application Programming Interface)** — A set of defined endpoints that allow the frontend to communicate with the backend. CityWatch uses a REST API with JSON payloads.

**API Contract** — A formal agreement between frontend and backend on what endpoints exist, what data is expected, and what responses are returned. Documented in `docs/02-backend-api.md`.

**Audit Log** — An append-only record of every significant action in the system (who did what, when, from where). Cannot be edited or deleted. Used for accountability and debugging.

**Authentication (AuthN)** — Verifying *who* the user is. CityWatch uses email/password login with JWT tokens.

**Authorization (AuthZ)** — Verifying *what* the user is allowed to do. CityWatch uses RBAC (Role-Based Access Control).

---

## B

**BCrypt** — A password hashing algorithm that includes a salt and a configurable work factor. Used by CityWatch to store passwords securely (never plain text).

**Bounding Box** — A rectangular geographic area defined by min/max latitude and longitude. Used to define area/zone boundaries.

---

## C

**CI/CD (Continuous Integration / Continuous Deployment)** — Automated pipelines that test code on every commit (CI) and deploy it automatically (CD). Out of scope for the mini project.

**CORS (Cross-Origin Resource Sharing)** — A browser security mechanism. The backend must explicitly allow the frontend's origin (`localhost:5173`) to make API calls.

**CRUD** — Create, Read, Update, Delete — the four basic operations on any data entity.

**CSRF (Cross-Site Request Forgery)** — An attack where a malicious site tricks a user's browser into making unintended requests. Not applicable when using JWT in headers (only relevant with cookies).

**CSP (Content Security Policy)** — HTTP headers that tell the browser which resources are allowed to load. Prevents XSS attacks.

---

## D

**DTO (Data Transfer Object)** — A Java object used to transfer data between layers (e.g., `ComplaintRequest`, `AuthResponse`). Separates internal models from API contracts.

**Duplicate Detection** — System checks if a similar complaint already exists within 100m radius (same category, last 7 days) before accepting a new one.

---

## E

**Edge Case** — A rare but possible scenario that could break the system if not handled. Example: all coordinators in an area are suspended, GPS returns inaccurate results, network fails mid-submission.

**ER Diagram (Entity-Relationship)** — A visual blueprint of database tables and their relationships. Shows which tables connect and how.

**Escalation** — Automatic priority increase when something goes wrong (SLA exceeded, citizen rejects resolution). Three levels, each with increasing admin attention.

---

## F

**Feature Creep** — Continuously adding new features without control, causing delays and complexity. Avoided by freezing features after Week 5 and referring to the PRD.

---

## G

**GPS (Global Positioning System)** — Satellite-based location technology. CityWatch uses the browser's Geolocation API to capture coordinates.

**Geo-Verification** — Validating that a coordinator is physically present at the complaint location when submitting proof. Verifies GPS distance ≤ 100m using the Haversine formula.

---

## H

**Haversine Formula** — Mathematical formula to calculate the great-circle distance between two GPS points on Earth's surface. Used for distance verification and duplicate detection.

**Heatmap** — A map visualization where areas with more complaints appear in warmer colors. Built with Google Maps visualization library.

---

## I

**Information Architecture (IA)** — How information is organized and structured within the application. Defines the hierarchy of navigation: Dashboard → Complaints → Zones → etc.

**Intensity Score** — A calculated metric that represents the severity of an issue based on complaint clustering. Formula: `log(1 + weighted_similar_complaints)`.

---

## J

**JPA (Java Persistence API)** — Standard Java specification for ORM. Spring Data JPA provides repositories for database operations.

**JWT (JSON Web Token)** — A compact, self-contained token for authentication. Contains user ID, role, and expiry. Sent in the `Authorization` header on every API request.

---

## M

**Mockup** — A high-detail static visual design of a screen. Includes colors, fonts, branding. More detailed than a wireframe but not interactive.

**MVP (Minimum Viable Product)** — The smallest version of the product that delivers core value. CityWatch MVP includes: auth, complaints, voting, SLA, proof, confirmation.

---

## N

**NFR (Non-Functional Requirement)** — System qualities like performance, security, usability, scalability. Example: "API response time < 500ms."

---

## O

**Optimistic Locking** — A concurrency control strategy where conflicts are detected at save time using a version field (`@Version`). Prevents two users from modifying the same record simultaneously.

**ORM (Object-Relational Mapping)** — Mapping between Java objects and database tables. Hibernate is the ORM used in Spring Data JPA.

---

## P

**PRD (Product Requirements Document)** — Defines what the product should do, for whom, and what's out of scope. The business-level requirements document.

**Prototype** — An interactive, clickable version of the UI. Simulates navigation and flows. Can be built in Figma or as a basic React demo.

**PostGIS** — A PostgreSQL extension that adds geographic/spatial data types and functions. Optional for CityWatch (used for efficient geo queries at scale).

---

## R

**RBAC (Role-Based Access Control)** — Restricting system access based on user roles. CityWatch has three roles: CITIZEN (low), COORDINATOR (medium), ADMIN (high).

**Refactoring** — Improving code structure without changing external behavior. Done throughout development to keep code clean and maintainable.

**REST (Representational State Transfer)** — An architectural style for APIs. Uses HTTP methods (GET, POST, PUT, DELETE) with resource-based URLs.

**Rate Limiting** — Restricting how many requests a user/IP can make in a time window. Prevents spam and abuse.

---

## S

**SLA (Service Level Agreement)** — A committed time limit for resolving a complaint. CityWatch SLAs: Garbage=72h, Pothole=168h, Streetlight=96h, Drainage=96h.

**SPA (Single Page Application)** — A web app that loads once and dynamically updates content without full page reloads. CityWatch uses React as a SPA.

**SRS (Software Requirements Specification)** — A technical document specifying all functional and non-functional requirements. Based on IEEE 830 standard.

**State Machine** — A model that defines all valid states and allowed transitions between them. CityWatch complaint status machine prevents invalid transitions (e.g., DRAFT cannot jump to CLOSED).

---

## T

**Technical Debt** — Shortcuts taken during development that create future maintenance burden. CityWatch accepted tech debt includes: no refresh tokens, localStorage for JWT, no automated tests.

**Trust Level** — An internal metric for citizen reliability. Levels: NORMAL → UNDER_REVIEW → RESTRICTED. Affects complaint weight and submission ability.

---

## U

**Use Case** — A structured description of how an actor achieves a goal through the system. Includes preconditions, main flow, alternate flows, and postconditions.

**User Flow** — A visual step-by-step path a user takes through the application. Shows decision points and alternate paths.

---

## V

**Validation** — Checking that user input meets defined rules. Applied on both frontend (for UX) and backend (for security). Example: description ≥ 50 characters.

---

## W

**WebRTC (Web Real-Time Communication)** — Browser API for camera and microphone access. CityWatch uses `navigator.mediaDevices.getUserMedia()` for live photo capture.

**Wireframe** — A low-detail visual blueprint of a screen showing layout structure without colors or styling. Shows what elements exist and where they go.

---

## X

**XSS (Cross-Site Scripting)** — An attack where malicious scripts are injected into web pages. Prevented by React's auto-escaping, CSP headers, and input sanitization.
