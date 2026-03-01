# CityWatch — Frontend Components & Pages

## 1. Routing Structure

```
/                           → Landing / Home (public)
/login                      → Login page
/register                   → Citizen registration

/citizen                    → Citizen Dashboard (protected: CITIZEN)
/citizen/submit             → Submit Complaint
/citizen/complaints         → My Complaints
/citizen/complaints/:id     → Complaint Detail + Confirmation
/citizen/map                → Area Complaint Map
/citizen/notifications      → Notification Center

/coordinator                → Coordinator Dashboard (protected: COORDINATOR)
/coordinator/reviews        → Pending Reviews (vote)
/coordinator/assigned       → Assigned Complaints
/coordinator/complaints/:id → Complaint Detail + Proof Upload
/coordinator/notifications  → Notification Center

/admin                      → Admin Dashboard (protected: ADMIN)
/admin/users                → User Management
/admin/areas                → Area Management
/admin/escalations          → Escalation Panel
/admin/audit-logs           → Audit Log Viewer
/admin/sla-config           → SLA Configuration
/admin/stats                → Statistics & Reports
```

---

## 2. Auth & Route Protection

### `AuthContext` (React Context)

```
State:
  user: { id, username, email, role, trustLevel, status }
  token: string | null
  isLoading: boolean

Methods:
  login(email, password) → sets token + user
  register(data) → sets token + user
  logout() → clears token + user
  refreshUser() → re-fetches /api/auth/me
```

### `ProtectedRoute` Component

```jsx
<ProtectedRoute roles={['CITIZEN']}>
  <CitizenDashboard />
</ProtectedRoute>
```

**Edge cases handled:**
- Token expired mid-session → auto-redirect to `/login` with return URL
- User suspended between requests → show "Account Suspended" page, not dashboard
- Role mismatch (citizen tries `/admin`) → redirect to their own dashboard
- Token present but invalid (tampered) → clear token, redirect to login
- Browser back-button after logout → must not show cached protected pages

> [!CAUTION]
> **Loophole: Stale auth state.** If admin suspends a user while they're logged in, the frontend will keep showing the dashboard until the next API call fails. **Fix:** Periodically re-validate the token (every 5 min) by calling `/api/auth/me`. If status is `SUSPENDED`, force logout.

---

## 3. Shared Components

### `Navbar`
- Logo, role-specific navigation links
- Notification bell with unread count badge
- User dropdown (profile, logout)
- **Edge case:** Show different nav items per role; hide admin links entirely from DOM (not just CSS) for non-admins

### `StatusBadge`
- Color-coded badge for complaint status
- Colors: Draft=gray, Pending=yellow, Approved=blue, Rejected=red, In Progress=orange, Completed=green, Closed=dark green, Delayed=red-pulse, Escalated=red-bold, Reopened=purple

### `PriorityBadge`
- LOW=green, MEDIUM=yellow, HIGH=orange, CRITICAL=red

### `ComplaintCard`
- Thumbnail image, category icon, status badge, priority badge
- Title (truncated description), area name, time ago
- Click → navigate to detail

### `MapView` (Google Maps wrapper)
- Markers clustered by proximity
- Color-coded by category or priority
- Info popup on click: category, status, time
- **Edge case:** Map fails to load (API key invalid, no internet) → show graceful fallback message, not blank white space
- **Edge case:** Hundreds of markers → use marker clustering library to prevent lag

### `CameraCapture` (WebRTC)
- Request camera permission
- Live preview
- Capture button → saves as base64 or Blob
- **NO file upload picker** — only live capture
- **Edge cases:**
  - Camera permission denied → clear error message with instructions
  - Device has no camera → show error, suggest using a device with camera
  - Camera in use by another app → handle `NotReadableError`
  - User on HTTP (not HTTPS) → WebRTC blocked → show "HTTPS required" message
  - Browser doesn't support `getUserMedia` → show "unsupported browser" message

