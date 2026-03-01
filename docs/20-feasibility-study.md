# CityWatch — Feasibility Study

---

## 1. Introduction

This chapter evaluates the feasibility of CityWatch across four dimensions: technical, economic, operational, and schedule. The analysis determines whether the project can be realistically developed, deployed, and maintained within the given constraints.

---

## 2. Technical Feasibility

### Question: Can we build this with available technology?

**Verdict: ✅ FEASIBLE**

| Component | Technology | Availability | Risk |
|---|---|---|---|
| Frontend SPA | React.js 18 | Open-source, mature, widely documented | Low |
| Backend API | Spring Boot 3.x (Java 17) | Open-source, enterprise-grade, well-documented | Low |
| Database | PostgreSQL 15 | Open-source, free, industry standard | Low |
| Authentication | JWT + BCrypt | Well-established patterns, library support | Low |
| Camera capture | WebRTC (getUserMedia API) | Supported in all modern browsers | Medium |
| GPS capture | Geolocation API | Supported in all modern browsers (HTTPS required) | Medium |
| Map display | Google Maps JavaScript API | Free tier available (28,000 loads/month) | Low |
| Distance calculation | Haversine formula | Pure math, no external dependency | Low |
| Scheduled tasks | Spring @Scheduled | Built into Spring framework | Low |
| Geo queries | SQL bounding box + Java Haversine | Sufficient for mini project scale | Low |

### Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WebRTC not working on all devices | Test early (Week 3); error fallback UI |
| GPS accuracy issues indoors | Show accuracy indicator; allow outdoor testing |
| HTTPS required for camera/GPS in production | localhost works for dev; free SSL for production (Let's Encrypt) |
| PostgreSQL setup complexity | Can use H2 in-memory DB initially |

### Conclusion
All required technologies are open-source, free, and well-documented. The team can learn the necessary skills within the 8-week timeline. No proprietary or exotic technology is needed.

---

## 3. Economic Feasibility

### Question: Can we build this within budget?

**Verdict: ✅ FEASIBLE (Zero Cost for Mini Project)**

| Resource | Cost | Notes |
|---|---|---|
| React.js | Free | Open-source (MIT license) |
| Spring Boot | Free | Open-source (Apache 2.0) |
| PostgreSQL | Free | Open-source |
| JDK 17 | Free | OpenJDK |
| Node.js | Free | Open-source |
| VS Code / IntelliJ CE | Free | Free community editions |
| Git + GitHub | Free | Free for public/private repos |
| Google Maps API | Free | Free tier: 28,000 loads/month, $200 monthly credit |
| Localhost hosting (dev) | Free | Runs on personal machines |
| Postman | Free | Free tier sufficient |

### Future Costs (Pilot Deployment)

| Resource | Estimated Cost | Notes |
|---|---|---|
| Cloud hosting (Render/Railway) | Free tier or ~₹500/month | Free tier available for small scale |
| PostgreSQL hosting (Neon/Supabase) | Free tier | Free for small databases |
| Domain name | ~₹800/year | Optional for pilot |
| SSL certificate | Free | Let's Encrypt |
| Google Maps (if exceeding free tier) | Pay-as-you-go | Very unlikely at pilot scale |

### Conclusion
The mini project phase has **zero financial cost**. Even pilot deployment can be done within ₹1,000/month using free tiers. No special hardware, no paid software licenses, no cloud infrastructure purchases are needed.

---

## 4. Operational Feasibility

### Question: Will users actually use this? Is it practical?

**Verdict: ✅ FEASIBLE with conditions**

### User Readiness

| User | Readiness | Concern | Mitigation |
|---|---|---|---|
| Citizens | High | Basic smartphone/computer literacy needed | Simple wizard-based UI; minimal steps |
| Coordinators | Medium | Must be trained offline; must be willing | Offline hiring + training session; clear role definition |
| Admins | High | Technical team members | Full documentation provided |

### Operational Requirements

| Requirement | Status |
|---|---|
| Internet connectivity for all users | Required; assumed in urban areas |
| Devices with camera + GPS | Required; most smartphones qualify |
| Modern browser (Chrome/Firefox/Edge) | Required; high availability |
| Coordinator recruitment | Offline process; needs organizational effort |
| Admin technical capability | Development team serves as admin |

### Operational Risks

| Risk | Mitigation |
|---|---|
| Citizens may not trust an unofficial platform | Position as college research project; include disclaimer |
| Coordinators may not be available in all areas | Start with 3-4 areas where coordinators are available |
| Complaints may not get resolved (no government authority) | Coordinator facilitates offline; platform tracks; user expectations managed |
| Low adoption rate | Start with controlled pilot; gather feedback; iterate |

### Conclusion
The system is operationally feasible for a controlled pilot. The key dependency is coordinator recruitment, which is an offline organizational task. The UI is designed to require minimal technical skill from citizens.

---

## 5. Schedule Feasibility

### Question: Can we build this in 8 weeks with 2 people?

**Verdict: ✅ FEASIBLE with scope discipline**

### Team Capacity

| Member | Focus | Hours/Day | Hours/Week | Total Hours |
|---|---|---|---|---|
| Solo Developer | Frontend + Backend + DB | 3–4 hours | ~21–28 hours | ~175 hours |
| **Total** | | | | **~175 hours** |

### Scope-to-Time Mapping

| Week | Deliverable | Complexity |
|---|---|---|
| 1 | Setup + Architecture | Low |
| 2 | Authentication | Medium |
| 3 | Complaint Module | High |
| 4 | Voting + Status | High |
| 5 | SLA + Assignment | Medium |
| 6 | Proof + Confirmation | High |
| 7 | Admin + Anti-Abuse | Medium |
| 8 | Testing + Polish | Low |

### Schedule Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Feature creep | Timeline blown | Freeze scope after Week 5 (defined in PRD) |
| Learning curve (Spring Boot) | Week 1-2 delay | Start with tutorials in Week 0 (before formal start) |
| Integration issues | Mid-project delays | Test integration weekly, not just at end |
| Developer unavailable (illness, exams) | 100% capacity loss | Buffer days in Week 8; cut P3 features first |

### Conclusion
The schedule is tight but feasible if scope is strictly maintained. The 8-week plan prioritizes core features (Weeks 1–6) and reserves Weeks 7–8 for polish and testing. Any feature not in the MVP scope must be rejected.

---

## 6. Overall Feasibility Summary

| Dimension | Verdict | Confidence |
|---|---|---|
| Technical | ✅ Feasible | High — all tech is proven and free |
| Economic | ✅ Feasible | High — zero cost for mini project |
| Operational | ✅ Feasible | Medium — depends on coordinator recruitment |
| Schedule | ✅ Feasible | Medium — requires strict scope discipline |

**Overall: The project is feasible for development as a college mini project.**
