# CityWatch — Detailed System Flows

> Every flow in the system — step by step, API by API, validation by validation.

---

## Flow 1: User Registration

### Trigger
Anonymous user clicks "Register" on the landing page.

### Frontend Steps
```
1. User fills form:
   - username (3-30 chars)
   - email (valid format)
   - password (≥8 chars, ≥1 uppercase, ≥1 number)
   - phone (optional, 10 digits)
   - city (dropdown, from allowed list)

2. Frontend validates in real-time:
   - Username: min 3 chars (show count)
   - Email: regex check (show red/green)
   - Password: strength meter (Weak/Medium/Strong)
   - All required fields filled

3. On submit → complaintService.register(data) → Axios POST
```

### API Call
```
POST /api/auth/register
Headers: none (public endpoint)
Body: {
  "username": "darshdeep",
  "email": "darsh@example.com",
  "password": "Secure@123",
  "phone": "9876543210",
  "city": "TestCity"
}
```

### Backend Processing
```
AuthController.register(RegisterRequest dto)
    │
    ▼
AuthService.register(dto):
    │
    ├── [V1] Validate email format → invalid? → 400 "Invalid email format"
    ├── [V2] Check email uniqueness → userRepo.findByEmail(email)
    │         exists? → 409 "Email already registered"
    ├── [V3] Check username uniqueness → userRepo.findByUsername(username)
    │         exists? → 409 "Username already taken"
    ├── [V4] Validate password strength
    │         < 8 chars? → 400 "Password must be at least 8 characters"
    │         no uppercase? → 400 "Password must contain uppercase letter"
    │         no number? → 400 "Password must contain a number"
    ├── [V5] Check rate limit → countRecentRegistrations(ip)
    │         > 3/hour? → 429 "Too many registrations. Try later."
    │
    ├── Hash password: BCrypt.hash(password, costFactor=12)
    │
    ├── Create User entity:
    │     role = CITIZEN (always — coordinators created by admin only)
    │     trustLevel = NORMAL
    │     status = ACTIVE
    │     createdAt = NOW()
    │
    ├── userRepo.save(user)
    │
    ├── Generate JWT:
    │     payload = { userId: 1, role: "CITIZEN", exp: NOW()+24h }
    │     token = JwtUtil.generate(payload, secret)
    │
    ├── auditService.log("USER_REGISTERED", user.id, ip)
    │
    └── Return AuthResponse { token, userId, username, role }
```

### Response
```
HTTP 201 Created
{
  "token": "eyJhbGciOiJI...",
  "userId": 1,
  "username": "darshdeep",
  "role": "CITIZEN"
}
```

### Frontend After Success
```
1. Store JWT in localStorage
2. Store user info in AuthContext
3. Redirect to /citizen/dashboard
```

### Error Scenarios
| Error | HTTP | Message | Frontend Action |
|---|---|---|---|
| Duplicate email | 409 | "Email already registered" | Show below email field |
| Duplicate username | 409 | "Username already taken" | Show below username field |
| Weak password | 400 | "Password must contain..." | Show below password field |
| Rate limited | 429 | "Too many registrations" | Show toast + disable button |
| Server error | 500 | "Something went wrong" | Show generic error toast |

---

## Flow 2: User Login

### API Call
```
POST /api/auth/login
Body: { "email": "darsh@example.com", "password": "Secure@123" }
```

### Backend Processing
```
AuthService.login(dto):
    │
    ├── [V1] userRepo.findByEmail(email)
    │         not found? → 401 "Invalid credentials"
    │         (SAME message as wrong password — prevents email enumeration)
    │
    ├── [V2] Check user.status
    │         SUSPENDED? → 401 "Account suspended. Contact administrator."
    │
    ├── [V3] BCrypt.verify(password, user.passwordHash)
    │         mismatch? → 401 "Invalid credentials"
    │
    ├── [V4] Check rate limit (5 attempts / 15 min / IP)
    │         exceeded? → 429 "Too many attempts. Try in 15 minutes."
    │
    ├── Generate JWT { userId, role, exp }
    ├── auditService.log("USER_LOGIN", user.id, ip)
    └── Return AuthResponse { token, userId, username, role }
```

