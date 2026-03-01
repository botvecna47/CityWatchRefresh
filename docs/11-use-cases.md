# CityWatch — Use Case Document

**Version:** 1.0
**Notation:** Each use case follows the structured format with Actor, Preconditions, Main Flow, Alternate Flows, and Postconditions.

---

## Use Case Diagram (Text)

```
                          ┌───────────────────────────────────────────┐
                          │              CityWatch System             │
                          │                                           │
    ┌──────────┐          │  ┌──────────────────────────────────┐     │
    │          │──────────│─►│ UC-01: Register Account          │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-02: Login                     │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-03: Submit Complaint          │     │
    │ CITIZEN  │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-04: View My Complaints        │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-05: Confirm/Reject Resolution │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-06: Comment on Complaint      │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-07: View Map                  │     │
    └──────────┘          │  └──────────────────────────────────┘     │
                          │                                           │
    ┌──────────┐          │  ┌──────────────────────────────────┐     │
    │          │──────────│─►│ UC-08: Vote on Complaint         │     │
    │COORDINATOR│         │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-09: Update Progress           │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-10: Submit Proof              │     │
    └──────────┘          │  └──────────────────────────────────┘     │
                          │                                           │
    ┌──────────┐          │  ┌──────────────────────────────────┐     │
    │          │──────────│─►│ UC-11: Manage Users              │     │
    │          │          │  └──────────────────────────────────┘     │
    │  ADMIN   │──────────│─►│ UC-12: Manage Areas              │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-13: Handle Escalations        │     │
    │          │          │  └──────────────────────────────────┘     │
    │          │──────────│─►│ UC-14: View Audit Logs           │     │
    └──────────┘          │  └──────────────────────────────────┘     │
                          │                                           │
    ┌──────────┐          │  ┌──────────────────────────────────┐     │
    │  SYSTEM  │──────────│─►│ UC-15: Auto-Assign Coordinator   │     │
    │ (Timer)  │──────────│─►│ UC-16: Check SLA Deadlines       │     │
    │          │──────────│─►│ UC-17: Auto-Escalate             │     │
    │          │──────────│─►│ UC-18: Auto-Close (No Response)  │     │
    └──────────┘          │  └──────────────────────────────────┘     │
                          └───────────────────────────────────────────┘
```

---

## UC-01: Register Account

| Field | Detail |
|---|---|
| **Actor** | Anonymous User |
| **Precondition** | User is not logged in |
| **Trigger** | User clicks "Register" |

**Main Flow:**
1. System displays registration form
2. User enters: username, email, password, confirm password, phone (optional), city (dropdown)
3. System validates all fields (client-side)
4. User clicks "Register"
5. System validates server-side (unique email/username, password strength, allowed city)
6. System creates account with role=CITIZEN, trust=NORMAL, status=ACTIVE
7. System generates JWT token
8. System redirects to Citizen Dashboard

**Alternate Flows:**
- **A1:** Email already exists → Show "Email already registered" error
- **A2:** Password too weak → Show requirements
- **A3:** City not in allowed list → Show "Service not available in your city"
- **A4:** Rate limit exceeded (3 registrations/hour/IP) → Show "Too many attempts"

**Postcondition:** User account exists, user is logged in

---

## UC-02: Login

| Field | Detail |
|---|---|
| **Actor** | Registered User |
| **Precondition** | Account exists |
| **Trigger** | User navigates to login page |

**Main Flow:**
1. System displays login form
2. User enters email and password
3. System validates credentials
4. System checks account is not SUSPENDED
5. System generates JWT token
6. System redirects to role-appropriate dashboard

**Alternate Flows:**
- **A1:** Invalid credentials → "Invalid credentials" (generic message)
- **A2:** Account suspended → "Account suspended. Contact admin"
- **A3:** Account locked (5 failed attempts) → "Account temporarily locked"

---

## UC-03: Submit Complaint

| Field | Detail |
|---|---|
| **Actor** | Citizen |
| **Precondition** | Logged in, trust ≠ RESTRICTED, daily limit not reached |
| **Trigger** | Citizen clicks "Report an Issue" |

**Main Flow:**
1. System checks citizen's trust level → OK
2. System displays step wizard:
   - Step 1: Select category (Pothole/Garbage/Streetlight/Drainage/Other)
   - Step 2: Enter description (textarea, min 50 chars, char counter)
   - Step 3: Capture photo (camera activates, preview, confirm)
   - Step 4: GPS capture (auto-detect, show on map, allow minor adjustment)
   - Step 5: Review all inputs
