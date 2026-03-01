# CityWatch — Workflows, Logic & Edge Cases

This document covers every workflow in the system with **all edge cases, failure scenarios, race conditions, and loopholes** identified and addressed.

---

## 1. Complaint Submission Workflow

### Happy Path
1. Citizen opens submission form
2. Selects category
3. Writes description (≥50 chars)
4. Captures live photo via camera
5. GPS auto-detected
6. Clicks submit
7. Backend validates → saves → Status = `PENDING_REVIEW`
8. Coordinators in area notified

### Edge Cases & Loopholes

| # | Scenario | Risk | Solution |
|---|---|---|---|
| S1 | Citizen submits from outside city boundaries | Invalid complaint location | Backend checks GPS against all area bounding boxes. If no area matches → reject with "Location not in covered area" |
| S2 | Citizen uploads a file instead of capturing live | Fake/old photos | Frontend has NO `<input type="file">`. Only WebRTC capture. Backend can't fully prevent camera spoofing but this raises the bar significantly |
| S3 | Citizen takes photo of screen showing someone else's problem | Fraudulent complaint | Cannot fully prevent. Coordinator voting acts as validation layer. Pattern detection (stretch goal) |
| S4 | Citizen submits 100 complaints in 1 hour | Spam/DoS | Rate limit: max 5 complaints per citizen per 24 hours. Enforce in backend, show countdown in frontend |
| S5 | Citizen submits same pothole twice | Duplicate data | Duplicate detection: find existing complaints within 100m radius, same category, last 7 days. If found → reject with "Similar complaint already exists" and link to it |
| S6 | Citizen with RESTRICTED trust level tries to submit | Abuse | Backend rejects. Frontend should hide submit button and show "Account under review" message |
| S7 | Citizen with SUSPENDED status tries to submit | Abuse | Auth middleware blocks all actions for suspended users at auth layer |
| S8 | GPS accuracy is very poor (>500m) | Wrong area assignment | Frontend shows accuracy indicator. Backend uses area bounding box — if GPS uncertainty overlaps multiple areas, assign to closest area center |
| S9 | GPS is spoofed via browser dev tools | Fake location | Cannot fully prevent client-side. Mitigated by: (a) coordinator voting validates the complaint, (b) cross-reference IP geolocation as sanity check (optional), (c) if complaint later found fake, citizen gets strike |
| S10 | Network fails during image upload | Lost complaint | Frontend: save form state to localStorage. Show retry button. Don't clear form on failure |
| S11 | Image is extremely large (10MB+) | Slow upload, server storage | Client-side: resize to max 1920px width, compress to 80% JPEG quality. Backend: reject if > 5MB |
| S12 | Two citizens submit for same issue simultaneously | Near-duplicate | Duplicate detection uses a time window check. The second submission may go through if submitted within seconds — acceptable, coordinator voting will handle |
| S13 | Citizen's browser doesn't support WebRTC | Cannot submit | Feature detection on page load. Show "Your browser doesn't support camera capture. Please use Chrome, Firefox, or Edge" |
| S14 | Description is all gibberish/random characters | Spam | Minimum length of 50 chars. Optional: basic pattern detection (e.g., reject if >80% non-alphabetic characters). Coordinator voting as fallback |

---

## 2. Coordinator Voting Workflow

### Happy Path
1. Complaint enters `PENDING_REVIEW`
2. All coordinators in the area see it
3. Each votes independently: Valid / Invalid / Needs Clarification
4. Votes are hidden until all coordinators have voted (or timeout)
5. Majority determines outcome:
   - ≥60% VALID → `APPROVED`
   - ≥60% INVALID → `REJECTED`
   - Tie / No majority → Admin Review

### Edge Cases & Loopholes

