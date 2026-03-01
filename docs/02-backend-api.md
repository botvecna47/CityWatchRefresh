# CityWatch — Backend API Documentation

## Base Configuration

| Setting | Value |
|---|---|
| Base URL | `http://localhost:8080/api` |
| Auth | JWT Bearer Token in `Authorization` header |
| Content-Type | `application/json` (except image uploads: `multipart/form-data`) |
| CORS | Allow `http://localhost:5173` (dev) |

---

## Authentication Endpoints

### `POST /api/auth/register`

Register a new citizen account.

| Field | Type | Required | Validation |
|---|---|---|---|
| `username` | string | ✅ | 3–50 chars, unique |
| `email` | string | ✅ | Valid email, unique |
| `password` | string | ✅ | Min 8 chars, 1 uppercase, 1 number |
| `phone` | string | ❌ | Valid phone format |
| `city` | string | ✅ | Must match allowed cities |

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "darshdeep",
  "email": "darsh@example.com",
  "role": "CITIZEN",
  "token": "eyJhbGci..."
}
```

**Errors:** `400` (validation), `409` (email/username exists)

---

### `POST /api/auth/login`

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "darshdeep",
  "role": "CITIZEN",
  "trustLevel": "NORMAL",
  "token": "eyJhbGci...",
  "expiresIn": 86400
}
```

**Errors:** `401` (invalid credentials), `403` (suspended account)

---

### `GET /api/auth/me`

Get current user profile. **Requires: Any authenticated user**

**Response:** `200 OK` — Full user profile

---

## Complaint Endpoints

### `POST /api/complaints`

Submit a new complaint. **Requires: CITIZEN role**

| Field | Type | Required | Validation |
|---|---|---|---|
| `category` | string | ✅ | One of: `POTHOLE`, `GARBAGE`, `STREETLIGHT`, `DRAINAGE`, `OTHER` |
| `description` | string | ✅ | Min 50 characters |
| `image` | file | ✅ | JPEG/PNG, max 5MB, must be live-captured |
| `latitude` | double | ✅ | Valid range |
| `longitude` | double | ✅ | Valid range |

**Backend processing:**
1. Validate citizen trust level (reject if `RESTRICTED`)
2. Check rate limit (max 5 complaints/day per citizen)
3. Check duplicate within 100m radius (same category, last 7 days)
4. Auto-detect area from GPS coordinates
5. Save image to storage
6. Set status → `PENDING_REVIEW`
7. Notify coordinators in the area
8. Create audit log entry

**Response:** `201 Created`
```json
{
  "id": 42,
  "status": "PENDING_REVIEW",
  "area": { "id": 1, "name": "Zone A" },
  "createdAt": "2026-02-23T08:30:00Z"
}
```

**Errors:**
- `400` — Validation failure
- `403` — Restricted citizen
- `429` — Rate limit exceeded
- `409` — Duplicate complaint detected

---

### `GET /api/complaints`

List complaints with filters. **Requires: Any authenticated user**

| Query Param | Type | Description |
|---|---|---|
| `areaId` | long | Filter by area |
| `status` | string | Filter by status |
| `category` | string | Filter by category |
| `priority` | string | Filter by priority |
| `page` | int | Pagination (default 0) |
| `size` | int | Page size (default 20, max 50) |
| `sort` | string | Sort field (default `createdAt,desc`) |

**Role-based filtering:**
- **Citizen**: Sees all complaints in their city (public view) + their own
- **Coordinator**: Sees complaints in assigned area
- **Admin**: Sees all complaints

---

### `GET /api/complaints/{id}`

Get single complaint details. **Requires: Any authenticated user**

**Response:** Full complaint with votes count, comments, proof status

---

### `GET /api/complaints/my`

Get current citizen's complaints. **Requires: CITIZEN role**

---

### `PUT /api/complaints/{id}`

Edit complaint (only if status is `DRAFT`). **Requires: CITIZEN (owner only)**

---

### `DELETE /api/complaints/{id}`

Delete complaint (only if status is `DRAFT`). **Requires: CITIZEN (owner only)**

