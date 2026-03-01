# CityWatch — Test Plan Document

**Version:** 1.0
**Date:** February 2026

---

## 1. Testing Strategy

| Level | Scope | Approach |
|---|---|---|
| **Manual UI Testing** | All user flows | Step through each flow on browser |
| **API Testing** | All backend endpoints | Postman / Swagger UI |
| **Edge Case Testing** | Identified edge cases from docs | Targeted manual scenarios |
| **Security Testing** | Auth, RBAC, input validation | Manual attack simulation |
| **Integration Testing** | Frontend ↔ Backend ↔ DB | End-to-end flow |
| **Cross-Browser Testing** | Chrome, Firefox, Safari, Edge | Manual verification |
| **Mobile Testing** | Camera + GPS on mobile browsers | Real device testing |

> [!NOTE]
> Automated unit tests are out of scope for the mini project 8-week timeline. All testing is manual. Document results in a test log.

---

## 2. Test Cases — Authentication

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| AUTH-01 | Register with valid data | Fill all fields correctly, submit | Account created, redirected to dashboard | HIGH |
| AUTH-02 | Register with duplicate email | Use existing email | Error: "Email already registered" | HIGH |
| AUTH-03 | Register with weak password | Password "123" | Error: password requirements shown | HIGH |
| AUTH-04 | Register with empty fields | Leave required fields blank | Validation errors on each field | MEDIUM |
| AUTH-05 | Login with valid credentials | Enter correct email/password | JWT returned, redirected to role dashboard | HIGH |
| AUTH-06 | Login with wrong password | Enter incorrect password | Error: "Invalid credentials" (generic) | HIGH |
| AUTH-07 | Login with non-existent email | Enter unknown email | Error: "Invalid credentials" (same message, no enumeration) | HIGH |
| AUTH-08 | Login with suspended account | Try to login after admin suspension | Error: "Account suspended" | HIGH |
| AUTH-09 | Access protected route without token | Navigate to /citizen directly | Redirected to login | HIGH |
| AUTH-10 | Access admin route as citizen | Citizen navigates to /admin | Redirected to citizen dashboard or 403 | HIGH |
| AUTH-11 | Token expiry | Wait 24h (or set short expiry for test) | Auto-redirect to login | MEDIUM |
| AUTH-12 | Brute force login (6 attempts) | Try 6 wrong passwords | Account locked message on 6th attempt | MEDIUM |

---

## 3. Test Cases — Complaint Submission

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| COMP-01 | Submit valid complaint | Complete all wizard steps | Complaint created with PENDING_REVIEW status | HIGH |
| COMP-02 | Submit with short description | Enter <50 chars | Validation error: "Minimum 50 characters" | HIGH |
| COMP-03 | Submit without photo | Try to proceed past photo step | "Next" disabled until photo captured | HIGH |
| COMP-04 | Submit without GPS | Deny location permission | Error message with instructions | HIGH |
| COMP-05 | Submit 6th complaint in one day | Submit 6 complaints | Error: "Maximum 5 complaints per day" | HIGH |
| COMP-06 | Submit duplicate (same location + category) | Submit pothole at same spot as existing | Error: "Similar complaint exists" + link | HIGH |
| COMP-07 | Submit from outside coverage area | Spoof GPS to random city | Error: "Not in coverage area" | HIGH |
| COMP-08 | Submit as RESTRICTED citizen | Set citizen trust to RESTRICTED, try submit | Error: "Account under review" or form hidden | HIGH |
| COMP-09 | Submit with GPS accuracy > 500m | Indoor location with poor GPS | Warning shown but submission allowed | MEDIUM |
| COMP-10 | Network failure during submission | Disconnect internet mid-submit | Error with retry option, form data preserved | MEDIUM |
| COMP-11 | Edit complaint in DRAFT status | Edit description, re-submit | Changes saved | MEDIUM |
| COMP-12 | Try to edit complaint after APPROVED | Attempt via API call | 400 error: wrong status | HIGH |

---

## 4. Test Cases — Voting

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| VOTE-01 | Coordinator votes VALID | Select valid, submit | Vote recorded, count updated | HIGH |
| VOTE-02 | Coordinator votes INVALID | Select invalid, submit | Vote recorded | HIGH |
| VOTE-03 | Majority VALID reached | 3/5 vote valid | Status → APPROVED, intensity calculated | HIGH |
| VOTE-04 | Majority INVALID reached | 3/5 vote invalid | Status → REJECTED, citizen strike++ | HIGH |
| VOTE-05 | Tie vote | 2 valid, 2 invalid, 1 clarify | Admin notified for review | HIGH |
| VOTE-06 | Coordinator votes twice | Try to cast second vote | Error: "Already voted" or 409 | HIGH |
| VOTE-07 | Coordinator from wrong area votes | Use API to vote on other area's complaint | 403 Forbidden | HIGH |
| VOTE-08 | View others' votes before voting | Check API response before all voted | Only see count, not individual decisions | HIGH |
| VOTE-09 | Voting timeout (48h, no majority) | Wait 48h without full votes | Auto-escalate to admin | MEDIUM |

