# CityWatch — Risk Assessment Document

**Version:** 1.0
**Date:** February 2026

---

## 1. Risk Matrix Definition

| Probability | Impact → | Low | Medium | High |
|---|---|---|---|---|
| **High** | 🟡 Medium | 🟠 High | 🔴 Critical |
| **Medium** | 🟢 Low | 🟡 Medium | 🟠 High |
| **Low** | 🟢 Low | 🟢 Low | 🟡 Medium |

---

## 2. Technical Risks

| ID | Risk | Prob. | Impact | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|
| T1 | PostgreSQL setup fails on dev machine | Medium | Medium | 🟡 | Use H2 in-memory DB initially; switch later | Backend |
| T2 | WebRTC camera doesn't work on test devices | Medium | High | 🟠 | Test on multiple devices in Week 3; have fallback error UI | Frontend |
| T3 | GPS accuracy too low for verification | Medium | High | 🟠 | Show accuracy warning; allow 200m threshold in testing; validate on real devices | Both |
| T4 | CORS configuration blocks frontend-backend | High | Low | 🟡 | Configure CORS in Week 2; document exact config; test early | Backend |
| T5 | Google Maps API key issues (expired, limits) | Low | Medium | 🟢 | Use free tier; set billing alerts; have fallback coordinates view | Frontend |
| T6 | Image upload handling fails (large files, wrong types) | Medium | Medium | 🟡 | Client-side compression; server-side validation; test with edge-case files | Both |
| T7 | Scheduled SLA job not running reliably | Medium | Medium | 🟡 | Add manual trigger for demo; test with short (5-min) SLAs; log job execution | Backend |
| T8 | JWT implementation has security holes | Medium | High | 🟠 | Follow established patterns; review Spring Security documentation; test token scenarios | Backend |
| T9 | Race conditions in voting (concurrent votes) | Low | High | 🟡 | Use database UNIQUE constraint + optimistic locking (@Version) | Backend |
| T10 | Data loss from no backups | Low | High | 🟡 | PostgreSQL pg_dump before each demo; seed script for data recreation | Backend |

---

## 3. Abuse & Integrity Risks

| ID | Risk | Prob. | Impact | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|
| A1 | Coordinator collusion (approve fake complaints) | Medium | High | 🟠 | Random 5% admin audit; vote correlation tracking; citizen rejection as safety net | Backend |
| A2 | Citizen spams fake complaints | Medium | Medium | 🟡 | Rate limit (5/day); duplicate detection; strike system; trust levels | Backend |
| A3 | GPS spoofing (fake complaint or proof location) | Medium | Medium | 🟡 | Cannot fully prevent; coordinator voting validates; citizen confirmation catches; area boundary check | Both |
| A4 | Fake photos (screenshot of old image) | Medium | Medium | 🟡 | WebRTC-only (no file upload); coordinator voting; citizen rejection | Frontend |
| A5 | Citizen harassment via rejection | Low | Medium | 🟢 | Max 3 reopens; mandatory rejection reason; admin review | Backend |
| A6 | Admin power abuse | Low | High | 🟡 | Append-only audit logs; restricted self-modification; no audit deletion | Backend |
| A7 | Comment system abuse (profanity, harassment) | Medium | Low | 🟡 | Profanity filter; admin moderation; rate limiting | Both |

---

## 4. Project Management Risks

| ID | Risk | Prob. | Impact | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|
| P1 | Scope creep (adding features mid-development) | High | High | 🔴 | Freeze features after Week 5; refer to PRD for scope; reject non-MVP requests | Both |
| P2 | Team member unavailable for a week | Medium | High | 🟠 | Cross-train basics of each other's stack in Week 1; maintain documentation | Both |
| P3 | Integration issues (frontend-backend mismatch) | Medium | Medium | 🟡 | Define API contract in Week 1; test integration at end of every week | Both |
| P4 | Demo environment differs from dev | Medium | Medium | 🟡 | Test on demo machine in Week 7; document all environment setup | Both |
| P5 | Timeline slippage (too ambitious) | High | Medium | 🟡 | Prioritize core MVP; cut nice-to-haves early; weekly progress review | Both |
| P6 | Merge conflicts (Git collaboration issues) | Medium | Low | 🟡 | Clear branch strategy; frequent pulls; small PRs; clear folder ownership | Both |

---

## 5. Legal & Ethical Risks

| ID | Risk | Prob. | Impact | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|
| L1 | Deploying without institutional approval | Low | High | 🟡 | Get written approval from college before any pilot; include disclaimer on platform | Both |
| L2 | Exposing personal data (GPS, photos, names) | Low | High | 🟡 | Mask user details in public views; strip EXIF from images; HTTPS in production | Both |
| L3 | Public ranking/shaming of officials | Low | High | 🟡 | No leaderboards; no public performance metrics; trust system is internal only | Both |
| L4 | Defamatory content in complaints/comments | Medium | Medium | 🟡 | Profanity filter; admin moderation; terms of use with liability disclaimer | Both |
| L5 | Data breach (unauthorized access to user data) | Low | High | 🟡 | JWT auth; RBAC; input validation; SQL injection prevention; HTTPS | Backend |

---

## 6. Security Vulnerability Risks

| ID | Risk | Prob. | Impact | Rating | Mitigation | Owner |
|---|---|---|---|---|---|---|
| S1 | SQL injection | Low | High | 🟡 | JPA parameterized queries only; never concatenate user input in SQL | Backend |
| S2 | Cross-site scripting (XSS) | Low | High | 🟡 | React auto-escaping; CSP headers; no dangerouslySetInnerHTML; server-side sanitization | Both |
| S3 | Brute force password attacks | Medium | Medium | 🟡 | Rate limiting (5 attempts/15min); account lockout | Backend |
| S4 | Token theft via XSS | Low | High | 🟡 | CSP headers; migrate to HttpOnly cookies in production; short token expiry | Both |
| S5 | Malware upload disguised as image | Low | High | 🟡 | Check magic bytes (JPEG/PNG); strip EXIF; never execute uploads | Backend |
| S6 | Privilege escalation | Low | High | 🟡 | Role from DB on every request; no client-side role trust; no role change API | Backend |

---

## 7. Risk Response Summary

| Response | Risks |
|---|---|
| **Accept** (low risk, acceptable) | T5, A5, P6 |
| **Mitigate** (reduce probability/impact) | All others — mitigations defined above |
| **Avoid** (change approach to eliminate) | L1, L3 (no pilot without approval, no public rankings) |
| **Transfer** (out of scope) | Full penetration testing, production DDOS protection |

---

## 8. Risk Monitoring Plan

| Frequency | Activity | Owner |
|---|---|---|
| Weekly | Review open risks, update status | Both |
| End of each week | Integration test (catch T3, P3 early) | Both |
| Week 3 | Device testing for camera/GPS (catch T2, T3) | Frontend |
| Week 5 | Security review checkpoint | Backend |
| Week 7 | Demo environment test | Both |
| Before pilot | Legal review, written approval | Both |