---

## Voting Endpoints

### `POST /api/complaints/{id}/votes`

Cast a vote on a complaint. **Requires: COORDINATOR role, assigned to same area**

| Field | Type | Required | Validation |
|---|---|---|---|
| `decision` | string | ✅ | One of: `VALID`, `INVALID`, `NEEDS_CLARIFICATION` |
| `comment` | string | ❌ | Optional reason |

**Backend processing:**
1. Verify complaint status is `PENDING_REVIEW`
2. Verify coordinator is in same area
3. Verify coordinator hasn't already voted
4. Save vote (hidden from other coordinators until all voted)
5. Check if majority reached:
   - Count total eligible coordinators for this area
   - If ≥60% voted VALID → Status → `APPROVED`, trigger intensity calculation
   - If ≥60% voted INVALID → Status → `REJECTED`, increment citizen strike
   - If tie after all votes → Status stays, admin notified
6. Create audit log

**Response:** `201 Created`

---

### `GET /api/complaints/{id}/votes`

Get votes summary (not individual votes until voting is complete). **Requires: COORDINATOR or ADMIN**

**Response (during voting):**
```json
{
  "totalEligible": 5,
  "votesReceived": 3,
  "myVote": "VALID",
  "votingComplete": false
}
```

**Response (after voting):**
```json
{
  "totalEligible": 5,
  "validVotes": 3,
  "invalidVotes": 1,
  "needsClarification": 1,
  "result": "APPROVED",
  "votes": [ ... ]
}
```

---

## Assignment & Progress Endpoints

### `POST /api/complaints/{id}/assign`

Randomly assign a coordinator. **Requires: System auto or ADMIN manual**

**Backend processing:**
1. Verify complaint is `APPROVED`
2. Get all `ACTIVE` coordinators in the area
3. Exclude coordinators who voted on this complaint (optional rule)
4. Random selection
5. Set `assigned_coordinator_id`
6. Status → `ASSIGNED`
7. Calculate SLA deadline from `sla_config`
8. Notify assigned coordinator

---

### `PUT /api/complaints/{id}/progress`

Update complaint progress. **Requires: COORDINATOR (assigned only)**

| Field | Type | Required |
|---|---|---|
| `status` | string | ✅ | One of: `IN_PROGRESS` |
| `note` | string | ❌ | Progress update text |

Backend validates transition is legal (ASSIGNED → IN_PROGRESS).

---

## Proof Endpoints

### `POST /api/complaints/{id}/proof`

Submit completion proof. **Requires: COORDINATOR (assigned only)**

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Validation |
|---|---|---|---|
| `image` | file | ✅ | Live-captured, JPEG/PNG, max 5MB |
| `latitude` | double | ✅ | Must be within 100m of complaint |
| `longitude` | double | ✅ | Must be within 100m of complaint |

**Backend processing:**
1. Verify complaint status is `IN_PROGRESS`
2. Calculate distance from complaint coordinates using Haversine formula:
   ```
   d = 2R × arcsin(√(sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)))
   ```
   Where R = 6371000 meters
3. If distance > 100m → Reject with error
4. Save proof
5. Status → `COMPLETED`
6. Notify citizen for confirmation

**Response:** `201 Created`

---

### `GET /api/complaints/{id}/proof`

View proof for a complaint. **Requires: Any authenticated user**

---

## Citizen Confirmation Endpoints

### `POST /api/complaints/{id}/confirm`

Citizen accepts or rejects resolution. **Requires: CITIZEN (complaint owner only)**

| Field | Type | Required |
|---|---|---|
| `accepted` | boolean | ✅ |
| `reason` | string | Required if `accepted=false` |

**If accepted:**
1. Status → `CLOSED`
2. Set `closed_at`
3. Notify coordinator

**If rejected:**
1. Status → `REOPENED`
2. `reopen_count++`
3. `escalation_level++`
4. Create escalation record
5. Reassign to different coordinator (exclude previous)
6. Notify admin

---

## Comment Endpoints

### `POST /api/complaints/{id}/comments`

Add a comment. **Requires: Any authenticated user**