---

## 5. Test Cases — Assignment & SLA

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SLA-01 | Auto-assignment after approval | Approve a complaint | Coordinator randomly assigned, SLA deadline set | HIGH |
| SLA-02 | Assignment load balancing | Assign 10 complaints with 3 coordinators | Roughly even distribution | MEDIUM |
| SLA-03 | SLA deadline detection | Set short SLA (5 min), wait | Status → DELAYED, Level 1 escalation | HIGH |
| SLA-04 | SLA Level 2 escalation | Wait 24h+ past deadline | Escalation level 2 | MEDIUM |
| SLA-05 | No coordinators available | Suspend all coordinators, approve complaint | Escalation created, admin notified | HIGH |
| SLA-06 | Status update IN_PROGRESS | Coordinator marks in progress | Status changed, citizen notified, audit logged | MEDIUM |

---

## 6. Test Cases — Proof & Confirmation

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| PROOF-01 | Submit proof within 100m | Be at complaint location, capture photo | Proof accepted, status → COMPLETED | HIGH |
| PROOF-02 | Submit proof from >100m | Be far from complaint, capture photo | Error: "Too far (Xm away)" | HIGH |
| PROOF-03 | Submit proof for wrong complaint | Try via API for unassigned complaint | 403 Forbidden | HIGH |
| PROOF-04 | Submit proof in wrong status | Try before IN_PROGRESS | 400 Bad Request | HIGH |
| PROOF-05 | Citizen accepts resolution | Click "Accept" on completed complaint | Status → CLOSED | HIGH |
| PROOF-06 | Citizen rejects resolution | Click "Reject", enter reason | Status → REOPENED, new coordinator assigned | HIGH |
| PROOF-07 | 4th rejection | Reject 4th time | "Max reopens. Admin review" | MEDIUM |
| PROOF-08 | Auto-close (7 days no response) | Wait 7 days after COMPLETED | Status → CLOSED (auto) | MEDIUM |

---

## 7. Test Cases — Admin Functions

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| ADMIN-01 | Create coordinator | Fill form, submit | Coordinator account created with area | HIGH |
| ADMIN-02 | Suspend user | Click suspend on user | User status → SUSPENDED, cannot login | HIGH |
| ADMIN-03 | Change trust level | Set citizen to RESTRICTED | Citizen cannot submit complaints | HIGH |
| ADMIN-04 | View audit logs | Navigate to audit page | All actions visible, searchable | HIGH |
| ADMIN-05 | Resolve escalation | Add notes, click resolve | Escalation marked resolved | MEDIUM |
| ADMIN-06 | Admin tries self-modification | Try to suspend own account | Error: "Cannot modify own account" | HIGH |
| ADMIN-07 | Delete area with active complaints | Try to delete | Error: "Active complaints exist" | MEDIUM |

---

## 8. Test Cases — Security

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SEC-01 | SQL injection in search | Enter `'; DROP TABLE users; --` in search | Parameterized query prevents; normal error | HIGH |
| SEC-02 | XSS in comment | Enter `<script>alert('xss')</script>` | Rendered as text, not executed | HIGH |
| SEC-03 | Access API without token | Call authenticated endpoint without header | 401 Unauthorized | HIGH |
| SEC-04 | Use expired token | Wait for expiry, make request | 401 Unauthorized | HIGH |
| SEC-05 | Citizen calls admin API | Use citizen's token on /api/admin/* | 403 Forbidden | HIGH |
| SEC-06 | Upload .exe as .jpg | Rename executable to .jpg, attempt upload | Rejected (magic byte check) | HIGH |
| SEC-07 | Large file upload (20MB) | Attempt 20MB image | Rejected: max 5MB | MEDIUM |

---

## 9. Test Cases — Edge Cases

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| EDGE-01 | 0 complaints in system | New deployment | Empty states shown properly | MEDIUM |
| EDGE-02 | Complaint with 0 coordinators in area | Remove all coordinators | Auto-escalate to admin | HIGH |
| EDGE-03 | Simultaneous votes | Two coordinators vote at same time | Both saved, no race condition | MEDIUM |
| EDGE-04 | Browser back after logout | Logout, press back | Login page shown, not cached dashboard | MEDIUM |
| EDGE-05 | 1000+ notifications | Generate many notifications | Paginated, not all loaded | MEDIUM |
| EDGE-06 | Camera permission denied | Deny camera access | Clear error with instructions | HIGH |

---

## 10. Test Log Template

| Date | Test ID | Tester | Result | Notes |
|---|---|---|---|---|
| | | | PASS / FAIL / BLOCKED | |
