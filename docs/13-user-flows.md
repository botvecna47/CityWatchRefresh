# CityWatch — User Flows

> Step-by-step journeys for each actor through the system. Each flow shows decision points and alternate paths.

---

## 1. Citizen: First-Time Journey

```
[Opens CityWatch]
    │
    ▼
[Landing Page]
    │
    ├── Clicks "Get Started" / "Register"
    ▼
[Register Page]
    │
    ├── Fills form: username, email, password, city
    ├── Clicks "Register"
    │
    ├── ❌ Validation error → fix & retry
    ├── ❌ Email exists → login instead
    ├── ✅ Success
    ▼
[Citizen Dashboard] (first visit)
    │
    ├── Sees onboarding: "Welcome! Report your first issue"
    ├── Clicks "Report an Issue"
    ▼
[Submit Complaint Wizard]
    │
    ├── Step 1: Select category
    ├── Step 2: Write description (≥50 chars)
    ├── Step 3: Capture photo (camera)
    │   ├── ❌ Camera denied → error + instructions
    │   ├── ✅ Photo captured → preview → confirm
    ├── Step 4: GPS capture
    │   ├── ❌ GPS denied → error + instructions
    │   ├── ⚠️ Low accuracy → warning
    │   ├── ✅ Location confirmed → show on map
    ├── Step 5: Review all → Submit
    │
    ├── ❌ Rate limit → "Max 5/day reached"
    ├── ❌ Duplicate → "Similar complaint exists" + link
    ├── ❌ Outside area → "Not in coverage area"
    ├── ✅ Submitted
    ▼
[Confirmation: "Complaint #42 submitted"]
    │
    ▼
[Citizen Dashboard] — sees complaint in "My Complaints"
```

---

## 2. Citizen: Track & Confirm Resolution

```
[Citizen Dashboard]
    │
    ├── 🔔 Notification: "Your complaint was approved"
    │
    ├── ... time passes ...
    │
    ├── 🔔 Notification: "Proof submitted for #42"
    │
    ├── Clicks notification
    ▼
[Complaint Detail #42] — Status: COMPLETED
    │
    ├── Views: original photo vs proof photo
    ├── Sees: distance verified (45m ✅)
    │
    ├── Clicks "Accept Resolution"
    │   ├── ✅ Status → CLOSED
    │   └── Done ✅
    │
    ├── Clicks "Reject Resolution"
    │   ├── Enters reason (≥20 chars)
    │   ├── ❌ Reopen count ≥ 3 → "Admin will review"
    │   ├── ✅ Status → REOPENED → reassigned to new coordinator
    │   └── Waits for new proof
    │
    ├── (No action for 7 days)
    │   └── System auto-closes
    ▼
[DONE]
```

---

## 3. Coordinator: Review & Vote

```
[Coordinator Login]
    │
    ▼
[Coordinator Dashboard]
    │
    ├── Sees: pending reviews count, assigned count
    ├── Clicks "Pending Reviews"
    ▼
[Pending Reviews List]
    │
    ├── Selects complaint to review
    ▼
[Complaint Detail — With Vote Panel]
    │
    ├── Views: photo, description, location map
    ├── Sees: "3 of 5 coordinators voted"
    ├── Does NOT see: individual votes
    │
    ├── Clicks "Valid"
    │   ├── Optionally adds comment
    │   ├── Clicks "Submit Vote"
    │   ├── ✅ Vote recorded
    │   ├── If this creates majority → complaint approved
    │   └── Returns to pending list
    │
    ├── Clicks "Invalid"
    │   ├── Same flow → if majority → complaint rejected → citizen strike
    │
    ├── Clicks "Needs Clarification"
    │   ├── Treated as abstain for majority
    │
    ├── Already voted → sees "You voted: VALID"
    ▼
[Back to Pending Reviews — one less item]
```

---

## 4. Coordinator: Resolve Complaint

```
[Coordinator Dashboard]
    │
    ├── Clicks "Assigned Complaints"
    ▼
[Assigned Complaints List]
    │
    ├── Sees: complaint details, SLA countdown
    ├── Selects complaint #42
    ▼
[Complaint Detail]
    │
    ├── Clicks "Mark In Progress"
    │   ├── Status → IN_PROGRESS
    ▼
    │
    ├── ... coordinator goes to location ...
    │
    ├── Clicks "Submit Proof"
    ▼
[Proof Submission Page]
    │
    ├── Camera activates → captures photo
    ├── GPS captured automatically
    ├── Shows: distance from original (e.g., "28m ✅")
    │
    ├── ❌ Distance > 100m → "Too far (Xm). Must be within 100m"
    ├── ❌ Camera denied → error
    ├── ❌ GPS denied → error
    ├── ✅ Proof accepted
    │   ├── Status → COMPLETED
    │   ├── Citizen notified
    ▼
[Waiting for citizen confirmation]
```

