# CityWatch — SDLC Model & Lifecycle

---

## 1. Which Model? — Incremental Model

### The Short Answer

**Incremental Model** — a hybrid that takes the best from both Waterfall and Agile.

- Requirements are **fixed upfront** (like Waterfall — your PRD/SRS are locked)
- Implementation is delivered in **weekly increments** (like Agile — working software every week)
- Each increment adds a complete feature vertical (backend + frontend + integration)

---

### Why NOT Pure Waterfall?

| Waterfall Property | Problem for CityWatch |
|---|---|
| All requirements → All design → All coding → All testing | You'd be coding for 5 weeks with nothing to demo or test |
| Testing only at the end | Bugs found at Week 7 could blow the timeline |
| No working software until final phase | You can't show progress to guide, can't get feedback |
| Rigid — no backtracking | If camera API doesn't work as expected in Week 5, you can't go back without disrupting everything |

**Waterfall works when:** Requirements are 100% frozen, technology is proven, team is very experienced. Your project has proven tech, but risk of integration surprises (WebRTC, GPS) makes pure Waterfall dangerous.

### Why NOT Pure Agile/Scrum?

| Agile Property | Problem for CityWatch |
|---|---|
| Evolving requirements (user stories change each sprint) | Your requirements are fixed (college project, PRD is locked) |
| Product Owner gives feedback each sprint | No real product owner — you're building to a spec |
| Daily standups | Solo developer — standup with yourself? |
| Sprint reviews with stakeholders | No stakeholders until final demo |
| Flexible scope | Scope is fixed by college submission requirements |

**Agile works when:** Requirements evolve, there's a real customer giving feedback, team is 3+. You have none of these.

### Why Incremental is Perfect

| Incremental Property | Fit for CityWatch |
|---|---|
| Requirements fixed upfront | ✅ PRD/SRS locked before coding |
| Build in planned increments | ✅ Each week = one complete feature |
| Each increment is tested and working | ✅ Demo-able progress every week |
| Earlier increments are stable foundation | ✅ Auth (Week 1) supports all later features |
| Risk reduced — integration tested weekly | ✅ Camera/GPS issues found in Week 2, not Week 7 |
| Solo-friendly — no ceremonies | ✅ No standups, no sprint reviews needed |

---

## 2. CityWatch Increments

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Increment 1 (Week 1): Authentication                             │
│  ├── Backend: User entity, JWT, Spring Security                   │
│  ├── Frontend: Login, Register, routing, auth hook                │
│  └── DEMO: User can register and login                            │
│                                                                    │
│  Increment 2 (Week 2): Complaint Submission                       │
│  ├── Backend: Complaint entity, validation chain, image upload    │
│  ├── Frontend: 5-step wizard, WebRTC camera, GPS capture          │
│  └── DEMO: Citizen submits complaint with photo+GPS               │
│                                                                    │
│  Increment 3 (Week 3): Voting System                              │
│  ├── Backend: Vote entity, majority logic, escalation             │
│  ├── Frontend: Coordinator dashboard, vote panel                  │
│  └── DEMO: Coordinators validate complaints                       │
│                                                                    │
│  Increment 4 (Week 4): Assignment + SLA                           │
│  ├── Backend: Auto-assign, SLA scheduler, notifications           │
│  ├── Frontend: Assigned list, SLA timer, notification panel       │
│  └── DEMO: SLA tracking and auto-escalation                       │
│                                                                    │
│  Increment 5 (Week 5): Proof + Confirmation                       │
│  ├── Backend: Proof entity, Haversine, citizen confirm/reject     │
│  ├── Frontend: Proof page, confirmation view, comments            │
│  └── DEMO: Complete complaint lifecycle start-to-finish           │
│                                                                    │
│  Increment 6 (Week 6): Admin + Security                           │
│  ├── Backend: Audit log, admin APIs, trust system, rate limiting  │
│  ├── Frontend: Admin dashboard, user mgmt, escalations            │
│  └── DEMO: Admin panel + security features                        │
│                                                                    │
│  Increment 7 (Week 7): Maps + Polish + Testing                    │
│  ├── Maps integration, landing page, bug fixes                    │
│  ├── Cross-browser, mobile, security testing                      │
│  └── DEMO: Full polished platform                                 │
│                                                                    │
│  Increment 8 (Week 8): Demo + Documentation                       │
│  ├── Seed data, presentation, dry-run, backup                     │
│  └── FINAL: Production-ready demo                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Full SDLC — CityWatch Lifecycle

