# CityWatch — Security, Anti-Abuse & Integrity

This document covers every security mechanism, abuse prevention system, and integrity safeguard with edge cases and attack vectors analyzed.

---

## 1. Authentication

### JWT Token Strategy

| Setting | Value | Rationale |
|---|---|---|
| Algorithm | `HS256` or `RS256` | RS256 preferred for production (asymmetric) |
| Access token expiry | 24 hours | Balance between UX and security |
| Refresh token | Not implemented (mini project) | Add in Phase 2 |
| Token storage | `localStorage` | Acceptable for mini project. HttpOnly cookie preferred for production |
| Token payload | `{ userId, role, email, iat, exp }` | Minimal claims |

### Login Flow
```
Client                          Server
  │                               │
  ├── POST /api/auth/login ──────►│
  │   { email, password }         │
  │                               ├── Find user by email
  │                               ├── BCrypt.verify(password, hash)
  │                               ├── Check user.status != SUSPENDED
  │                               ├── Generate JWT
  │◄── 200 { token, user } ──────┤
  │                               │
  ├── GET /api/complaints ───────►│
  │   Authorization: Bearer xxx   │
  │                               ├── Validate JWT signature
  │                               ├── Check expiry
  │                               ├── Extract userId, role
  │                               ├── Check user.status != SUSPENDED
  │◄── 200 { data } ─────────────┤
```

### Attack Vectors & Mitigations

| # | Attack | Mitigation |
|---|---|---|
| AUTH1 | Brute force login | Rate limit: 5 failed attempts per email per 15 minutes. After 5 → lock account for 15 min |
| AUTH2 | Token theft (XSS) | CSP headers to prevent XSS. Escape all user input. In production: HttpOnly cookies |
| AUTH3 | Token replay | Short expiry (24h). Check user status on every request (suspension takes effect immediately) |
| AUTH4 | JWT forging | Server-side secret never exposed. Use strong secret (≥256 bits). Verify signature on every request |
| AUTH5 | Registration bombing | Rate limit: max 3 registrations per IP per hour. Email verification (stretch goal) |
| AUTH6 | Enumeration (does this email exist?) | Always return generic "Invalid credentials" for both wrong email and wrong password |
| AUTH7 | Password stored in plain text | BCrypt with cost factor 12. Never log passwords |
| AUTH8 | Weak passwords | Enforce: min 8 chars, 1 uppercase, 1 lowercase, 1 digit. Frontend + backend validation |
| AUTH9 | Session fixation | JWT is stateless. No server sessions. Token is regenerated on every login |
| AUTH10 | Forced to logout but token still valid | On suspension: token is technically still valid until expiry. **Mitigation:** Check user.status in DB on every authenticated request (not just JWT claims) |

---

## 2. Authorization (RBAC)

### Permission Matrix

| Action | CITIZEN | COORDINATOR | ADMIN |
|---|---|---|---|
| Register | ✅ (self) | ❌ (admin creates) | ❌ (seeded) |
| Submit complaint | ✅ | ❌ | ❌ |
| View complaints (own) | ✅ | ❌ | ✅ |
| View complaints (area) | ✅ (read-only) | ✅ (own area) | ✅ (all) |
| Edit complaint (DRAFT only) | ✅ (owner) | ❌ | ❌ |
| Delete complaint (DRAFT only) | ✅ (owner) | ❌ | ❌ |
| Vote | ❌ | ✅ (own area) | ❌ |
| View individual votes (before complete) | ❌ | ❌ (own vote only) | ❌ |
| View vote results (after complete) | ❌ | ✅ | ✅ |
| Update progress | ❌ | ✅ (assigned only) | ❌ |
| Submit proof | ❌ | ✅ (assigned only) | ❌ |
| Confirm/reject resolution | ✅ (owner) | ❌ | ❌ |
| Comment | ✅ | ✅ | ✅ |
| Moderate comments | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage areas | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| View escalations | ❌ | ❌ | ✅ |
| Resolve escalations | ❌ | ❌ | ✅ |
| Change SLA config | ❌ | ❌ | ✅ |
| Suspend users | ❌ | ❌ | ✅ |
| Change trust levels | ❌ | ❌ | ✅ |

### Authorization Implementation

```java
// Spring Security approach
@PreAuthorize("hasRole('CITIZEN')")
@PostMapping("/api/complaints")
public ResponseEntity<?> submitComplaint(...) { }

@PreAuthorize("hasRole('COORDINATOR')")
@PostMapping("/api/complaints/{id}/votes")
public ResponseEntity<?> castVote(...) { }

@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/api/admin/audit-logs")
public ResponseEntity<?> getAuditLogs(...) { }
```