---

## 5. Admin: Handle Escalation

```
[Admin Login]
    │
    ▼
[Admin Dashboard]
    │
    ├── Sees: 3 unresolved escalations (red badge)
    ├── Clicks "Escalations"
    ▼
[Escalation Panel]
    │
    ├── Sorted: Level 3 first
    ├── Selects: Level 3 — Complaint #28 — SLA_EXCEEDED
    │
    ▼
[Escalation Detail]
    │
    ├── Views complaint history, timeline, coordinator assignment
    │
    ├── Options:
    │   ├── Reassign to different coordinator
    │   ├── Force-close with admin note
    │   ├── Adjust SLA (extend deadline)
    │   ├── Contact coordinator (via comment)
    │
    ├── Takes action → adds notes
    ├── Marks escalation as "Resolved"
    ▼
[Back to Escalation Panel — one less item]
```

---

## 6. Admin: Create Coordinator Account

```
[Admin Dashboard]
    │
    ├── Clicks "User Management"
    ▼
[User Management Page]
    │
    ├── Clicks "+ Create Coordinator"
    ▼
[Create Coordinator Form]
    │
    ├── Fills: username, email, password, phone, area (dropdown), city
    │
    ├── ❌ Email exists → error
    ├── ❌ Invalid area → error
    ├── ✅ Coordinator created with role=COORDINATOR, status=ACTIVE
    │
    ├── Credentials shared with coordinator offline
    ▼
[Back to User Management — new coordinator visible]
```

---

## 7. System: Automatic SLA Check (Background)

```
[Every 1 hour — Scheduled Job]
    │
    ├── Query: SELECT * FROM complaints
    │          WHERE status IN ('ASSIGNED', 'IN_PROGRESS')
    │          AND sla_deadline < NOW()
    │
    ├── For each overdue complaint:
    │   │
    │   ├── Not yet DELAYED?
    │   │   ├── Status → DELAYED
    │   │   ├── Create Escalation Level 1
    │   │   ├── Notify admin + coordinator
    │   │
    │   ├── 24h+ overdue?
    │   │   ├── Upgrade to Level 2
    │   │   ├── Mark "High Attention"
    │   │
    │   ├── 48h+ overdue?
    │   │   ├── Upgrade to Level 3
    │   │   ├── Mark "Admin Review Required"
    │   │
    │   └── Create audit log for each change
    │
    ▼
[Job complete — waits 1 hour — repeats]
```

---

## 8. Complete Lifecycle: Single Complaint

```
CITIZEN submits complaint
    │
    ▼ Status: PENDING_REVIEW
    │
COORDINATORS vote (3-5 people)
    │
    ├── Majority VALID ──────────────────────────┐
    ├── Majority INVALID → REJECTED (end)        │
    ├── Tie → Admin decides                      │
    │                                            ▼
    │                                 Status: APPROVED
    │                                            │
    │                            SYSTEM auto-assigns coordinator
    │                            SLA timer starts
    │                                            │
    │                                 Status: ASSIGNED
    │                                            │
    │                            COORDINATOR marks In Progress
    │                                            │
    │                                 Status: IN_PROGRESS
    │                                            │
    │                 ┌──── SLA exceeded? ────────┤
    │                 │                           │
    │                 ▼                           │
    │          Status: DELAYED                    │
    │          Escalation created                 │
    │                 │                           │
    │                 └──────────────┐            │
    │                                │            │
    │                            COORDINATOR visits site
    │                            Captures proof (photo + GPS)
    │                            Distance verified ≤ 100m
    │                                            │
    │                                 Status: COMPLETED
    │                                            │
    │                            CITIZEN reviews proof
    │                                            │
    │                ┌──── Accept ───────────┐    │
    │                │                       │    │
    │                ▼                       │    │
    │         Status: CLOSED                 │    │
    │         (end) ✅                       │    │
    │                                        │    │
    │                ┌──── Reject ──────────┐│    │
    │                │                      ││    │
    │                ▼                      ││    │
    │         Status: REOPENED              ││    │
    │         Escalation level++            ││    │
    │         New coordinator assigned      ││    │
    │               │                       ││    │
    │               └── back to ASSIGNED ───┘│    │
    │                                        │    │
    │                ┌── No response 7d ────┘│    │
    │                ▼                       │    │
    │         Status: CLOSED (auto)          │    │
    │         (end) ✅                       │    │
    │                                        │    │
    └────────────────────────────────────────┘    │
                                                  │
```