| # | Scenario | Risk | Solution |
|---|---|---|---|
| V1 | Only 1 coordinator in an area (others resigned/suspended) | Single person can approve anything | **Minimum voter threshold:** Require at least 2 votes for a decision. If area has <2 active coordinators → flag to admin, hold complaint |
| V2 | Coordinators collude to approve fake complaints | Corruption | Random 5% audit by admin. Track approval rate per coordinator — if >95% approval rate, flag for review |
| V3 | Coordinator votes on complaint from outside their area | Unauthorized voting | Backend enforces: `coordinator.area_id == complaint.area_id`. Return 403 if mismatch |
| V4 | Coordinator votes twice on same complaint | Vote manipulation | `UNIQUE(complaint_id, coordinator_id)` constraint in DB. Backend checks before insert |
| V5 | Coordinator sees other votes before voting | Herd behavior | API returns vote summary only (count, not individual votes) until voting is complete or all eligible coordinators have voted |
| V6 | No coordinator votes within reasonable time | Complaint stuck forever | **Voting timeout:** If <60% of coordinators voted within 48 hours → auto-escalate to admin for manual decision |
| V7 | Coordinator account is suspended mid-voting | Vote counting disrupted | Recalculate eligible count. If suspended coordinator already voted → their vote stands (already cast). Adjust majority calculation for new eligible count |
| V8 | New coordinator added to area during voting | Should they vote? | No. Voting eligibility is locked at complaint creation time. Snapshot eligible coordinators when complaint enters PENDING_REVIEW |
| V9 | "Needs Clarification" votes — what happens? | Ambiguous outcome | Treat as "abstain" for majority calculation. If all votes are "Needs Clarification" → admin review. Notify citizen to add clarification comment |
| V10 | Area has exactly 2 coordinators and they split | Tie | Always goes to admin review. Admin makes final APPROVE/REJECT decision |

> [!WARNING]
> **Critical loophole: Coordinator collusion.** If 3 of 5 coordinators in an area collude, they can approve any fake complaint. **Mitigation:** Random audit system (admin reviews 5% of approved complaints), vote anomaly detection (track if same group always votes together), and citizen rejection mechanism (citizen can reject bad completions).

---

## 3. Intensity Calculation Workflow

### Formula
```
intensity_score = log(1 + Σ(weight_i))
```

Where:
- Sum is over all similar complaints within `CLUSTER_RADIUS` (default: 500m)
- `weight_i` depends on citizen trust level:
  - NORMAL: 1.0
  - UNDER_REVIEW: 0.5
  - RESTRICTED: 0.0 (not counted)
- Same category only
- Only APPROVED or higher status complaints counted

### Priority Mapping
| Score Range | Priority |
|---|---|
| 0 – 0.69 | LOW (0–1 similar complaints) |
| 0.70 – 1.09 | MEDIUM (2–3 similar) |
| 1.10 – 1.60 | HIGH (4–7 similar) |
| > 1.60 | CRITICAL (8+ similar) |

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| I1 | Cluster of fake complaints from one person | Inflated priority | Rate limit per citizen. RESTRICTED citizens have weight 0. Duplicate detection prevents same-location spam |
| I2 | Real cluster of complaints across category boundary | Missed clustering | For now, clustering is within same category. Future: cross-category clustering as enhancement |
| I3 | Intensity never recalculated after complaints close | Stale priority | Recalculate on: new complaint approved, existing complaint closed. Use only active complaints for calculation |
| I4 | Large radius picks up complaints from neighboring zones | Cross-zone inflation | Clustering respects area boundaries. Only cluster within same area |

---

## 4. Assignment Workflow

