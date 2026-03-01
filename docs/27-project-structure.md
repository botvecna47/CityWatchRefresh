# CityWatch — Project Folder Structure Guide

> Every file has a home. Nothing lives at the root. Easy to navigate, debug, and present.

---

## 1. Top-Level Structure

```
CityWatchRevive_V_01/
│
├── backend/                    ← Spring Boot application
├── frontend/                   ← React application
├── docs/                       ← All documentation (gitignored)
├── Diary/                      ← Development diary (gitignored)
├── Report/                     ← Final project report (gitignored)
├── .gitignore                  ← Excludes docs/, Diary/, Report/
├── plan.md                     ← Original project plan
└── README.md                   ← Project overview for GitHub
```

---

## 2. Backend Folder Structure (Spring Boot)

```
backend/
│
├── pom.xml                               ← Maven dependencies
├── mvnw / mvnw.cmd                       ← Maven wrapper
│
└── src/
    ├── main/
    │   ├── java/com/citywatch/
    │   │   │
    │   │   ├── CityWatchApplication.java ← Main entry point (@SpringBootApplication)
    │   │   │
    │   │   ├── config/                   ← All configuration classes
    │   │   │   ├── SecurityConfig.java       ← Spring Security filter chain
    │   │   │   ├── JwtAuthFilter.java        ← JWT token validation filter
    │   │   │   ├── CorsConfig.java           ← CORS allowed origins
    │   │   │   └── SwaggerConfig.java        ← Swagger/SpringDoc settings
    │   │   │
    │   │   ├── controller/               ← REST API endpoints (thin layer)
    │   │   │   ├── AuthController.java       ← POST /auth/register, /auth/login
    │   │   │   ├── ComplaintController.java   ← CRUD /complaints
    │   │   │   ├── VoteController.java        ← POST /votes
    │   │   │   ├── ProofController.java       ← POST /proofs
    │   │   │   ├── CommentController.java     ← CRUD /comments
    │   │   │   ├── NotificationController.java← GET /notifications
    │   │   │   ├── AdminController.java       ← /admin/* endpoints
    │   │   │   └── MapController.java         ← /map/* endpoints
    │   │   │
    │   │   ├── service/                  ← Business logic (the brain)
    │   │   │   ├── AuthService.java          ← Register, login, validate
    │   │   │   ├── ComplaintService.java      ← Create, validate, filter
    │   │   │   ├── VoteService.java           ← Vote, majority check
    │   │   │   ├── AssignmentService.java     ← Auto-assign coordinator
    │   │   │   ├── ProofService.java          ← Submit, verify distance
    │   │   │   ├── SlaService.java            ← SLA check, escalation
    │   │   │   ├── NotificationService.java   ← Create, mark read
    │   │   │   ├── CommentService.java        ← Create, filter, moderate
    │   │   │   ├── AdminService.java          ← User mgmt, area mgmt
    │   │   │   ├── AuditService.java          ← Log all actions
    │   │   │   └── IntensityService.java      ← Calculate intensity score
    │   │   │
    │   │   ├── repository/               ← Database access (JPA interfaces)
    │   │   │   ├── UserRepository.java
    │   │   │   ├── ComplaintRepository.java
    │   │   │   ├── VoteRepository.java
    │   │   │   ├── ProofRepository.java
    │   │   │   ├── CommentRepository.java
    │   │   │   ├── NotificationRepository.java
    │   │   │   ├── AreaRepository.java
    │   │   │   ├── SlaConfigRepository.java
    │   │   │   ├── EscalationRepository.java
    │   │   │   └── AuditLogRepository.java
    │   │   │
    │   │   ├── entity/                   ← Database table mappings
    │   │   │   ├── User.java
    │   │   │   ├── Complaint.java
    │   │   │   ├── Vote.java
    │   │   │   ├── Proof.java
    │   │   │   ├── Comment.java
    │   │   │   ├── Notification.java
    │   │   │   ├── Area.java
    │   │   │   ├── SlaConfig.java
    │   │   │   ├── Escalation.java
    │   │   │   └── AuditLog.java
    │   │   │
    │   │   ├── dto/                      ← Request/Response objects
    │   │   │   ├── request/                  ← Incoming data
    │   │   │   │   ├── RegisterRequest.java
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── ComplaintRequest.java
    │   │   │   │   ├── VoteRequest.java
    │   │   │   │   ├── ProofRequest.java
    │   │   │   │   ├── CommentRequest.java
    │   │   │   │   └── ConfirmationRequest.java
    │   │   │   │
    │   │   │   └── response/                 ← Outgoing data
    │   │   │       ├── AuthResponse.java         ← JWT token + user info
    │   │   │       ├── ComplaintResponse.java
    │   │   │       ├── VoteResponse.java
    │   │   │       ├── ProofResponse.java
    │   │   │       ├── NotificationResponse.java
    │   │   │       ├── DashboardStatsResponse.java
    │   │   │       └── ErrorResponse.java        ← Standardized error format
    │   │   │
    │   │   ├── enums/                    ← All enum types
    │   │   │   ├── Role.java                 ← CITIZEN, COORDINATOR, ADMIN
    │   │   │   ├── ComplaintStatus.java       ← DRAFT, PENDING_REVIEW, ...
    │   │   │   ├── Category.java             ← POTHOLE, GARBAGE, ...
    │   │   │   ├── Priority.java             ← LOW, MEDIUM, HIGH, CRITICAL
    │   │   │   ├── TrustLevel.java           ← NORMAL, UNDER_REVIEW, RESTRICTED
    │   │   │   ├── UserStatus.java           ← ACTIVE, WARNING, SUSPENDED
    │   │   │   ├── VoteDecision.java         ← VALID, INVALID, NEEDS_CLARIFICATION
    │   │   │   ├── EscalationStatus.java     ← OPEN, ACKNOWLEDGED, RESOLVED
    │   │   │   └── NotificationType.java     ← STATUS_CHANGE, ASSIGNMENT, ...
    │   │   │
    │   │   ├── util/                     ← Utility / helper classes
    │   │   │   ├── JwtUtil.java              ← Generate, validate, extract JWT
    │   │   │   ├── HaversineUtil.java        ← GPS distance calculation
    │   │   │   ├── ImageUtil.java            ← Save, validate, compress images
    │   │   │   ├── ProfanityFilter.java      ← Comment content filter
    │   │   │   └── ValidationUtil.java       ← Common validation helpers
    │   │   │
    │   │   ├── scheduler/                ← Scheduled background tasks
    │   │   │   ├── SlaScheduler.java         ← Hourly SLA deadline check
    │   │   │   └── AutoCloseScheduler.java   ← Auto-close after 7 days
    │   │   │
    │   │   └── exception/                ← Custom exceptions + handler
    │   │       ├── GlobalExceptionHandler.java   ← @ControllerAdvice
    │   │       ├── ResourceNotFoundException.java
    │   │       ├── DuplicateResourceException.java
    │   │       ├── UnauthorizedException.java
    │   │       ├── RateLimitExceededException.java
    │   │       └── InvalidStatusTransitionException.java
    │   │
    │   └── resources/
    │       ├── application.properties        ← DB, JWT, server config
    │       ├── application-dev.properties    ← Dev-specific overrides
    │       └── static/                       ← (empty — frontend served separately)
    │
    └── test/                                 ← (Future: unit tests)
        └── java/com/citywatch/
            └── CityWatchApplicationTests.java
```