### Frontend After Success
```
1. Store JWT in localStorage
2. Decode role from JWT payload
3. Redirect based on role:
   - CITIZEN → /citizen/dashboard
   - COORDINATOR → /coordinator/dashboard
   - ADMIN → /admin/dashboard
```

---

## Flow 3: Complaint Submission (Full Wizard)

### Trigger
Citizen clicks "Submit Complaint" on dashboard.

### Step 1: Category Selection (Frontend)
```
1. Display 5 category buttons: POTHOLE, GARBAGE, STREETLIGHT, DRAINAGE, OTHER
2. User clicks one → highlight selected → enable "Next"
3. Store: selectedCategory = "POTHOLE"
```

### Step 2: Description (Frontend)
```
1. Display textarea with character counter
2. Rules: min 50 chars, max 1000 chars
3. Live counter: "147 / 1000 characters"
4. "Next" enabled only when ≥ 50 chars
5. Store: description = "Large pothole near..."
```

### Step 3: Photo Capture (Frontend)
```
1. Request camera permission:
   navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })

2. Permission denied?
   → Show error: "Camera access required. Please enable in browser settings."
   → Show step-by-step instructions for Chrome/Firefox/Safari
   → "Next" button disabled

3. Permission granted:
   → Show live camera preview in <video> element
   → Show "Capture" button
   → User clicks "Capture"
   → canvas.drawImage(video, 0, 0)
   → canvas.toDataURL("image/jpeg", 0.8) → base64 string
   → Show captured photo preview
   → Show "Retake" and "Next" buttons

4. Store: imageBase64 = "data:image/jpeg;base64,/9j/4AAQ..."
```

### Step 4: GPS Location (Frontend)
```
1. Auto-request GPS:
   navigator.geolocation.getCurrentPosition(
     { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
   )

2. Permission denied?
   → Show error: "Location access required."
   → Show instructions for enabling
   → "Next" disabled

3. GPS acquired:
   → latitude = 28.6139, longitude = 77.2090, accuracy = 25m
   → Show map pin on Google Maps mini-map
   → Show accuracy indicator (green < 100m, yellow 100-500m, red > 500m)
   → Allow minor pin adjustment (drag within 50m)
   → "Next" enabled

4. Store: { latitude, longitude, gpsAccuracy }
```

### Step 5: Review & Submit (Frontend)
```
1. Display summary:
   - Category: POTHOLE
   - Description: "Large pothole near..." (truncated)
   - Photo: thumbnail preview
   - Location: map pin + "Zone A, TestCity"
   - GPS accuracy: 25m ✅

2. "Edit" links back to each step

3. "Submit" button → complaintService.create(data) → Axios POST
```

### API Call
```
POST /api/complaints
Headers: { Authorization: "Bearer eyJ..." }
Body: {
  "category": "POTHOLE",
  "description": "Large pothole near the main market entrance...",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "gpsAccuracy": 25.0
}
```