### Happy Path
1. Complaint approved → system auto-assigns
2. Random coordinator selection from area
3. Status → `ASSIGNED`
4. SLA timer starts
5. Coordinator notified

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| A1 | No available coordinators in area (all suspended) | Complaint stuck | Auto-escalate to admin. Admin can either activate a coordinator or manually assign from adjacent area |
| A2 | Coordinator assigned to 50+ complaints | Overloaded | Load-balanced random selection: weight by current active assignment count. Coordinators with fewer active complaints get higher selection probability |
| A3 | Assigned coordinator gets suspended before starting | Complaint stuck | **SLA check scheduler** detects assigned complaints with suspended coordinators → auto-reassign |
| A4 | Coordinator assigns themselves | Self-dealing | System-only assignment. No API endpoint for self-assignment. Backend enforces |
| A5 | Reopened complaint → same coordinator reassigned | Conflict of interest | Exclude all previously assigned coordinators from reassignment pool |
| A6 | All coordinators in area have been previously assigned | Reopened complaint loop | If no unassigned coordinator available → escalate to admin. Admin can assign coordinator from another area or handle directly |

---

## 5. SLA Tracking Workflow

### How It Works
1. When complaint is ASSIGNED, calculate deadline: `assigned_at + sla_hours`
2. Scheduled job runs every hour
3. Checks all non-closed complaints where `NOW() > sla_deadline`
4. For newly delayed: Status → `DELAYED`, Level 1 escalation
5. For already delayed (24+ hours overdue): Level 2 escalation
6. For critically delayed (48+ hours overdue): Level 3 escalation

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| SLA1 | Admin changes SLA config | Retroactive confusion | Only apply new SLA to newly assigned complaints. Existing deadlines remain unchanged |
| SLA2 | Complaint reassigned after delay | SLA resets? | **No.** Original SLA deadline stays. Reassignment doesn't reset the clock. New coordinator inherits the urgency |
| SLA3 | Scheduled job server was down for 6 hours | Missed deadline detection | On job startup, immediately check all active complaints. Job is designed to be idempotent — running it catches up |
| SLA4 | Complaint completed 1 minute before deadline | Close call | Mark as completed. SLA met. Track resolution time for analytics |
| SLA5 | Coordinator updates status to IN_PROGRESS but never completes | Gaming SLA | SLA tracks deadline from ASSIGNED time, not IN_PROGRESS time. Status update alone doesn't extend deadline |
| SLA6 | Timezone differences | Deadline calculated wrong | All timestamps stored in UTC. SLA calculated in UTC. Display converted to user's timezone in frontend |

---

## 6. Completion & Proof Workflow

### Happy Path
1. Coordinator visits site
2. Opens proof capture page
3. Captures live photo (WebRTC)
4. GPS auto-detected
5. Backend calculates distance from complaint: Haversine formula
6. If distance ≤ 100m → Proof accepted
7. Status → `COMPLETED` (Awaiting Citizen Confirmation)
8. Citizen notified

### Edge Cases & Loopholes

| # | Scenario | Risk | Solution |
|---|---|---|---|
| P1 | Coordinator submits proof from 500m away | Didn't actually visit | Distance check enforced: within 100m. Configurable per deployment |
| P2 | Coordinator spoofs GPS | Fake proof | Cannot 100% prevent. Mitigations: (a) citizen confirmation step catches bad proofs, (b) random audits by admin, (c) if citizen rejects → coordinator gets flagged |
| P3 | Coordinator takes photo of something unrelated | Fake completion | Citizen confirmation catches this. If rejected → complaint reopens, coordinator flagged |
| P4 | Coordinator submits proof for complaint not assigned to them | Unauthorized | Backend: verify `complaint.assigned_coordinator_id == current_user.id` |
| P5 | Coordinator submits proof before status is IN_PROGRESS | Status violation | Backend: allow proof only if status is `IN_PROGRESS`. Enforce transition rules |
| P6 | Coordinator submits multiple proofs | Confusion | Allow multiple proofs (some issues need follow-up). Display latest proof for citizen confirmation. Keep history |
| P7 | Citizen never confirms/rejects | Complaint stuck | **Auto-close timer:** If citizen doesn't respond within 7 days after completion → auto-close with note "Auto-closed: no citizen response" |
| P8 | Photo timestamp doesn't match current time | Old photo | Backend records server timestamp for proof. Cannot guarantee photo recency (screenshot of old photo possible). Citizen confirmation is the safety net |

