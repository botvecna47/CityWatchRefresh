# CityWatch — Master Loophole & Edge Case Registry

> Every known loophole, attack vector, race condition, and failure scenario — indexed and cross-referenced.

---

## Category A: Authentication & Session

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| A1 | Brute force login | HIGH | Rate limit: 5 attempts/15min/IP. Lock account for 15 min |
| A2 | Token valid after user suspended | HIGH | Check user.status in DB on every authenticated request |
| A3 | JWT secret weak or default | CRITICAL | Use ≥256-bit random secret. Environment variable, not hardcoded |
| A4 | Token in localStorage vulnerable to XSS | MEDIUM | CSP headers. No dangerouslySetInnerHTML. Migrate to HttpOnly cookie in production |
| A5 | No logout invalidation (JWT stateless) | LOW | Short expiry (24h). Acceptable for mini project. Add token blacklist in production |
| A6 | Registration bombing | MEDIUM | Rate limit: 3 registrations/hour/IP |
| A7 | Email enumeration via login error messages | LOW | Always return "Invalid credentials" regardless of which field is wrong |
| A8 | Cached protected page visible after logout | MEDIUM | Clear all state on logout. Set `Cache-Control: no-store` on API responses |

---

## Category B: Complaint Integrity

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| B1 | Fake photo (screenshot of another photo) | MEDIUM | WebRTC-only capture (no file upload). Coordinator voting validates. Citizen confirmation as final check |
| B2 | GPS spoofing via dev tools | MEDIUM | Cannot fully prevent. Cross-check with area boundaries. Coordinator validation. Strike system for fake complaints |
| B3 | Complaint spam (same user, many complaints) | HIGH | Rate limit: 5/day/citizen. Duplicate detection within 100m/7 days |
| B4 | RESTRICTED citizen bypasses submit block | HIGH | Backend enforces trust level check. Frontend hides form but backend is the real gate |
| B5 | Citizen edits complaint after coordinator review | HIGH | Only allow edit in DRAFT status. Status machine prevents |
| B6 | Citizen deletes complaint to hide evidence | MEDIUM | Only allow delete in DRAFT. After PENDING_REVIEW → no deletion. Audit log preserves history |
| B7 | Two citizens submit identical complaints simultaneously | LOW | Rare. Both go through. Intensity calculation handles clustering. No real harm |
| B8 | Gibberish description passes validation | LOW | 50-char minimum. Optional: reject if >80% non-alpha chars. Coordinator voting catches obviously fake descriptions |
| B9 | Citizen submits complaint from different city | MEDIUM | GPS vs. city bounding box check. Reject if outside all defined areas |

---

## Category C: Voting Manipulation

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| C1 | Coordinator collusion (3/5 approve fake complaints) | CRITICAL | Random 5% admin audit. Vote correlation analysis. Citizen rejection as safety net |
| C2 | Coordinator sees others' votes → herd behavior | HIGH | Votes hidden until all cast or timeout. API returns only own vote + count |
| C3 | Single coordinator in area = sole decider | HIGH | Minimum 2 voters required. If <2 active coordinators → hold + flag admin |
| C4 | Coordinator votes from outside assigned area | HIGH | Backend enforces area_id match |
| C5 | Coordinator votes twice | HIGH | UNIQUE(complaint_id, coordinator_id) constraint + backend check |
| C6 | Nobody votes (all coordinators inactive) | HIGH | 48-hour voting timeout → auto-escalate to admin |
| C7 | New coordinator added mid-vote | LOW | Eligibility locked at complaint creation. New coordinator doesn't vote on existing pending complaints |
| C8 | Coordinator always rubber-stamps VALID | MEDIUM | Track approval rate. Flag if >95% over 20+ votes |
| C9 | Coordinator blocks everything with INVALID | MEDIUM | Track rejection rate. Flag if >80% over 20+ votes |

---

## Category D: Assignment & SLA Gaming

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| D1 | Coordinator self-assigns easy complaints | HIGH | No self-assignment. System-only random selection |
| D2 | Coordinator overloaded (50+ active complaints) | MEDIUM | Load-balanced selection weighted by active count |
| D3 | Coordinator marks IN_PROGRESS to appear active, does nothing | MEDIUM | SLA deadline tracks from ASSIGNED, not IN_PROGRESS. Status change alone doesn't extend time |
| D4 | SLA deadline passes while server is down | MEDIUM | SLA scheduler is idempotent. Catches up on restart |
| D5 | Admin changes SLA config to retroactively mark complaints as on-time | LOW | SLA changes only affect new assignments. Existing deadlines immutable |
| D6 | Coordinator suspended mid-assignment | HIGH | SLA scheduler detects suspended coordinator → auto-reassign |
| D7 | All coordinators exhausted for reopened complaint | MEDIUM | If no unassigned coordinator available → escalate to admin |
| D8 | SLA hours set to 0 or negative by admin | LOW | Backend validation: sla_hours must be ≥ 1 |