### Backend Processing
```
ComplaintService.create(dto, userId):
    │
    ├── [V1] userRepo.findById(userId)
    │         user.trustLevel == RESTRICTED?
    │         → 403 "Your account is under review. Cannot submit."
    │
    ├── [V2] Rate limit check:
    │         complaintRepo.countByUserIdAndCreatedAtAfter(userId, today_start)
    │         count ≥ 5? → 429 "Maximum 5 complaints per day."
    │
    ├── [V3] Validate description:
    │         length < 50? → 400 "Description must be at least 50 characters. You have X."
    │         length > 1000? → 400 "Description must be at most 1000 characters."
    │
    ├── [V4] Validate image:
    │         null/empty? → 400 "Photo is required."
    │         decode base64 → check magic bytes (FFD8FF for JPEG, 89504E47 for PNG)
    │         not JPEG/PNG? → 400 "Only JPEG and PNG images are allowed."
    │         size > 5MB? → 400 "Image must be less than 5 MB."
    │
    ├── [V5] Validate GPS:
    │         lat or lng null? → 400 "GPS location is required."
    │         lat < -90 or > 90? → 400 "Invalid latitude."
    │         lng < -180 or > 180? → 400 "Invalid longitude."
    │
    ├── [V6] Find area:
    │         areaRepo.findByCoordinates(lat, lng)
    │         → SQL: SELECT * FROM areas
    │                WHERE lat BETWEEN boundary_lat_min AND boundary_lat_max
    │                AND lng BETWEEN boundary_lng_min AND boundary_lng_max
    │         no area found? → 400 "Your location is not in our coverage area."
    │
    ├── [V7] Duplicate detection:
    │         complaintRepo.findSimilar(lat, lng, category, 7_days_ago)
    │         For each result: calculate Haversine distance
    │         Any within 100m AND same category AND last 7 days?
    │         → 409 "Similar complaint already exists" + link to existing complaint
    │
    ├── [V8] Save image:
    │         Strip EXIF metadata
    │         Compress to max 800x800px
    │         Save to ./uploads/complaints/{uuid}.jpg
    │         imagePath = "complaints/{uuid}.jpg"
    │
    ├── [V9] Create Complaint entity:
    │         citizen = user
    │         category = POTHOLE
    │         description = "Large pothole..."
    │         imagePath = "complaints/{uuid}.jpg"
    │         latitude = 28.6139
    │         longitude = 77.2090
    │         gpsAccuracy = 25.0
    │         status = PENDING_REVIEW
    │         priority = null (calculated after voting)
    │         intensityScore = null (calculated after voting)
    │         area = foundArea
    │         assignedCoordinator = null
    │         slaDeadline = null
    │         reopenCount = 0
    │         escalationLevel = 0
    │         createdAt = NOW()
    │
    ├── complaintRepo.save(complaint) → id = 42
    │
    ├── Notify coordinators in area:
    │         userRepo.findByRoleAndAreaAndStatus(COORDINATOR, areaId, ACTIVE)
    │         For each coordinator:
    │           notificationService.create(
    │             type = "NEW_COMPLAINT",
    │             userId = coordinator.id,
    │             message = "New POTHOLE complaint #42 in Zone A",
    │             complaintId = 42
    │           )
    │
    ├── auditService.log("COMPLAINT_CREATED", "COMPLAINT", 42, null, "PENDING_REVIEW", ip)
    │
    └── Return ComplaintResponse { id: 42, status: "PENDING_REVIEW", ... }
```

### Response
```
HTTP 201 Created
{
  "id": 42,
  "category": "POTHOLE",
  "description": "Large pothole near...",
  "imageUrl": "/api/images/complaints/abc123.jpg",
  "status": "PENDING_REVIEW",
  "areaName": "Zone A",
  "citizenName": "darshdeep",
  "createdAt": "2026-03-01T22:10:00"
}
```

### Frontend After Success
```
1. Show success message: "Complaint #42 submitted successfully!"
2. Redirect to /citizen/complaints/42 (complaint detail page)
3. Clear wizard state
```

---

## Flow 4: Coordinator Voting

### Trigger
Coordinator sees notification "New complaint #42" → clicks → opens complaint detail.

### Frontend Steps
```
1. Load complaint detail:
   GET /api/complaints/42
   Render: photo, description, category, map pin, status badge

2. Load vote status:
   GET /api/complaints/42/votes
   Response: { totalVotes: 2, requiredVotes: 5, myVote: null }

3. Show VotePanel:
   [VALID]  [INVALID]  [NEEDS CLARIFICATION]
   [ Comment (optional): __________________ ]

4. User clicks "VALID" + types comment → POST /api/votes
```

### API Call
```
POST /api/votes
Headers: { Authorization: "Bearer eyJ..." }   ← coordinator's token
Body: {
  "complaintId": 42,
  "decision": "VALID",
  "comment": "I've seen this pothole, it's real and dangerous"
}
```