---

## 7. Citizen Confirmation Workflow

### Happy Path
1. Citizen receives notification
2. Views proof image + map
3. Clicks Accept → `CLOSED`
4. OR Clicks Reject (with reason) → `REOPENED`

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| C1 | Citizen abuses rejection to harass coordinator | Unfair reopening | Track rejection count per citizen. If citizen rejects >3 times for same complaint → admin review before further reopening |
| C2 | Citizen rejects without valid reason | Waste of resources | Rejection reason is mandatory (min 20 chars). Admin can review and override |
| C3 | Multiple reopens for same complaint | Infinite loop | Max 3 reopens per complaint. After 3rd → complaint goes to admin for final resolution |
| C4 | Citizen account suspended after completion | Can't confirm | Auto-close after timeout (7 days). Admin can manually close |
| C5 | Complaint auto-closed but issue wasn't actually resolved | Citizen didn't get to respond | Allow citizen to file a new complaint for the same issue. System detects as related (within radius + same category) |

---

## 8. Escalation Workflow

### Trigger Conditions (All Automatic)

| Trigger | Escalation Level | Action |
|---|---|---|
| SLA exceeded by 0–24 hours | Level 1 | Admin receives notification |
| SLA exceeded by 24–48 hours | Level 2 | Complaint marked "High Attention" in admin panel |
| SLA exceeded by 48+ hours | Level 3 | Admin forced review required, complaint flagged red |
| Citizen rejects resolution | Level += 1 | Reassign + notify admin |
| Voting timeout (no majority in 48h) | Level 1 | Admin must manually decide |

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| E1 | Admin ignores escalations | Complaints stay unresolved | Track admin response time on escalations. System can notify super-admin or generate weekly report |
| E2 | Escalation for a complaint that just got completed | Stale escalation | Before processing escalation action, check current complaint status. If already COMPLETED/CLOSED → mark escalation as auto-resolved |
| E3 | Multiple escalation triggers for same complaint | Duplicate escalations | Only create new escalation record if level increases. Don't duplicate same-level escalations |

---

## 9. Trust & Reputation System

### Citizen Trust Level Changes

| Event | Effect |
|---|---|
| Complaint approved | No change (expected behavior) |
| Complaint rejected | `strike_count++`. If strikes ≥ 3 → trust = `UNDER_REVIEW` |
| Complaint rejected 5+ times | Trust = `RESTRICTED`. Citizen can no longer submit |
| Admin reviews and clears | Trust can be restored to `NORMAL`, strikes reset |
| Citizen rejects valid proof (confirmed by admin audit) | Strike |

### Coordinator Status Changes

| Event | Effect |
|---|---|
| SLA violations (3+) | Status = `WARNING` |
| Proof rejected by citizen (3+ times) | Status = `WARNING` |
| Continued violations after WARNING | Status = `SUSPENDED` |
| Admin clears | Status = `ACTIVE` |
| Vote anomaly detected | Admin notified, manual review |

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| T1 | Citizen makes legitimate complaint but coordinators reject it unfairly | Good citizen punished | Admin review on ties. Citizen can comment to provide more evidence. Admin can override rejection and remove strike |
| T2 | Coordinator has bad luck — complaints in their area are hard to resolve | Unfair SLA violations | Admin context when reviewing: see complaint difficulty, area conditions. Manual judgment |
| T3 | Trust changes not reflected in real-time | Stale behavior | Trust checked on every complaint submission and vote weight calculation. Not cached |

---

## 10. Comment System Workflow

### Rules