### `GPSCapture` (Geolocation API)
- Auto-request location on mount
- Show coordinates + accuracy indicator
- **Edge cases:**
  - Permission denied → error message
  - Timeout → retry with larger timeout, then show manual address input as fallback
  - Low accuracy (> 500m) → show warning "Location inaccurate, move outdoors"
  - GPS spoofing → cannot fully prevent on client side, validate reasonableness on backend (is this GPS within the city boundaries?)

### `CommentThread`
- Threaded display (parent → children)
- Reply button per comment
- Admin-only delete/moderate button
- **Edge case:** Deeply nested threads → limit nesting to 3 levels, then flatten
- **Edge case:** Rapid comment spam → client-side debounce + backend rate limit

### `NotificationList`
- Real-time unread count
- Click → navigate to referenced complaint
- Mark as read on click
- Mark all as read button
- **Edge case:** Notification for a deleted/not-found complaint → handle 404 gracefully

### `Pagination`
- Page numbers + next/prev
- Synced with URL query params
- **Edge case:** Page number exceeds total → redirect to last page

### `EmptyState`
- Friendly illustration + message when no data
- Per-context messages ("No complaints yet", "No pending reviews")

### `ErrorBoundary`
- Catch rendering crashes
- Show fallback UI instead of blank screen
- Log error for debugging

---

## 4. Page-by-Page Detail

### 4.1 Landing Page (`/`)

- Hero section: "Report. Track. Resolve."
- How it works (3-step visual)
- Stats (total resolved, avg time)
- CTA: Register / Login
- No sensitive data exposed

### 4.2 Login (`/login`)

- Email + password form
- Show/hide password toggle
- "Forgot password" link (stretch goal)
- Error: "Invalid credentials" (never reveal which field is wrong)
- **Security:** No autocomplete for password on shared computers (configurable)
- **Edge case:** Account locked after 5 failed attempts → show lockout message

### 4.3 Register (`/register`)

- Username, email, password, confirm password, phone (optional), city dropdown
- Client-side validation before submit
- Password strength meter
- City restricted to allowed list
- **Edge case:** Registration while already logged in → redirect to dashboard
- **Edge case:** Slow network → disable submit button after click, show spinner

### 4.4 Citizen Dashboard (`/citizen`)

- Summary cards: Total complaints, Pending, In Progress, Resolved
- Recent complaints list
- Quick action: "Report an Issue" button
- **Edge case:** New citizen with zero complaints → show onboarding guide

### 4.5 Submit Complaint (`/citizen/submit`)

**This is the most complex citizen page.**

Step-by-step wizard flow:

1. **Select Category** — radio buttons with icons
2. **Describe Issue** — textarea with character counter (min 50)
3. **Capture Photo** — live camera capture (WebRTC), review before confirm
4. **Confirm Location** — auto-GPS with map pin, allow slight adjustment
5. **Review & Submit** — summary of all inputs

**Edge cases & loopholes addressed:**
- User submits without photo → button disabled until photo captured
- User uploads file instead of capturing → no file input element exists, only camera
- GPS shows wrong location → allow map drag to adjust (within 200m of auto-detected)
- User tries to submit from outside the city → backend rejects (GPS outside all area boundaries)
- User submits same complaint twice (back button) → frontend shows "already submitted" + backend duplicate detection
- User is RESTRICTED trust level → show "Your account is under review" instead of form
- Network failure mid-submit → show retry button, don't lose form data
- Image too large → compress client-side before upload (canvas resize)
- Description is gibberish/spam → backend validation (stretch: basic pattern detection)

### 4.6 Complaint Detail (`/citizen/complaints/:id`)

- Full description, image, map pin
- Status timeline (visual stepper)
- Comment thread
- If status=COMPLETED → show proof image + Accept/Reject buttons
- If status=CLOSED → show final summary
- **Edge case:** Citizen views someone else's complaint → read-only view (no confirm/reject buttons)
- **Edge case:** Complaint was deleted/not found → 404 page