### Backend Processing
```
VoteService.castVote(dto, coordinatorId):
    │
    ├── [V1] complaintRepo.findById(42)
    │         not found? → 404 "Complaint not found"
    │
    ├── [V2] complaint.status != PENDING_REVIEW?
    │         → 400 "Complaint is not open for voting"
    │
    ├── [V3] Check area match:
    │         userRepo.findById(coordinatorId) → coordinator
    │         coordinator.areaId != complaint.areaId?
    │         → 403 "You can only vote on complaints in your area"
    │
    ├── [V4] Check coordinator status:
    │         coordinator.status != ACTIVE?
    │         → 403 "Your account is not active"
    │
    ├── [V5] Check duplicate vote:
    │         voteRepo.findByComplaintIdAndCoordinatorId(42, coordinatorId)
    │         exists? → 409 "You have already voted on this complaint"
    │
    ├── Save vote:
    │         Vote { complaintId=42, coordinatorId, decision=VALID, comment, createdAt=NOW() }
    │         voteRepo.save(vote)
    │
    ├── Check majority: checkMajority(42)
    │
    │   ┌── Count votes:
    │   │   validCount = voteRepo.countByComplaintAndDecision(42, VALID)     = 3
    │   │   invalidCount = voteRepo.countByComplaintAndDecision(42, INVALID) = 1
    │   │   totalCount = voteRepo.countByComplaint(42)                        = 4
    │   │   eligibleCoordinators = userRepo.countActiveInArea(areaId)         = 5
    │   │
    │   ├── validCount / totalCount ≥ 0.60 (75% in this case)?
    │   │   YES → MAJORITY VALID
    │   │
    │   │   ┌── [A] complaint.status = APPROVED
    │   │   ├── [B] Calculate intensity:
    │   │   │       nearbyComplaints = complaintRepo.findWithin500m(lat, lng)
    │   │   │       weightedSum = Σ(trust_weight for each)
    │   │   │       intensity = log(1 + weightedSum)
    │   │   │       complaint.intensityScore = intensity
    │   │   │       complaint.priority = intensity < 1 ? LOW :
    │   │   │                            intensity < 2 ? MEDIUM :
    │   │   │                            intensity < 3 ? HIGH : CRITICAL
    │   │   ├── [C] Auto-assign coordinator:
    │   │   │       assignmentService.autoAssign(complaint)
    │   │   │       → Find active coordinators in area
    │   │   │       → Exclude any previously assigned
    │   │   │       → Sort by current active assignment count (ascending)
    │   │   │       → Pick first (least loaded)
    │   │   │       → complaint.assignedCoordinator = selected
    │   │   │       → complaint.status = ASSIGNED
    │   │   │       → No eligible coordinators? → escalate to admin
    │   │   ├── [D] Calculate SLA deadline:
    │   │   │       slaConfig = slaConfigRepo.findByCategory(POTHOLE)
    │   │   │       complaint.slaDeadline = NOW() + 168 hours (7 days)
    │   │   ├── [E] Notify citizen: "Your complaint #42 has been approved"
    │   │   ├── [F] Notify assigned coordinator: "Complaint #42 assigned to you"
    │   │   └── [G] auditService.log("COMPLAINT_APPROVED", ...)
    │   │
    │   ├── invalidCount / totalCount ≥ 0.60?
    │   │   YES → MAJORITY INVALID
    │   │   ┌── complaint.status = REJECTED
    │   │   ├── citizen.strikeCount++
    │   │   ├── if strikeCount ≥ 3 → citizen.trustLevel = UNDER_REVIEW
    │   │   ├── if strikeCount ≥ 5 → citizen.trustLevel = RESTRICTED
    │   │   ├── Notify citizen: "Your complaint #42 was rejected"
    │   │   └── auditService.log("COMPLAINT_REJECTED", ...)
    │   │
    │   ├── All eligible coordinators voted but no 60% majority?
    │   │   → TIE
    │   │   ┌── complaint.status = ADMIN_REVIEW
    │   │   ├── escalation = { complaintId=42, level=1, reason="Vote tie" }
    │   │   ├── Notify admin
    │   │   └── auditService.log("VOTE_TIE", ...)
    │   │
    │   └── Not all voted yet?
    │       → No action. Wait for more votes.
    │
    ├── auditService.log("VOTE_CAST", "VOTE", vote.id, null, "VALID", ip)
    │
    └── Return VoteResponse { voteId, decision, totalVotes, majorityReached }
```

---

## Flow 5: Coordinator Status Updates

### Flow 5a: ASSIGNED → IN_PROGRESS