### Phase 1: Planning & Requirements (Before Week 1)

**Duration:** 1–2 weeks (pre-development)

**Activities:**
| Activity | Deliverable | Status |
|---|---|---|
| Define the problem statement | `docs/18-abstract-synopsis.md` | ✅ Done |
| Identify users and actors | `docs/09-PRD.md` §Actors | ✅ Done |
| Define core features and MVP scope | `docs/09-PRD.md` §Features | ✅ Done |
| Define out-of-scope items | `docs/09-PRD.md` §Out of Scope | ✅ Done |
| Conduct literature survey | `docs/19-literature-survey.md` | ✅ Done |
| Conduct feasibility study | `docs/20-feasibility-study.md` | ✅ Done |
| Create survey questionnaire | `docs/23-survey-questionnaire.md` | ✅ Done |
| Write product requirements (PRD) | `docs/09-PRD.md` | ✅ Done |

**Exit Criteria:** PRD approved. Scope frozen. No feature additions after this point.

---

### Phase 2: Analysis & Specification (Before Week 1)

**Duration:** 1 week (overlaps with planning)

**Activities:**
| Activity | Deliverable | Status |
|---|---|---|
| Write functional requirements | `docs/10-SRS.md` §4 | ✅ Done |
| Write non-functional requirements | `docs/10-SRS.md` §5 | ✅ Done |
| Define use cases for all actors | `docs/11-use-cases.md` | ✅ Done |
| Define user flows | `docs/13-user-flows.md` | ✅ Done |
| Identify risks and mitigations | `docs/14-risk-assessment.md` | ✅ Done |
| Identify loopholes and edge cases | `docs/08-loopholes-registry.md` | ✅ Done |

**Exit Criteria:** SRS complete. Every feature has a requirement ID. Every actor has use cases.

---

### Phase 3: System Design (Before Week 1)

**Duration:** 1 week (overlaps with analysis)

**Activities:**
| Activity | Deliverable | Status |
|---|---|---|
| Design system architecture | `docs/00-overview.md` | ✅ Done |
| Design database schema (ER diagram, SQL) | `docs/01-database-schema.md` | ✅ Done |
| Design REST API contracts | `docs/02-backend-api.md` | ✅ Done |
| Design frontend components & pages | `docs/03-frontend-components.md` | ✅ Done |
| Create UML diagrams (DFD, sequence, class, state, activity) | `docs/21-uml-diagrams.md` | ✅ Done |
| Design workflows and business logic | `docs/04-workflows-and-logic.md` | ✅ Done |
| Design security architecture | `docs/05-security-and-antiabuse.md` | ✅ Done |
| Create wireframes | `docs/12-wireframes.md` | ✅ Done |
| Justify technology choices | `docs/22-tech-justification.md` | ✅ Done |

**Exit Criteria:** Architecture, schema, API contracts, and UML diagrams approved. Ready to code.

---

### Phase 4: Implementation (Weeks 1–6)

**Duration:** 6 weeks (incremental delivery)

**Activities:**
| Week | Increment | Cumulative Demo |
|---|---|---|
| Week 1 | Authentication (backend + frontend) | "User can register and login" |
| Week 2 | Complaint Submission | + "Citizen can submit complaints" |
| Week 3 | Voting System | + "Coordinators can validate" |
| Week 4 | Assignment + SLA | + "SLA tracking works" |
| Week 5 | Proof + Confirmation | + "Full complaint lifecycle" |
| Week 6 | Admin Panel + Security | + "Admin can manage everything" |

**Methodology within each increment:**
```
1. Create entities/models        (1 day)
2. Build service layer           (1 day)
3. Build controller/API          (1 day)
4. Test backend with Postman     (included)
5. Build frontend components     (1-2 days)
6. Connect frontend to backend   (1 day)
7. Test end-to-end               (included)
8. Update diary, commit          (daily)
```