### Why This Structure?

| Folder | Rule |
|---|---|
| `controller/` | ONLY handles HTTP (request → delegate → response). No business logic here. |
| `service/` | ALL business logic lives here. This is the brain. |
| `repository/` | ONLY database queries. No logic. |
| `entity/` | ONLY database table mappings. No behavior. |
| `dto/request/` | What comes IN from the API |
| `dto/response/` | What goes OUT from the API |
| `enums/` | ALL enum types in one place (never embedded in entity files) |
| `util/` | Stateless helper methods (math, validation, parsing) |
| `scheduler/` | Background jobs that run on a timer |
| `exception/` | Custom exceptions + the global error handler |
| `config/` | All Spring configuration (security, CORS, Swagger) |

---

## 3. Frontend Folder Structure (React + Vite)

```
frontend/
│
├── package.json                          ← Dependencies
├── vite.config.js                        ← Vite configuration
├── index.html                            ← Root HTML (Vite entry)
├── .env                                  ← Environment variables (gitignored)
├── .env.example                          ← Template for env vars
│
├── public/                               ← Static assets (served as-is)
│   ├── favicon.ico
│   └── logo.png
│
└── src/
    │
    ├── main.jsx                          ← React entry point
    ├── App.jsx                           ← Root component + Router
    ├── index.css                         ← Global styles + CSS variables
    │
    ├── assets/                           ← Images, icons, fonts
    │   ├── images/
    │   │   ├── hero-bg.jpg
    │   │   └── empty-state.svg
    │   └── icons/
    │       └── category-icons.js             ← SVG icon components
    │
    ├── components/                       ← Shared/reusable components
    │   ├── layout/                           ← Page structure components
    │   │   ├── Navbar.jsx
    │   │   ├── Navbar.css
    │   │   ├── Sidebar.jsx
    │   │   ├── Sidebar.css
    │   │   ├── Footer.jsx
    │   │   ├── Footer.css
    │   │   ├── PageLayout.jsx                ← Wraps navbar + content + footer
    │   │   └── PageLayout.css
    │   │
    │   ├── common/                           ← General-purpose UI components
    │   │   ├── Button.jsx
    │   │   ├── Button.css
    │   │   ├── Input.jsx
    │   │   ├── Input.css
    │   │   ├── Modal.jsx
    │   │   ├── Modal.css
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorMessage.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── StatusBadge.jsx               ← Color-coded complaint status
    │   │   ├── StatusBadge.css
    │   │   └── ConfirmDialog.jsx
    │   │
    │   ├── complaint/                        ← Complaint-specific components
    │   │   ├── ComplaintCard.jsx              ← Complaint summary card
    │   │   ├── ComplaintCard.css
    │   │   ├── ComplaintList.jsx              ← List of complaint cards
    │   │   ├── StatusTimeline.jsx             ← Visual status progression
    │   │   ├── StatusTimeline.css
    │   │   └── CategoryBadge.jsx
    │   │
    │   ├── media/                            ← Camera and GPS components
    │   │   ├── CameraCapture.jsx             ← WebRTC camera component
    │   │   ├── CameraCapture.css
    │   │   ├── GpsDisplay.jsx                ← Shows captured coordinates
    │   │   └── GpsDisplay.css
    │   │
    │   ├── map/                              ← Google Maps components
    │   │   ├── MapView.jsx                   ← Main map component
    │   │   ├── MapView.css
    │   │   ├── ComplaintMarker.jsx            ← Single marker
    │   │   └── MarkerPopup.jsx               ← Info window on click
    │   │
    │   ├── vote/                             ← Voting components
    │   │   ├── VotePanel.jsx                 ← Vote buttons + comment
    │   │   ├── VotePanel.css
    │   │   └── VoteResult.jsx                ← Show vote outcome
    │   │
    │   ├── notification/                     ← Notification components
    │   │   ├── NotificationPanel.jsx         ← Dropdown notification list
    │   │   ├── NotificationPanel.css
    │   │   ├── NotificationBadge.jsx         ← Unread count badge
    │   │   └── NotificationItem.jsx          ← Single notification row
    │   │
    │   └── comment/                          ← Comment components
    │       ├── CommentSection.jsx            ← Full comment area
    │       ├── CommentSection.css
    │       ├── CommentItem.jsx               ← Single comment
    │       └── CommentForm.jsx               ← New comment input
    │
    ├── pages/                            ← Full page components (one per route)
    │   ├── public/                           ← No auth required
    │   │   ├── LandingPage.jsx
    │   │   ├── LandingPage.css
    │   │   ├── LoginPage.jsx
    │   │   ├── LoginPage.css
    │   │   ├── RegisterPage.jsx
    │   │   ├── RegisterPage.css
    │   │   ├── DisclaimerPage.jsx
    │   │   ├── PrivacyPolicyPage.jsx
    │   │   └── TermsOfUsePage.jsx
    │   │
    │   ├── citizen/                          ← Citizen-only pages
    │   │   ├── CitizenDashboard.jsx
    │   │   ├── CitizenDashboard.css
    │   │   ├── MyComplaints.jsx
    │   │   ├── MyComplaints.css
    │   │   ├── SubmitComplaint.jsx            ← 5-step wizard
    │   │   ├── SubmitComplaint.css
    │   │   └── ConfirmResolution.jsx         ← Accept/reject proof
    │   │
    │   ├── coordinator/                      ← Coordinator-only pages
    │   │   ├── CoordinatorDashboard.jsx
    │   │   ├── CoordinatorDashboard.css
    │   │   ├── PendingReviews.jsx            ← Complaints to vote on
    │   │   ├── PendingReviews.css
    │   │   ├── AssignedComplaints.jsx        ← Complaints to resolve
    │   │   ├── AssignedComplaints.css
    │   │   ├── SubmitProof.jsx               ← Proof submission
    │   │   └── SubmitProof.css
    │   │
    │   ├── admin/                            ← Admin-only pages
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminDashboard.css
    │   │   ├── UserManagement.jsx
    │   │   ├── UserManagement.css
    │   │   ├── AreaManagement.jsx
    │   │   ├── AreaManagement.css
    │   │   ├── Escalations.jsx
    │   │   ├── Escalations.css
    │   │   ├── AuditLogs.jsx
    │   │   └── AuditLogs.css
    │   │
    │   └── shared/                           ← Pages accessible by any role
    │       ├── ComplaintDetail.jsx            ← Full complaint view
    │       ├── ComplaintDetail.css
    │       ├── MapPage.jsx                   ← Full-screen map view
    │       ├── MapPage.css
    │       ├── NotificationsPage.jsx         ← All notifications
    │       ├── ProfilePage.jsx               ← User profile
    │       └── NotFoundPage.jsx              ← 404 page
    │
    ├── hooks/                            ← Custom React hooks
    │   ├── useAuth.js                        ← Auth state, login, logout, role
    │   ├── useGeolocation.js                 ← GPS capture with error handling
    │   ├── useCamera.js                      ← WebRTC camera stream
    │   ├── useNotifications.js               ← Fetch + mark read
    │   ├── useComplaints.js                  ← CRUD operations
    │   └── usePagination.js                  ← Pagination state hook
    │
    ├── services/                         ← API communication layer
    │   ├── api.js                            ← Axios instance + interceptors
    │   ├── authService.js                    ← register(), login(), getProfile()
    │   ├── complaintService.js               ← create(), getAll(), getById()
    │   ├── voteService.js                    ← castVote(), getVotes()
    │   ├── proofService.js                   ← submitProof()
    │   ├── commentService.js                 ← create(), getByComplaint()
    │   ├── notificationService.js            ← getAll(), markRead()
    │   ├── adminService.js                   ← user mgmt, area mgmt
    │   └── mapService.js                     ← getMarkers(), getHeatmap()
    │
    ├── utils/                            ← Helper functions (pure, no React)
    │   ├── formatDate.js                     ← Date formatting
    │   ├── formatDistance.js                  ← "45m away" formatting
    │   ├── statusColors.js                   ← Status → color mapping
    │   ├── categoryIcons.js                  ← Category → icon mapping
    │   ├── validators.js                     ← Email, password, description validators
    │   └── constants.js                      ← API URLs, limits, categories
    │
    ├── context/                          ← React context providers
    │   ├── AuthContext.jsx                   ← Auth state provider
    │   └── NotificationContext.jsx           ← Notification state provider
    │
    └── routes/                           ← Route definitions
        ├── AppRoutes.jsx                     ← All route definitions
        ├── ProtectedRoute.jsx                ← Requires auth
        ├── PublicRoute.jsx                   ← Redirects if logged in
        └── RoleRoute.jsx                     ← Requires specific role
```