```
Trigger: Coordinator clicks "Start Working" on assigned complaint

API: PUT /api/complaints/42/status
Body: { "status": "IN_PROGRESS" }

Backend:
    ├── [V1] complaint.assignedCoordinator.id == currentUserId?
    │         No → 403 "Not your assignment"
    ├── [V2] complaint.status == ASSIGNED?
    │         No → 400 "Can only start from ASSIGNED status"
    ├── complaint.status = IN_PROGRESS
    ├── Notify citizen: "Work started on complaint #42"
    ├── auditService.log("STATUS_IN_PROGRESS", ...)
    └── Return updated complaint
```

---

## Flow 6: Proof Submission with Geo-Verification

### Trigger
Coordinator goes to complaint location → opens "Submit Proof" page.

### Frontend Steps
```
1. Show original complaint photo (left side)
2. Open camera for proof photo (right side)
3. Auto-capture GPS coordinates
4. Calculate and display real-time distance:
   "You are 45m away from complaint location ✅"
   or "You are 320m away ❌ — must be within 100m"

5. On capture + submit:
   POST /api/proofs
```

### API Call
```
POST /api/proofs
Headers: { Authorization: "Bearer eyJ..." }
Body: {
  "complaintId": 42,
  "imageBase64": "data:image/jpeg;base64,...",
  "latitude": 28.6141,
  "longitude": 77.2092
}
```

### Backend Processing
```
ProofService.submit(dto, coordinatorId):
    │
    ├── [V1] complaintRepo.findById(42)
    │         not found? → 404
    │
    ├── [V2] complaint.assignedCoordinator.id == coordinatorId?
    │         No → 403 "This complaint is not assigned to you"
    │
    ├── [V3] complaint.status == IN_PROGRESS?
    │         No → 400 "Can only submit proof when status is IN_PROGRESS"
    │         (Also allow DELAYED status)
    │
    ├── [V4] Validate image (same as complaint: magic bytes, size)
    │
    ├── [V5] Calculate distance:
    │         distance = HaversineUtil.calculate(
    │           complaint.latitude, complaint.longitude,    ← original
    │           dto.latitude, dto.longitude                 ← proof location
    │         )
    │
    │         Haversine formula:
    │         a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
    │         c = 2 × atan2(√a, √(1-a))
    │         d = R × c    (R = 6371000 meters)
    │
    │         distance = 45.2 meters
    │
    ├── [V6] Distance > 100m?
    │         → 400 "You are 320m away from the complaint location.
    │                 You must be within 100m to submit proof."
    │
    ├── Save image: ./uploads/proofs/{uuid}.jpg
    │
    ├── Create Proof entity:
    │         { complaintId=42, coordinatorId, imagePath, lat, lng,
    │           distance=45.2, createdAt=NOW() }
    │         proofRepo.save(proof)
    │
    ├── Update complaint:
    │         complaint.status = COMPLETED
    │
    ├── Notify citizen:
    │         "Complaint #42 has been resolved. Please review and confirm."
    │
    ├── auditService.log("PROOF_SUBMITTED", "PROOF", proof.id, distance, ip)
    ├── auditService.log("STATUS_COMPLETED", "COMPLAINT", 42, "IN_PROGRESS", "COMPLETED")
    │
    └── Return ProofResponse { proofId, distance, status: "ACCEPTED" }
```

---

## Flow 7: Citizen Confirmation (Accept/Reject)

### Trigger
Citizen sees notification "Complaint #42 resolved" → opens complaint detail → sees proof photo.

### Flow 7a: ACCEPT
```
API: POST /api/complaints/42/confirm
Body: { "decision": "ACCEPT" }

Backend:
    ├── [V1] complaint.citizen.id == currentUserId?
    │         No → 403 "Not your complaint"
    ├── [V2] complaint.status == COMPLETED?
    │         No → 400 "Can only confirm completed complaints"
    ├── complaint.status = CLOSED
    ├── complaint.closedAt = NOW()
    ├── Notify coordinator: "Citizen accepted your resolution for #42"
    ├── auditService.log("COMPLAINT_CLOSED", ...)
    └── Return updated complaint
```