**Exit Criteria:** All P1 functional requirements implemented and tested. Full complaint lifecycle working.

---

### Phase 5: Testing (Week 7)

**Duration:** 1 week (dedicated)

**Activities:**
| Activity | Reference |
|---|---|
| Execute all 60+ test cases | `docs/15-test-plan.md` |
| Full citizen flow E2E test | Test cases COMP-01 through COMP-12 |
| Full coordinator flow E2E test | Test cases VOTE-01 through VOTE-09 |
| Full admin flow E2E test | Test cases ADMIN-01 through ADMIN-07 |
| Security testing (SQLi, XSS, auth bypass) | Test cases SEC-01 through SEC-07 |
| Edge case testing (GPS, camera, concurrent) | Test cases EDGE-01 through EDGE-06 |
| Cross-browser testing (Chrome, Firefox, Edge) | Manual verification |
| Mobile device testing (camera + GPS) | Real device test |
| Bug fixing | Immediate fixes |
| Log test results | Test log in diary |

**Exit Criteria:** All HIGH priority test cases pass. No critical bugs. Security tests pass.

---

### Phase 6: Deployment (Week 8)

**Duration:** 1 week

**Activities:**
| Activity | Reference |
|---|---|
| Create seed data | `docs/16-deployment-plan.md` §4 |
| Set up demo environment | `docs/16-deployment-plan.md` §5 |
| Create database backup | `pg_dump` command |
| Test on non-dev machine | Fresh machine verification |
| Prepare presentation slides | PowerPoint/Google Slides |
| Dry-run demo | Practice walkthrough |
| Final documentation review | All docs/ checked |

**Exit Criteria:** Demo runs successfully. Database backup exists. Presentation ready.

---

### Phase 7: Maintenance (Post-Submission)

**Duration:** Ongoing (if piloted)

**Activities:**
- Monitor for bugs reported during/after demo
- Address examiner feedback
- Plan future enhancements (mobile PWA, analytics, etc.)

---

## 4. SDLC Summary Diagram

```
    ┌──────────────────┐
    │  1. PLANNING &   │  PRD, Literature Survey,
    │   REQUIREMENTS   │  Feasibility Study, Surveys
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  2. ANALYSIS &   │  SRS (IEEE 830), Use Cases,
    │   SPECIFICATION  │  User Flows, Risk Assessment
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  3. SYSTEM       │  Architecture, DB Schema, API,
    │     DESIGN       │  UML Diagrams, Wireframes
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  4. INCREMENTAL  │  Week 1: Auth
    │  IMPLEMENTATION  │  Week 2: Complaints
    │  (6 iterations)  │  Week 3: Voting
    │                  │  Week 4: SLA
    │                  │  Week 5: Proof
    │                  │  Week 6: Admin
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  5. TESTING      │  60+ test cases, Security,
    │                  │  Cross-browser, Mobile
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  6. DEPLOYMENT   │  Demo prep, Seed data,
    │                  │  Presentation, Backup
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  7. MAINTENANCE  │  Bug fixes, Feedback,
    │  (post-project)  │  Future enhancements
    └──────────────────┘
```

---

## 5. Why This Is Better Than Pure Waterfall or Agile

| Criteria | Waterfall | Agile | Incremental (Ours) |
|---|---|---|---|
| Requirements fixed? | ✅ Yes | ❌ Evolving | ✅ Yes (PRD locked) |
| Working software early? | ❌ Only at end | ✅ Every sprint | ✅ Every week |
| Testing integrated? | ❌ Only at end | ✅ Continuous | ✅ Per increment + dedicated Week 7 |
| Solo-developer friendly? | ✅ No ceremonies | ❌ Needs team | ✅ No ceremonies |
| Risk managed? | ❌ Late discovery | ✅ Early discovery | ✅ Weekly integration catches issues |
| Documentation? | ✅ Heavy upfront | ❌ Minimal | ✅ Upfront + maintained |
| College project fit? | ⚠️ Rigid | ⚠️ Informal | ✅ Structured yet flexible |

**Verdict:** Incremental Model gives you Waterfall's planning rigor + Agile's early delivery — perfectly suited for a documented solo college project.