### Authorization Attack Vectors

| # | Attack | Mitigation |
|---|---|---|
| AUTHZ1 | Citizen calls coordinator API | Role check in Spring Security. Return 403 |
| AUTHZ2 | Coordinator accesses complaint outside their area | Service layer checks `coordinator.areaId == complaint.areaId` |
| AUTHZ3 | Citizen edits another citizen's complaint | Service layer: `complaint.citizenId == currentUser.id` |
| AUTHZ4 | Coordinator submits proof for unassigned complaint | Service layer: `complaint.assignedCoordinatorId == currentUser.id` |
| AUTHZ5 | Admin promotes citizen to admin via API | No endpoint for role change. Only coordinator creation exists. Admin accounts are seeded or created by super-admin directly |
| AUTHZ6 | Privilege escalation via JWT tampering | Server validates JWT signature. Role is checked against DB, not just JWT claims for critical operations |
| AUTHZ7 | Admin modifies their own trust/status | Backend blocks self-modification on admin endpoints |

---

## 3. Input Validation

### Validation Rules by Field

| Field | Validation | Layer |
|---|---|---|
| `email` | Valid format, unique | Frontend + Backend |
| `password` | Min 8, 1 upper, 1 lower, 1 digit | Frontend + Backend |
| `username` | 3–50 chars, alphanumeric + underscore | Frontend + Backend |
| `description` | Min 50 chars, max 2000 chars | Frontend + Backend |
| `comment` | Min 5 chars, max 500 chars, profanity filter | Frontend + Backend |
| `category` | Must be in allowed enum | Backend (enum validation) |
| `latitude` | -90 to 90 | Backend |
| `longitude` | -180 to 180 | Backend |
| `image` | JPEG/PNG, max 5MB | Frontend + Backend |
| `decision` (vote) | Must be in enum | Backend |

### SQL Injection Prevention
- Use JPA/Hibernate parameterized queries exclusively
- Never concatenate user input into SQL
- Spring Data repositories are safe by default

### XSS Prevention
- React auto-escapes JSX content by default
- Never use `dangerouslySetInnerHTML`
- Sanitize all text stored in DB before rendering (comments, descriptions)
- Set CSP headers: `Content-Security-Policy: default-src 'self'`

### CSRF Prevention
- JWT in Authorization header (not cookies) → CSRF not applicable
- If using cookies in production → enable Spring CSRF protection

---

## 4. Rate Limiting

| Endpoint | Limit | Window | Per |
|---|---|---|---|
| `POST /api/auth/login` | 5 | 15 min | IP |
| `POST /api/auth/register` | 3 | 1 hour | IP |
| `POST /api/complaints` | 5 | 24 hours | User |
| `POST /api/complaints/{id}/comments` | 10 | 1 hour | User |
| All other endpoints | 100 | 1 minute | IP |

### Implementation
```java
// Use Spring Boot rate limiting (e.g., bucket4j or resilience4j)
// Or custom interceptor with in-memory counter (sufficient for mini project)
```

### Edge Cases
| # | Scenario | Solution |
|---|---|---|
| RL1 | User uses VPN to bypass IP rate limit | Per-user rate limiting for authenticated endpoints. IP limiting only for login/register |
| RL2 | Shared IP (college/office network) | Per-user limits are more important than IP limits for authenticated endpoints |
| RL3 | Rate limit counter lost on server restart | Acceptable for mini project. Use Redis for production |

---

## 5. Anti-Abuse Systems

### 5.1 Citizen Abuse Detection

| Behavior | Detection | Action |
|---|---|---|
| Multiple rejected complaints | `strike_count ≥ 3` | Trust → `UNDER_REVIEW` |
| Continued rejected complaints | `strike_count ≥ 5` | Trust → `RESTRICTED` (cannot submit) |
| Spam submissions (same location, same category) | Duplicate detection within 100m/7 days | Block with "Similar complaint exists" |
| Excessive complaints per day | Rate limit | Block after 5/day |
| Abusive comments | Profanity filter + admin moderation | Comment removed, warning issued |
| False rejection of valid proofs | Admin audit | Strike applied to citizen |

### 5.2 Coordinator Abuse Detection