### Flow 7b: REJECT
```
API: POST /api/complaints/42/confirm
Body: { "decision": "REJECT", "reason": "The pothole is still there, only partially filled" }

Backend:
    ├── [V1] complaint.citizen.id == currentUserId?
    ├── [V2] complaint.status == COMPLETED?
    ├── [V3] reason.length ≥ 20?
    │         No → 400 "Rejection reason must be at least 20 characters"
    │
    ├── [V4] complaint.reopenCount ≥ 3?
    │         YES → complaint.status = ADMIN_REVIEW
    │               escalation = { level=complaint.escalationLevel+1,
    │                               reason="Max reopens reached" }
    │               Notify admin
    │               Return "Maximum reopens reached. Escalated to admin."
    │
    ├── complaint.status = REOPENED
    ├── complaint.reopenCount++ (now 1)
    ├── complaint.escalationLevel++
    │
    ├── Assign NEW coordinator:
    │         assignmentService.autoAssign(complaint, excludePrevious=[current])
    │         → complaint.status = ASSIGNED (auto-transition)
    │         → complaint.slaDeadline = recalculated
    │
    ├── Notify old coordinator: "Citizen rejected your resolution for #42"
    ├── Notify new coordinator: "Complaint #42 reassigned to you"
    ├── Notify citizen: "Complaint #42 reopened. New coordinator assigned."
    ├── auditService.log("COMPLAINT_REOPENED", ...)
    └── Return updated complaint
```

### Flow 7c: NO RESPONSE (Auto-Close)
```
AutoCloseScheduler runs daily:
    │
    ├── SELECT * FROM complaints
    │   WHERE status = 'COMPLETED'
    │   AND updated_at < NOW() - INTERVAL '7 days'
    │
    ├── For each:
    │   complaint.status = AUTO_CLOSED
    │   complaint.closedAt = NOW()
    │   Notify citizen: "Complaint #42 auto-closed (no response in 7 days)"
    │   auditService.log("AUTO_CLOSED", ...)
    │
    └── Log: "Auto-closed X complaints"
```

---

## Flow 8: SLA Monitoring & Escalation

### Trigger
Spring `@Scheduled` job runs every 60 minutes.

```
SlaScheduler.checkDeadlines():
    │
    ├── Query overdue complaints:
    │   SELECT * FROM complaints
    │   WHERE status IN ('ASSIGNED', 'IN_PROGRESS')
    │   AND sla_deadline < NOW()
    │   AND sla_deadline IS NOT NULL
    │
    ├── For each overdue complaint:
    │   │
    │   ├── overdue_hours = (NOW() - sla_deadline) in hours
    │   │
    │   ├── Determine new escalation level:
    │   │   0-24h overdue  → level 1 (Notification to admin)
    │   │   24-48h overdue → level 2 (High priority flag)
    │   │   48h+ overdue   → level 3 (Critical — requires admin action)
    │   │
    │   ├── If complaint.status != DELAYED:
    │   │   complaint.status = DELAYED
    │   │
    │   ├── If current escalation level > previous:
    │   │   Create/update escalation:
    │   │   { complaintId, level, reason="SLA exceeded by Xh", status=OPEN }
    │   │
    │   ├── Notify admin:
    │   │   "Complaint #42 is X hours overdue (Level Y escalation)"
    │   │
    │   ├── Notify assigned coordinator:
    │   │   "SLA deadline exceeded for complaint #42. Please resolve urgently."
    │   │
    │   └── auditService.log("SLA_VIOLATION", levelY, ...)
    │
    └── Log: "SLA check completed. X complaints escalated."
```

---

## Flow 9: Admin — Create Coordinator Account

### API Call
```
POST /api/admin/users/coordinator
Headers: { Authorization: "Bearer eyJ..." }   ← admin token
Body: {
  "username": "coord_zone_a",
  "email": "coord1@citywatch.local",
  "password": "Coord@123",
  "phone": "9876500001",
  "city": "TestCity",
  "areaId": 1
}
```

### Backend Processing
```
AdminService.createCoordinator(dto, adminId):
    │
    ├── [V1] Verify caller is ADMIN (via @PreAuthorize)
    ├── [V2] Validate email uniqueness
    ├── [V3] Validate username uniqueness
    ├── [V4] Validate areaId exists → areaRepo.findById(1)
    │         not found? → 404 "Area not found"
    │
    ├── Create User:
    │     role = COORDINATOR    ← key difference from registration
    │     areaId = 1            ← assigned to specific area
    │     trustLevel = NORMAL
    │     status = ACTIVE
    │     password = BCrypt.hash(dto.password)
    │
    ├── userRepo.save(coordinator)
    ├── auditService.log("COORDINATOR_CREATED", adminId, coordinator.id)
    └── Return UserResponse
```