---

## Category E: Proof & Verification

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| E1 | Coordinator submits proof from wrong location | HIGH | Haversine distance check ≤ 100m enforced |
| E2 | Coordinator GPS spoofed for proof | MEDIUM | Cannot fully prevent. Citizen confirmation + random admin audit |
| E3 | Coordinator takes unrelated photo as proof | MEDIUM | Citizen reviews and rejects → complaint reopens |
| E4 | Proof submitted for non-assigned complaint | HIGH | Backend check: assigned_coordinator_id == current user |
| E5 | Proof submitted in wrong status | HIGH | Status machine: only IN_PROGRESS → COMPLETED allowed |
| E6 | Photo uploaded instead of live capture | MEDIUM | No `<input type="file">` on page. Only WebRTC canvas capture |
| E7 | Coordinator submits multiple proofs to confuse | LOW | All proofs stored historically. Latest shown for confirmation |

---

## Category F: Citizen Confirmation Abuse

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| F1 | Citizen rejects valid proof to harass coordinator | MEDIUM | Max 3 reopens per complaint. After 3rd → admin decides |
| F2 | Citizen never responds to confirmation | MEDIUM | Auto-close after 7 days of no response |
| F3 | Citizen rejection reason is empty/meaningless | LOW | Rejection reason mandatory, min 20 chars |
| F4 | Citizen confirms without checking proof | LOW | Acceptable — it's their complaint. Their choice |
| F5 | Suspended citizen can't confirm valid completion | MEDIUM | Auto-close after 7-day timeout |

---

## Category G: Admin Power Abuse

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| G1 | Admin deletes audit logs to cover tracks | CRITICAL | No DELETE endpoint for audit_logs. DB user has no DELETE permission on table |
| G2 | Admin edits complaint content | HIGH | No update endpoint for complaint description/image by admin. Admin can only change status |
| G3 | Admin manually inflates intensity | HIGH | Intensity is calculated automatically. No manual override endpoint |
| G4 | Admin suspends users without reason | MEDIUM | Audit log captures all status changes with who did it. Accountability |
| G5 | Admin creates coordinator in wrong area | LOW | Admin UI validates area selection. Backend validates area exists |
| G6 | Admin changes own trust/status | MEDIUM | Backend blocks self-modification on admin endpoints |
| G7 | Admin ignores escalations indefinitely | MEDIUM | Track admin response time. Weekly report of unresolved escalations |

---

## Category H: Data & System

| ID | Loophole | Severity | Fix |
|---|---|---|---|
| H1 | SQL injection | CRITICAL | JPA parameterized queries only. Never concatenate user input |
| H2 | XSS via comment/description | HIGH | React auto-escapes. CSP headers. Server-side sanitize stored content |
| H3 | CSRF attack | LOW | JWT in header (not cookie) → CSRF not applicable. If cookies used → enable Spring CSRF |
| H4 | Direct DB access bypasses rules | HIGH | DB user has limited permissions. SELECT/INSERT/UPDATE only on needed tables. No direct access |
| H5 | Image upload is actually malware | HIGH | Check magic bytes (JPEG/PNG headers). Strip EXIF. Never execute uploaded files |
| H6 | Disk fills up from images | MEDIUM | Monitor disk space. Clean images for rejected complaints >30 days old |
| H7 | Race condition on status change | MEDIUM | JPA @Version for optimistic locking. @Transactional for atomicity |
| H8 | Server crash during multi-step workflow | MEDIUM | @Transactional ensures full rollback. Scheduler catches missed updates |
| H9 | Notification flood | LOW | Batch similar notifications. Paginate. Auto-delete >90 days |
| H10 | IP geolocation vs GPS mismatch | LOW | We use browser GPS (accurate), not IP geolocation. No conflict |

---

## Summary by Severity

| Severity | Count | Examples |
|---|---|---|
| **CRITICAL** | 4 | Coordinator collusion, audit log deletion, SQL injection, weak JWT secret |
| **HIGH** | 19 | GPS spoofing, complaint spam, vote manipulation, XSS, proof fraud |
| **MEDIUM** | 18 | Token theft, SLA gaming, citizen abuse, GPS accuracy, disk space |
| **LOW** | 10 | Email enumeration, notification flood, duplicate submissions |

> [!IMPORTANT]
> For the **mini project**, all CRITICAL and HIGH items must be addressed. MEDIUM items should be addressed where practical. LOW items are acceptable technical debt.