### 4.7 Coordinator — Pending Reviews (`/coordinator/reviews`)

- List of complaints in coordinator's area with status=PENDING_REVIEW
- Each card shows: category, description preview, image, map
- Vote button: Valid / Invalid / Needs Clarification
- **CRITICAL: Cannot see other coordinators' votes** — votes hidden until voting complete
- **Edge case:** Coordinator already voted → show "You've already voted" with their vote
- **Edge case:** Voting deadline passed (all coordinators voted or timeout) → remove from pending list

### 4.8 Coordinator — Assigned Complaints (`/coordinator/assigned`)

- List of complaints assigned to this coordinator
- Status badges, SLA countdown timer
- Click → detail page with progress update + proof upload
- **Edge case:** SLA timer shows negative (deadline passed) → show "OVERDUE" in red
- **Edge case:** Complaint reassigned to different coordinator → remove from list

### 4.9 Coordinator — Proof Upload (`/coordinator/complaints/:id`)

- Complaint detail + original image
- Camera capture for proof
- GPS auto-capture for proof
- Submit proof button
- **Edge cases:**
  - Coordinator tries to submit proof from office (too far from complaint) → show distance error
  - Coordinator submits proof for wrong complaint → GPS mismatch caught by backend
  - Photo doesn't show resolution → citizen will reject → system handles via reopening

### 4.10 Admin — User Management (`/admin/users`)

- Table: all users with role, status, trust level, area, created date
- Actions: change status (Active/Warning/Suspended), change trust level
- Create coordinator button → form with area assignment
- Search + filter by role, status
- **Edge case:** Admin tries to suspend another admin → block (only super-admin or system should handle this)
- **Edge case:** Admin changes their own role → block self-modification

### 4.11 Admin — Area Management (`/admin/areas`)

- List areas with coordinator count
- Create new area: name, city, bounding box (map-based selection)
- Edit area boundaries
- **Edge case:** Deleting area with active complaints → block deletion, show warning
- **Edge case:** Overlapping boundaries between areas → show warning (complaints could match multiple)

### 4.12 Admin — Escalation Panel (`/admin/escalations`)

- List all escalations sorted by level (highest first)
- Filter: resolved/unresolved, level
- Action: mark resolved with notes
- Link to complaint
- **Edge case:** Escalation for deleted complaint → handle gracefully

### 4.13 Admin — Audit Logs (`/admin/audit-logs`)

- Searchable, filterable table
- Columns: timestamp, user, action, entity, old value, new value
- Export to CSV
- **Edge case:** Massive log volume → server-side pagination mandatory, no "load all"

### 4.14 Admin — SLA Config (`/admin/sla-config`)

- Table of categories with current SLA hours
- Edit button per row
- **Edge case:** Changing SLA doesn't retroactively change existing complaint deadlines (only new ones)

---

## 5. State Management Strategy

| Scope | Tool | Usage |
|---|---|---|
| Auth state | React Context | User, token, role |
| Server data | React Query (TanStack Query) or SWR | API caching, refetching, optimistic updates |
| Form state | React Hook Form or local state | Validation, multi-step wizard |
| URL state | React Router search params | Filters, pagination |

> [!TIP]
> Use React Query's `staleTime` and `refetchInterval` to keep complaint statuses fresh without manual polling.

---

## 6. Responsive Design Requirements

| Breakpoint | Target |
|---|---|
| < 768px | Mobile (single column, hamburger menu) |
| 768–1024px | Tablet (sidebar collapsible) |
| > 1024px | Desktop (full layout) |

**Critical mobile considerations:**
- Camera capture must work on mobile browsers (Chrome, Safari)
- GPS accuracy often better on mobile
- Map interaction (pinch-to-zoom) must work
- Long forms → use step wizard on mobile, not single long page