| Field | Type | Required |
|---|---|---|
| `content` | string | ✅ | Min 5 chars, profanity filtered |
| `parentId` | long | ❌ | For threaded replies |

---

### `GET /api/complaints/{id}/comments`

List comments (threaded). **Requires: Any authenticated user**

---

### `DELETE /api/complaints/{id}/comments/{commentId}`

Moderate (soft-delete) a comment. **Requires: ADMIN only**

---

## Notification Endpoints

### `GET /api/notifications`

Get current user's notifications. **Requires: Any authenticated user**

| Query Param | Type | Description |
|---|---|---|
| `unreadOnly` | boolean | Default false |
| `page` | int | Pagination |
| `size` | int | Page size |

---

### `PUT /api/notifications/{id}/read`

Mark a notification as read. **Requires: Owner only**

---

### `PUT /api/notifications/read-all`

Mark all notifications as read. **Requires: Any authenticated user**

---

## Admin Endpoints

### `POST /api/admin/coordinators`

Create a new coordinator account. **Requires: ADMIN**

| Field | Type | Required |
|---|---|---|
| `username` | string | ✅ |
| `email` | string | ✅ |
| `password` | string | ✅ |
| `phone` | string | ❌ |
| `areaId` | long | ✅ |
| `city` | string | ✅ |

---

### `PUT /api/admin/users/{id}/status`

Change user status (ACTIVE/WARNING/SUSPENDED). **Requires: ADMIN**

---

### `PUT /api/admin/users/{id}/trust`

Change citizen trust level. **Requires: ADMIN**

---

### `GET /api/admin/areas`

List all areas. **Requires: ADMIN**

---

### `POST /api/admin/areas`

Create a new area/zone. **Requires: ADMIN**

---

### `PUT /api/admin/areas/{id}`

Update area details. **Requires: ADMIN**

---

### `GET /api/admin/escalations`

List all escalations. **Requires: ADMIN**

| Query Param | Type | Description |
|---|---|---|
| `resolved` | boolean | Filter by resolution status |
| `level` | int | Filter by escalation level |

---

### `PUT /api/admin/escalations/{id}/resolve`

Resolve an escalation. **Requires: ADMIN**

---

### `GET /api/admin/audit-logs`

View audit logs. **Requires: ADMIN**

| Query Param | Type | Description |
|---|---|---|
| `userId` | long | Filter by actor |
| `action` | string | Filter by action type |
| `entityType` | string | Filter by entity type |
| `from` | datetime | Start date |
| `to` | datetime | End date |
| `page` | int | Pagination |

---

### `GET /api/admin/stats`

Dashboard statistics. **Requires: ADMIN**

**Response:**
```json
{
  "totalComplaints": 142,
  "pendingReview": 12,
  "inProgress": 28,
  "delayed": 5,
  "closedThisMonth": 35,
  "avgResolutionHours": 68.5,
  "escalationRate": 0.08,
  "complaintsByCategory": { ... },
  "complaintsByArea": { ... }
}
```

---

### `PUT /api/admin/sla-config/{category}`

Update SLA hours for a category. **Requires: ADMIN**

---

## Map / Heatmap Endpoints

### `GET /api/complaints/map`

Get complaints for map display. **Requires: Any authenticated user**

| Query Param | Type | Description |
|---|---|---|
| `areaId` | long | Filter by area |
| `lat` | double | Center latitude |
| `lng` | double | Center longitude |
| `radius` | double | Radius in meters |
| `status` | string | Filter by status |

**Response:** Array of `{ id, latitude, longitude, category, status, priority, intensity_score }`

---

## Error Response Format

All errors follow this format:

```json
{
  "timestamp": "2026-02-23T08:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Description must be at least 50 characters",
  "path": "/api/complaints"
}
```

---

## HTTP Status Codes Used

| Code | Usage |
|---|---|
| `200` | Successful GET/PUT |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE |
| `400` | Validation error |
| `401` | Not authenticated |
| `403` | Not authorized (wrong role / not owner) |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `429` | Rate limit exceeded |
| `500` | Server error |