### Why This Structure?

| Folder | Rule |
|---|---|
| `pages/` | One folder per role. Each page = one route. No logic here — just composing components. |
| `components/` | Grouped by feature domain. Reusable across pages. |
| `components/common/` | Generic UI elements used everywhere (Button, Modal, Spinner). |
| `components/[feature]/` | Feature-specific components (complaint/, vote/, map/). |
| `hooks/` | Custom hooks — encapsulate stateful logic (auth, GPS, camera). |
| `services/` | API calls only. One file per backend controller. No React code here. |
| `utils/` | Pure JavaScript helpers. No React, no state. |
| `context/` | Global state providers (auth, notifications). |
| `routes/` | Route config and guard components. |
| `assets/` | Static files: images, icons, fonts. |

### Naming Rules
- **Components:** PascalCase → `ComplaintCard.jsx`
- **Hooks:** camelCase with `use` prefix → `useAuth.js`
- **Services:** camelCase with `Service` suffix → `complaintService.js`
- **Utils:** camelCase → `formatDate.js`
- **CSS:** Same name as component → `ComplaintCard.css` next to `ComplaintCard.jsx`

---

## 4. Quick Reference — "Where Does This Go?"

| I need to... | Put it in... |
|---|---|
| Add a new API endpoint | `backend/controller/` + `backend/service/` |
| Add a new database table | `backend/entity/` + `backend/repository/` |
| Add a new enum (status, role, category) | `backend/enums/` |
| Add a reusable UI component | `frontend/src/components/[feature]/` |
| Add a new page/route | `frontend/src/pages/[role]/` |
| Add an API call function | `frontend/src/services/` |
| Add a custom React hook | `frontend/src/hooks/` |
| Add a utility function | `frontend/src/utils/` or `backend/util/` |
| Add a background task | `backend/scheduler/` |
| Add a custom exception | `backend/exception/` |
| Add Spring configuration | `backend/config/` |
| Add a static image | `frontend/src/assets/images/` |