1. Any authenticated user can comment on any visible complaint
2. Threaded replies (max 3 levels deep)
3. Min 5 characters per comment
4. Profanity filter (word list check)
5. Admin can moderate (soft-delete: mark `is_moderated=true`)
6. Moderated comments show "This comment has been removed" to others, original visible to admin

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| CM1 | User spams comments | Noise | Rate limit: max 10 comments per hour per user |
| CM2 | Profanity in different language | Bypass filter | Start with English word list. Expand as needed. Admin moderation as safety net |
| CM3 | User edits comment to add profanity after posting | Bypass | No comment editing after 5 minutes. Or: re-run profanity filter on edit |
| CM4 | Harassment via comments | Abuse | Report button (stretch goal). Admin moderation. User can be suspended |
| CM5 | Comment on closed complaint | Unnecessary | Allow comments on closed complaints (useful for "thank you" or follow-up). But rate-limit to 2 per day on closed complaints |

---

## 11. Notification System

### Notification Triggers

| Event | Recipients | Type |
|---|---|---|
| New complaint in area | All coordinators in area | `VOTE_REQUIRED` |
| Complaint approved | Citizen (owner) | `COMPLAINT_UPDATE` |
| Complaint rejected | Citizen (owner) | `COMPLAINT_UPDATE` |
| Coordinator assigned | Assigned coordinator | `COMPLAINT_UPDATE` |
| SLA approaching (12h before) | Assigned coordinator | `SLA_WARNING` |
| SLA exceeded | Assigned coordinator + Admin | `ESCALATION` |
| Proof submitted | Citizen (owner) | `COMPLAINT_UPDATE` |
| Complaint closed | Citizen + Coordinator | `COMPLAINT_UPDATE` |
| Complaint reopened | New coordinator + Admin | `ESCALATION` |
| Trust level changed | Affected user | `SYSTEM` |
| New comment on complaint | All participants (except commenter) | `COMPLAINT_UPDATE` |

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| N1 | Notification flood (100 comments on one complaint) | Noise | Batch comment notifications: "5 new comments on your complaint" (aggregate every 30 min) |
| N2 | User has 1000+ unread notifications | Performance | Paginate. Don't load all. Show count only. Auto-delete notifications older than 90 days |
| N3 | Notification for deleted/suspended user | Waste | Check user status before sending. Skip suspended users |
| N4 | Push notifications needed | Scope | Out of scope for mini project. In-app notifications only. Add push in Phase 3 |

---

## 12. Status Transition Enforcement (State Machine)

Every status change must be validated against the legal transition map.

```java
// Backend: ComplaintStatusMachine.java

Map<Status, Set<Status>> VALID_TRANSITIONS = Map.of(
    DRAFT,           Set.of(PENDING_REVIEW),
    PENDING_REVIEW,  Set.of(APPROVED, REJECTED),
    APPROVED,        Set.of(ASSIGNED),
    ASSIGNED,        Set.of(IN_PROGRESS, DELAYED),
    IN_PROGRESS,     Set.of(COMPLETED, DELAYED),
    COMPLETED,       Set.of(CLOSED, REOPENED),
    REOPENED,        Set.of(ASSIGNED),
    DELAYED,         Set.of(IN_PROGRESS, ESCALATED, COMPLETED),
    ESCALATED,       Set.of(ASSIGNED, IN_PROGRESS, CLOSED)
);

// REJECTED and CLOSED are terminal states — no transitions out
```

> [!IMPORTANT]
> **Every API that changes complaint status MUST call `StatusMachine.validate(currentStatus, newStatus)`** before persisting. No exceptions. No backdoor status changes. This is the single strongest anti-loophole mechanism in the system.

### Edge Cases

| # | Scenario | Risk | Solution |
|---|---|---|---|
| ST1 | Direct DB manipulation to change status | Bypass application logic | No direct DB access. All changes via API. DB user has limited permissions |
| ST2 | Race condition: two requests change status simultaneously | Invalid state | Use optimistic locking (`@Version` in JPA). Second request gets `OptimisticLockException` → retry |
| ST3 | System crashes mid-transition | Inconsistent state | Use `@Transactional` on all status changes. Either all changes commit or none |