---

## Flow 10: Admin — Suspend User

```
PUT /api/admin/users/5/status
Body: { "status": "SUSPENDED" }

AdminService.updateUserStatus(userId, newStatus, adminId):
    │
    ├── [V1] userId == adminId?
    │         → 400 "Cannot modify your own account"
    │
    ├── [V2] userRepo.findById(5)
    │         not found? → 404
    │
    ├── oldStatus = user.status (e.g., "ACTIVE")
    ├── user.status = SUSPENDED
    ├── userRepo.save(user)
    │
    ├── auditService.log("USER_STATUS_CHANGE", "USER", 5,
    │                     "ACTIVE", "SUSPENDED", adminId, ip)
    │
    └── Return UserResponse
    
    // When suspended user tries to login:
    // JwtAuthFilter loads user → checks status → SUSPENDED → 401
    // When suspended user's existing JWT is used:
    // JwtAuthFilter loads user → checks status → SUSPENDED → 401
```

---

## Flow 11: Admin — Change Trust Level

```
PUT /api/admin/users/3/trust
Body: { "trustLevel": "RESTRICTED" }

AdminService.updateTrustLevel(userId, newLevel, adminId):
    │
    ├── [V1] userId == adminId? → 400
    ├── [V2] user = userRepo.findById(3) → 404 if not found
    ├── [V3] user.role == CITIZEN? → 400 "Trust levels apply to citizens only"
    │
    ├── oldLevel = user.trustLevel (e.g., "NORMAL")
    ├── user.trustLevel = RESTRICTED
    ├── userRepo.save(user)
    │
    ├── Notify citizen: "Your account has been restricted. Contact admin."
    ├── auditService.log("TRUST_LEVEL_CHANGE", ...)
    │
    └── // Effect: RESTRICTED citizen cannot submit new complaints
        // ComplaintService.create() checks trust level at [V1]
```

---

## Flow 12: Admin — Resolve Escalation

```
PUT /api/admin/escalations/7/resolve
Body: { "adminNote": "Reassigned to new coordinator. Extended SLA." }

AdminService.resolveEscalation(escalationId, note, adminId):
    │
    ├── escalation = escalationRepo.findById(7) → 404 if not found
    ├── escalation.status = RESOLVED
    ├── escalation.adminNote = note
    ├── escalation.resolvedAt = NOW()
    ├── escalationRepo.save(escalation)
    │
    ├── // Admin may also take action on the complaint:
    │   // - Reassign coordinator
    │   // - Force-close complaint
    │   // - Change status to ADMIN_REVIEW
    │
    ├── auditService.log("ESCALATION_RESOLVED", ...)
    └── Return EscalationResponse
```

---

## Flow 13: Comment Posting

```
POST /api/comments
Body: {
  "complaintId": 42,
  "content": "I've seen this pothole too, it's getting worse",
  "parentId": null          ← null for top-level, comment_id for reply
}

CommentService.create(dto, userId):
    │
    ├── [V1] complaintRepo.findById(42) → 404 if not found
    ├── [V2] content.length < 5? → 400 "Comment too short"
    ├── [V3] Rate limit: commentRepo.countByUserLastHour(userId) ≥ 10?
    │         → 429 "Maximum 10 comments per hour"
    ├── [V4] Profanity check: ProfanityFilter.check(content)
    │         contains banned words? → 400 "Comment contains inappropriate language"
    ├── [V5] If parentId provided: commentRepo.findById(parentId)
    │         not found? → 404 "Parent comment not found"
    │
    ├── Create Comment { complaintId, userId, content, parentId, isDeleted=false }
    ├── commentRepo.save(comment)
    │
    ├── If reply: Notify parent comment author
    ├── auditService.log("COMMENT_CREATED", ...)
    └── Return CommentResponse
```

---

## Flow 14: Notification Read