3. Citizen clicks "Submit"
4. System validates: description length, image present, GPS present
5. System checks rate limit (≤5/day)
6. System checks duplicate (100m radius, same category, 7 days)
7. System assigns area from GPS
8. System saves complaint with status=PENDING_REVIEW
9. System notifies all coordinators in area
10. System shows confirmation: "Complaint #42 submitted"

**Alternate Flows:**
- **A1:** Trust=RESTRICTED → "Your account is under review. Cannot submit"
- **A2:** Rate limit exceeded → "Maximum 5 complaints per day reached"
- **A3:** Duplicate detected → "Similar complaint exists nearby" + link
- **A4:** GPS outside coverage → "Your location is not in our coverage area"
- **A5:** Camera permission denied → "Camera access required"
- **A6:** GPS permission denied → "Location access required"
- **A7:** Network failure during submit → "Submission failed. Your data is saved. Click to retry"

---

## UC-04: View My Complaints

| Field | Detail |
|---|---|
| **Actor** | Citizen |
| **Precondition** | Logged in |

**Main Flow:**
1. Citizen navigates to "My Complaints"
2. System displays paginated list of citizen's complaints
3. Each card shows: category icon, status badge, priority badge, description preview, date
4. Citizen clicks a complaint → System shows full detail

**Alternate Flows:**
- **A1:** No complaints → Show "No complaints yet" with link to submit

---

## UC-05: Confirm/Reject Resolution

| Field | Detail |
|---|---|
| **Actor** | Citizen (complaint owner) |
| **Precondition** | Complaint status=COMPLETED |

**Main Flow (Accept):**
1. Citizen receives notification "Your complaint has been resolved"
2. Citizen views proof: image, location, distance
3. Citizen clicks "Accept Resolution"
4. System sets status=CLOSED, records closed_at
5. System notifies coordinator

**Main Flow (Reject):**
1. Citizen views proof
2. Citizen clicks "Reject Resolution"
3. System prompts for reason (min 20 chars)
4. Citizen enters reason, confirms
5. System sets status=REOPENED, reopen_count++, escalation_level++
6. System reassigns to different coordinator
7. System notifies admin

**Alternate Flows:**
- **A1:** Max 3 reopens reached → "Maximum reopens reached. Admin will review"
- **A2:** Auto-close: No response in 7 days → System auto-closes

---

## UC-06: Comment on Complaint

| Field | Detail |
|---|---|
| **Actor** | Any authenticated user |
| **Precondition** | Logged in, complaint exists |

**Main Flow:**
1. User views complaint detail
2. User types comment (min 5 chars)
3. Optionally clicks "Reply" on existing comment (threaded)
4. System runs profanity filter
5. System saves comment
6. System notifies other participants

**Alternate Flows:**
- **A1:** Profanity detected → "Comment contains inappropriate language"
- **A2:** Rate limit (10/hour) → "Too many comments. Try again later"

---

## UC-07: View Map

| Field | Detail |
|---|---|
| **Actor** | Any authenticated user |

**Main Flow:**
1. User navigates to map view
2. System loads Google Maps centered on user's area
3. System displays complaint markers (color-coded by category/priority)
4. User clicks marker → info popup with complaint summary
5. User clicks popup → navigates to complaint detail

---

## UC-08: Vote on Complaint

| Field | Detail |
|---|---|
| **Actor** | Coordinator |
| **Precondition** | Complaint status=PENDING_REVIEW, coordinator in same area, not yet voted |

**Main Flow:**
1. Coordinator views pending complaints list
2. Coordinator selects a complaint
3. System shows complaint detail (description, photo, location, map)
4. System shows vote count (X of Y voted) but NOT individual votes
5. Coordinator selects: Valid / Invalid / Needs Clarification
6. Optionally adds comment
7. System records vote
8. System checks majority:
   - ≥60% VALID → APPROVED, calculate intensity, auto-assign
   - ≥60% INVALID → REJECTED, citizen strike++
   - Tie after all voted → Admin notified

**Alternate Flows:**
- **A1:** Already voted → "You have already voted on this complaint"
- **A2:** Voting timeout (48h, no majority) → System escalates to admin

---

## UC-09: Update Progress