| Behavior | Detection | Action |
|---|---|---|
| Always voting "VALID" (rubber-stamping) | Approval rate > 95% over 20+ votes | Admin notified. Manual review |
| Always voting "INVALID" (blocking) | Rejection rate > 80% over 20+ votes | Admin notified. Manual review |
| SLA violations | 3+ missed deadlines | Status → `WARNING` |
| Continued SLA violations after warning | 2+ more violations | Status → `SUSPENDED` |
| Fake proofs (citizen rejection) | 3+ citizen rejections | Status → `WARNING` |
| Vote collusion (always votes same as specific other coordinators) | Correlation analysis (stretch) | Admin notified |

### 5.3 System Integrity

| Mechanism | Purpose |
|---|---|
| Full audit logging | Every state change traceable |
| Append-only audit log | Cannot alter history |
| Status state machine | Cannot skip steps |
| Optimistic locking | Prevent race conditions |
| Transaction boundaries | All-or-nothing operations |

---

## 6. Audit Logging

### What Gets Logged

| Action | Entity | Details |
|---|---|---|
| `USER_REGISTERED` | User | New user data |
| `USER_LOGIN` | User | IP, success/fail |
| `USER_STATUS_CHANGED` | User | Old status → new status, by whom |
| `TRUST_LEVEL_CHANGED` | User | Old → new, by whom |
| `COMPLAINT_CREATED` | Complaint | Full complaint data |
| `COMPLAINT_STATUS_CHANGED` | Complaint | Old status → new status, triggered by |
| `COMPLAINT_EDITED` | Complaint | Changed fields |
| `COMPLAINT_DELETED` | Complaint | Full data (for recovery) |
| `VOTE_CAST` | Vote | Decision, coordinator ID |
| `PROOF_SUBMITTED` | Proof | GPS, distance, validation result |
| `COMMENT_CREATED` | Comment | Content, user |
| `COMMENT_MODERATED` | Comment | Moderator ID |
| `ESCALATION_TRIGGERED` | Escalation | Level, reason |
| `ESCALATION_RESOLVED` | Escalation | Resolver, notes |
| `AREA_CREATED` | Area | Full data |
| `SLA_CONFIG_UPDATED` | SLAConfig | Old → new hours |

### Security Considerations

> [!CAUTION]
> **Audit logs must NEVER be deletable or modifiable through the API.** The `audit_logs` table should have no `UPDATE` or `DELETE` endpoints. Even admin cannot alter logs. If needed for GDPR compliance, implement a separate, controlled process with its own audit trail.

---

## 7. CORS Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")  // Vite dev server
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

**Production:** Restrict to actual domain only.

---

## 8. Data Privacy

| Data | Handling |
|---|---|
| Passwords | BCrypt hashed, never stored or logged in plain text |
| Email | Visible only to user themselves and admin |
| Phone | Visible only to user themselves and admin |
| Complaint images | Stored server-side, accessible via protected URL |
| GPS coordinates | Stored for complaint and proof. Not exposed in public views beyond area-level |
| IP addresses | Logged for audit. Not exposed in UI |
| User's real name | Not collected (username only) |

### Data Retention (Stretch Goal)
- Notifications: auto-delete after 90 days
- Audit logs: retain for 1 year
- Closed complaints: retain indefinitely (for records)
- Suspended user data: retain for 6 months after suspension

---

## 9. Error Handling Security

| Scenario | Wrong Approach | Correct Approach |
|---|---|---|
| Invalid login | "Password is wrong" | "Invalid credentials" |
| User not found | "User does not exist" | "Invalid credentials" |
| 500 server error | Stack trace in response | Generic "Internal server error" + log stack trace on server |
| Unauthorized access | "You don't have ADMIN role" | "Forbidden" (don't reveal what roles exist) |
| SQL error | Full SQL in response | Generic "Request failed" + log SQL on server |

---

## 10. Security Checklist for Deployment

- [ ] Change default JWT secret from development to strong production secret
- [ ] Enable HTTPS (mandatory for WebRTC and GPS API)
- [ ] Set CORS to production domain only
- [ ] Disable Swagger/API docs in production
- [ ] Set secure cookie flags if using cookies
- [ ] Enable HSTS header
- [ ] Rate limiting active on all public endpoints
- [ ] Database user has minimal required permissions (no DROP, no direct table access)
- [ ] Environment variables for all secrets (DB password, JWT secret, API keys)
- [ ] Audit log table has no UPDATE/DELETE permissions
- [ ] Input validation on all endpoints (not just frontend)
- [ ] CSP headers configured