```
PUT /api/notifications/15/read
Headers: { Authorization: "Bearer eyJ..." }

NotificationService.markRead(notificationId, userId):
    │
    ├── notification = notificationRepo.findById(15)
    ├── notification.userId != userId? → 403 "Not your notification"
    ├── notification.isRead = true
    ├── notificationRepo.save(notification)
    └── Return success

Bulk mark all as read:
PUT /api/notifications/read-all
    │
    ├── notificationRepo.markAllReadByUserId(userId)
    │   UPDATE notifications SET is_read = true WHERE user_id = :userId
    └── Return { updated: 12 }
```

---

## Flow 15: Map View Data

```
GET /api/map/markers?status=APPROVED,ASSIGNED,IN_PROGRESS,DELAYED
Headers: { Authorization: "Bearer eyJ..." }

MapService.getMarkers(filters):
    │
    ├── complaintRepo.findByStatusIn(filters)
    │
    ├── For each complaint, return:
    │   {
    │     id: 42,
    │     latitude: 28.6139,
    │     longitude: 77.2090,
    │     category: "POTHOLE",
    │     status: "IN_PROGRESS",
    │     priority: "HIGH",
    │     title: "Large pothole near..."  (truncated to 50 chars)
    │   }
    │
    └── Return List<MarkerResponse>
```

---

## Flow 16: Complete Complaint Lifecycle (End-to-End)

```
Day 1:  Citizen submits complaint #42 (POTHOLE, Zone A)
        → Status: PENDING_REVIEW
        → 5 coordinators in Zone A notified

Day 1:  Coordinator A votes VALID
Day 2:  Coordinator B votes VALID  
Day 2:  Coordinator C votes INVALID
Day 3:  Coordinator D votes VALID
        → 3/4 = 75% VALID → MAJORITY REACHED
        → Status: APPROVED → ASSIGNED (auto)
        → Coordinator E assigned (load-balanced)
        → SLA deadline: Day 3 + 168h = Day 10
        → Intensity: 2.3 (HIGH priority — 4 similar complaints nearby)

Day 4:  Coordinator E clicks "Start Working"
        → Status: IN_PROGRESS

Day 8:  Coordinator E goes to location (45m away)
        → Submits proof photo + GPS
        → Haversine distance = 45m ✅
        → Status: COMPLETED
        → Citizen notified

Day 9:  Citizen opens app, sees before/after photos
        → Clicks "REJECT": "The pothole is only partially filled"
        → Status: REOPENED → ASSIGNED (auto)
        → reopenCount = 1
        → Coordinator F assigned (E excluded)
        → New SLA: Day 9 + 168h = Day 16

Day 12: Coordinator F goes to location, submits proof
        → Distance = 30m ✅
        → Status: COMPLETED

Day 13: Citizen opens app
        → Clicks "ACCEPT"
        → Status: CLOSED
        → closedAt = Day 13

        TOTAL: 13 days from submission to closure
        1 rejection, 2 proof submissions, 5 status changes, 2 coordinators
```

---

## Master Status Flow Summary

```
Every status change in the system:

DRAFT → PENDING_REVIEW          Citizen submits
PENDING_REVIEW → APPROVED       ≥60% valid votes
PENDING_REVIEW → REJECTED       ≥60% invalid votes
PENDING_REVIEW → NEEDS_CLARIFY  Majority request clarification
PENDING_REVIEW → ADMIN_REVIEW   Vote tie or timeout (48h)
APPROVED → ASSIGNED             Auto-assign coordinator
ASSIGNED → IN_PROGRESS          Coordinator acknowledges
IN_PROGRESS → COMPLETED         Geo-verified proof submitted
IN_PROGRESS → DELAYED           SLA deadline exceeded
DELAYED → COMPLETED             Late proof submission
COMPLETED → CLOSED              Citizen accepts
COMPLETED → REOPENED            Citizen rejects
COMPLETED → AUTO_CLOSED         7 days no response
REOPENED → ASSIGNED             Reassign new coordinator
ADMIN_REVIEW → APPROVED         Admin decides valid
ADMIN_REVIEW → REJECTED         Admin decides invalid
ADMIN_REVIEW → CLOSED           Admin force-closes
```