| Field | Detail |
|---|---|
| **Actor** | Assigned Coordinator |
| **Precondition** | Complaint assigned to this coordinator |

**Main Flow:**
1. Coordinator views assigned complaint
2. Coordinator clicks "Mark In Progress"
3. System validates transition (ASSIGNED→IN_PROGRESS)
4. System updates status, creates audit log
5. System notifies citizen

---

## UC-10: Submit Completion Proof

| Field | Detail |
|---|---|
| **Actor** | Assigned Coordinator |
| **Precondition** | Complaint status=IN_PROGRESS, coordinator at complaint location |

**Main Flow:**
1. Coordinator navigates to proof submission
2. System activates camera, auto-captures GPS
3. Coordinator captures live photo of resolved issue
4. System shows preview + GPS coordinates
5. Coordinator clicks "Submit Proof"
6. System calculates distance (Haversine) between proof GPS and complaint GPS
7. Distance ≤ 100m → Proof accepted
8. Status → COMPLETED, citizen notified

**Alternate Flows:**
- **A1:** Distance > 100m → "You are Xm away. Must be within 100m"
- **A2:** Camera denied → Error message
- **A3:** GPS denied → Error message

---

## UC-11: Manage Users (Admin)

| Field | Detail |
|---|---|
| **Actor** | Admin |

**Main Flow:**
1. Admin views user table (all users, filterable by role/status)
2. Admin can: create coordinator account, change user status, change trust level
3. All changes logged in audit log

**Alternate Flows:**
- **A1:** Admin tries to modify self → "Cannot modify your own account"

---

## UC-12: Manage Areas (Admin)

| Field | Detail |
|---|---|
| **Actor** | Admin |

**Main Flow:**
1. Admin views area list
2. Admin can create new area (name, city, bounding box)
3. Admin can edit existing area boundaries

**Alternate Flows:**
- **A1:** Delete area with active complaints → "Cannot delete: X active complaints"

---

## UC-13: Handle Escalations (Admin)

| Field | Detail |
|---|---|
| **Actor** | Admin |

**Main Flow:**
1. Admin views escalation panel (sorted by level, highest first)
2. Admin reviews complaint details
3. Admin takes action: reassign, force-close, adjust SLA, add notes
4. Admin marks escalation as resolved

---

## UC-14: View Audit Logs (Admin)

| Field | Detail |
|---|---|
| **Actor** | Admin |

**Main Flow:**
1. Admin views paginated, searchable audit log table
2. Filters: date range, user, action type, entity type
3. Each entry shows: timestamp, actor, action, entity, old/new values

---

## UC-15: Auto-Assign Coordinator (System)

| Field | Detail |
|---|---|
| **Actor** | System |
| **Trigger** | Complaint approved via voting |

**Main Flow:**
1. System finds all ACTIVE coordinators in the complaint's area
2. System filters out previously assigned (if reopened)
3. System selects randomly (weighted by active assignment count)
4. System sets assigned_coordinator_id, status=ASSIGNED
5. System calculates SLA deadline
6. System notifies assigned coordinator

**Alternate Flows:**
- **A1:** No available coordinators → Create Level 1 escalation, notify admin

---

## UC-16: Check SLA Deadlines (System)

| Field | Detail |
|---|---|
| **Actor** | System Scheduler (runs every hour) |

**Main Flow:**
1. Query all complaints where: status IN (ASSIGNED, IN_PROGRESS) AND sla_deadline < NOW()
2. For each overdue complaint:
   - If not yet DELAYED → set status=DELAYED, create Level 1 escalation
   - If 24h+ overdue → upgrade to Level 2
   - If 48h+ overdue → upgrade to Level 3

---

## UC-17: Auto-Escalate (System)

| Field | Detail |
|---|---|
| **Actor** | System |
| **Triggers** | SLA exceeded, citizen rejection, voting tie |

**Main Flow:**
1. Create escalation record with level and reason
2. Notify admin
3. If Level 3 → mark complaint as requiring admin review

---

## UC-18: Auto-Close No Response (System)

| Field | Detail |
|---|---|
| **Actor** | System Scheduler |
| **Trigger** | Complaint status=COMPLETED for 7+ days without citizen response |

**Main Flow:**
1. Find completed complaints older than 7 days without confirmation
2. Set status=CLOSED, add note "Auto-closed: no citizen response"
3. Create audit log entry
