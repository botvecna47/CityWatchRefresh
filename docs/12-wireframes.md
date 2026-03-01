# CityWatch — Wireframes (Text-Based Layouts)

> Wireframes are low-detail blueprints showing **structure and layout** — not colors, fonts, or final styling. Each wireframe shows what elements appear on the screen and where.

---

## WF-01: Landing Page (Public)

```
┌──────────────────────────────────────────────────────┐
│  [Logo] CityWatch              [Login] [Register]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│              ┌──────────────────────┐                │
│              │     HERO SECTION     │                │
│              │                      │                │
│              │  "Report. Track.     │                │
│              │       Resolve."      │                │
│              │                      │                │
│              │  [Get Started]       │                │
│              └──────────────────────┘                │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │  STEP 1    │ │  STEP 2    │ │  STEP 3    │       │
│  │ 📷 Report  │ │ ✓ Validate │ │ ✅ Resolve  │       │
│  │ Submit     │ │ Coordinators│ │ Geo-verified│       │
│  │ complaint  │ │ vote       │ │ proof      │       │
│  └────────────┘ └────────────┘ └────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │  STATS: [X] Resolved  [Y] Avg Time      │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ──────── Footer: About | Privacy | Terms ────────  │
└──────────────────────────────────────────────────────┘
```

---

## WF-02: Login Page

```
┌──────────────────────────────────────────────────────┐
│  [Logo] CityWatch                       [Register]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│              ┌──────────────────────┐                │
│              │      LOGIN           │                │
│              │                      │                │
│              │  Email               │                │
│              │  ┌──────────────┐    │                │
│              │  │              │    │                │
│              │  └──────────────┘    │                │
│              │                      │                │
│              │  Password       👁   │                │
│              │  ┌──────────────┐    │                │
│              │  │              │    │                │
│              │  └──────────────┘    │                │
│              │                      │                │
│              │  [   LOGIN    ]      │                │
│              │                      │                │
│              │  Don't have account? │                │
│              │  Register here       │                │
│              └──────────────────────┘                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## WF-03: Register Page

```
┌──────────────────────────────────────────────────────┐
│  [Logo] CityWatch                          [Login]   │
├──────────────────────────────────────────────────────┤
│              ┌──────────────────────┐                │
│              │    CREATE ACCOUNT    │                │
│              │                      │                │
│              │  Username            │                │
│              │  ┌──────────────┐    │                │
│              │  └──────────────┘    │                │
│              │  Email               │                │
│              │  ┌──────────────┐    │                │
│              │  └──────────────┘    │                │
│              │  Password            │                │
│              │  ┌──────────────┐    │                │
│              │  └──────────────┘    │                │
│              │  ████░░░░ Weak       │                │
│              │  Confirm Password    │                │
│              │  ┌──────────────┐    │                │
│              │  └──────────────┘    │                │
│              │  Phone (optional)    │                │
│              │  ┌──────────────┐    │                │
│              │  └──────────────┘    │                │
│              │  City                │                │
│              │  ┌──────────────▼┐   │                │
│              │  └──────────────┘    │                │
│              │                      │                │
│              │  [  REGISTER  ]      │                │
│              └──────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## WF-04: Citizen Dashboard

```
┌──────────────────────────────────────────────────────┐
│  [Logo] CityWatch   [Home][Complaints][Map]  🔔 [👤]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Welcome back, [username]!                           │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │ Total    │ │ Pending  │ │ Active   │ │ Resolved││
│  │   12     │ │    3     │ │    5     │ │    4    ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  [🔴 Report New Issue]                       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Recent Complaints                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ 🕳️ Pothole near Main St  [APPROVED] [HIGH]   │   │
│  │ 2 hours ago                                  │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 🗑️ Garbage dump Zone B    [IN_PROGRESS] [MED]│   │
│  │ 1 day ago                                    │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 💡 Streetlight broken     [COMPLETED]  [LOW] │   │
│  │ 3 days ago         [Accept ✓] [Reject ✗]    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## WF-05: Submit Complaint (Step Wizard)

```
Step 1 of 5: Category
┌──────────────────────────────────────────────────────┐
│  [Logo]  Submit Complaint                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ● ━━━━━ ○ ━━━━━ ○ ━━━━━ ○ ━━━━━ ○                 │
│  Category  Describe  Photo  Location  Review         │
│                                                      │
│  Select Issue Category:                              │
│                                                      │
│  ┌───────────────┐  ┌───────────────┐                │
│  │ 🕳️ Pothole     │  │ 🗑️ Garbage    │                │
│  └───────────────┘  └───────────────┘                │
│  ┌───────────────┐  ┌───────────────┐                │
│  │ 💡 Streetlight │  │ 🌊 Drainage   │                │
│  └───────────────┘  └───────────────┘                │
│  ┌───────────────┐                                   │
│  │ ❓ Other       │                                   │
│  └───────────────┘                                   │
│                                                      │
│                              [Next →]                │
└──────────────────────────────────────────────────────┘

Step 3 of 5: Photo Capture
┌──────────────────────────────────────────────────────┐
│  ● ━━━━━ ● ━━━━━ ● ━━━━━ ○ ━━━━━ ○                 │
│  Category  Describe  Photo  Location  Review         │
│                                                      │
│  Capture a photo of the issue:                       │
│                                                      │
│  ┌──────────────────────────────────┐                │
│  │                                  │                │
│  │        📷 CAMERA PREVIEW         │                │
│  │                                  │                │
│  │     (Live camera feed here)      │                │
│  │                                  │                │
│  └──────────────────────────────────┘                │
│                                                      │
│         [ 📸 Capture Photo ]                         │
│                                                      │
│  ⚠️ Photo must be taken live. File upload            │
│     is not supported.                                │
│                                                      │
│               [← Back]  [Next →]                     │
└──────────────────────────────────────────────────────┘

Step 5 of 5: Review
┌──────────────────────────────────────────────────────┐
│  ● ━━━━━ ● ━━━━━ ● ━━━━━ ● ━━━━━ ●                 │
│  Category  Describe  Photo  Location  Review         │
│                                                      │
│  Review your complaint:                              │
│                                                      │
│  Category:  🕳️ Pothole                               │
│  Description: "Large pothole on Main Street          │
│               near the junction. Very dangerous..."  │
│  Photo:     [thumbnail image]                        │
│  Location:  28.6139° N, 77.2090° E (Zone A)        │
│             [mini map with pin]                      │
│                                                      │
│         [← Back]  [ ✅ Submit Complaint ]            │
└──────────────────────────────────────────────────────┘
```

---

## WF-06: Complaint Detail Page

```
┌──────────────────────────────────────────────────────┐
│  [← Back to list]         Complaint #42              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🕳️ Pothole    [IN PROGRESS]  [HIGH]  SLA: 2d 5h    │
│  Zone A  •  Feb 20, 2026                             │
│                                                      │
│  ○───────●───────●───────○───────○───────○           │
│  Submitted Approved Assigned InProgress Completed    │
│                                                      │
│  ┌─────────────────────┐ Description:                │
│  │                     │ Large pothole on Main Street │
│  │   [Complaint Photo] │ near the junction. Very      │
│  │                     │ dangerous for two-wheelers.  │
│  └─────────────────────┘ Reported multiple times to  │
│                          local corporation but no    │
│  📍 28.6139, 77.2090     action taken...             │
│  [Map with pin]                                      │
│                                                      │
│  ─────── Comments (3) ──────────                     │
│  [User1] Thanks for reporting    2h ago              │
│    └─ [Coord] Working on it     1h ago               │
│  [User2] Confirmed, same issue  30m ago              │
│                                                      │
│  ┌──────────────────────────────────┐                │
│  │ Add a comment...                 │  [Post]        │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## WF-07: Coordinator — Pending Reviews

```
┌──────────────────────────────────────────────────────┐
│  [Logo]  [Dashboard][Reviews][Assigned]    🔔 [👤]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Pending Reviews (Zone A)                            │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ 🕳️ Pothole near School Rd                    │   │
│  │ [thumbnail] "Large pothole causing accidents" │   │
│  │ Votes: 2/5 cast    ⏱ 36h remaining           │   │
│  │                                               │   │
│  │ Your Vote:                                    │   │
│  │ [ ✅ Valid ] [ ❌ Invalid ] [ ❓ Clarify ]      │   │
│  │ Comment: ┌────────────────────────────┐       │   │
│  │          └────────────────────────────┘       │   │
│  │                          [Submit Vote]        │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 🗑️ Garbage dump behind market               │    │
│  │ [thumbnail] "Pile of garbage left for weeks"  │   │
│  │ Votes: 4/5 cast    ⏱ 12h remaining           │   │
│  │ ✅ You voted: VALID                           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## WF-08: Coordinator — Proof Submission

```
┌──────────────────────────────────────────────────────┐
│  Submit Proof — Complaint #42                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Original:                  Your Proof:              │
│  ┌───────────────┐          ┌───────────────┐        │
│  │               │          │               │        │
│  │ [Original     │          │ 📷 CAMERA     │        │
│  │  complaint    │          │  PREVIEW      │        │
│  │  photo]       │          │               │        │
│  │               │          │               │        │
│  └───────────────┘          └───────────────┘        │
│                                                      │
│  📍 Original: 28.6139, 77.2090                       │
│  📍 Your GPS:  28.6141, 77.2088                      │
│  📏 Distance:  28m ✅ (within 100m)                  │
│                                                      │
│         [ 📸 Capture Photo ]                         │
│         [ ✅ Submit Proof  ]                         │
│                                                      │
│  ⚠️ You must be within 100m of the complaint         │
│     location to submit proof.                        │
└──────────────────────────────────────────────────────┘
```

---

## WF-09: Admin Dashboard

```
┌──────────────────────────────────────────────────────┐
│  [Logo] Admin Panel  [Users][Areas][Escalations]     │
│                      [Audit][SLA][Stats]  🔔 [👤]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  System Overview                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │ Total    │ │ Pending  │ │ Delayed  │ │ Escalated├│
│  │  142     │ │   12     │ │    5     │ │    3    ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                      │
│  ┌────────────────────┐ ┌────────────────────┐      │
│  │  By Category       │ │  By Area           │      │
│  │  ■■■■ Pothole  45  │ │  ■■■■ Zone A   52  │      │
│  │  ■■■ Garbage   38  │ │  ■■■ Zone B    41  │      │
│  │  ■■ Streetlight 25 │ │  ■■ Zone C     30  │      │
│  │  ■ Drainage    20  │ │  ■ Zone D      19  │      │
│  │  ■ Other       14  │ │                    │      │
│  └────────────────────┘ └────────────────────┘      │
│                                                      │
│  Recent Escalations (3 unresolved)                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ⚠️ Level 3 • Complaint #28 • SLA_EXCEEDED    │   │
│  │ ⚠️ Level 2 • Complaint #35 • CITIZEN_REJECT  │   │
│  │ ⚠️ Level 1 • Complaint #41 • SLA_EXCEEDED    │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## WF-10: Admin — User Management

```
┌──────────────────────────────────────────────────────┐
│  User Management          [+ Create Coordinator]     │
├──────────────────────────────────────────────────────┤
│  Filter: [All Roles ▼] [All Status ▼] [Search... ]  │
│                                                      │
│  ┌────┬───────────┬──────────┬────────┬──────┬─────┐│
│  │ ID │ Username  │ Role     │ Status │Trust │ Act ││
│  ├────┼───────────┼──────────┼────────┼──────┼─────┤│
│  │ 1  │ darsh     │ CITIZEN  │ ACTIVE │NORMAL│ [⚙]││
│  │ 2  │ coord_a1  │COORDINATOR│ACTIVE │  —   │ [⚙]││
│  │ 3  │ john      │ CITIZEN  │WARNING │REVIEW│ [⚙]││
│  │ 4  │ coord_b1  │COORDINATOR│SUSPENDED│ — │ [⚙]││
│  └────┴───────────┴──────────┴────────┴──────┴─────┘│
│                                                      │
│  [⚙] Actions dropdown:                              │
│  ├── Set Active                                      │
│  ├── Set Warning                                     │
│  ├── Suspend                                         │
│  ├── Set Trust: Normal                               │
│  ├── Set Trust: Under Review                         │
│  └── Set Trust: Restricted                           │
│                                                      │
│  Page: [< 1 2 3 >]                                  │
└──────────────────────────────────────────────────────┘
```

---

## WF-11: Notification Panel

```
┌───────────────────────────────────┐
│  Notifications          [Mark all]│
├───────────────────────────────────┤
│ 🔵 Your complaint was approved    │
│    Complaint #42 • 2 min ago      │
├───────────────────────────────────┤
│ 🔵 New complaint to review        │
│    Zone A • Pothole • 15 min ago  │
├───────────────────────────────────┤
│    Proof submitted for #38        │
│    Review and confirm • 2h ago    │
├───────────────────────────────────┤
│    SLA warning: #35               │
│    12h remaining • 3h ago         │
└───────────────────────────────────┘
  🔵 = unread
```

---

## WF-12: Area Map View

```
┌──────────────────────────────────────────────────────┐
│  Area Map                                            │
│  Filter: [All Categories ▼] [All Status ▼]           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │     🟡      🔴                               │   │
│  │         🟢                                   │   │
│  │                   🔴  🔴  🔴                 │   │
│  │    🟡                         🟢             │   │
│  │              🟡                              │   │
│  │                                              │   │
│  │  Google Maps                                 │   │
│  │                                              │   │
│  │        ┌───────────────────┐                 │   │
│  │        │ 🔴 Pothole #42    │                 │   │
│  │        │ HIGH • In Progress│                 │   │
│  │        │ [View Details →]  │                 │   │
│  │        └───────────────────┘                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Legend: 🔴 High  🟡 Medium  🟢 Low                  │
└──────────────────────────────────────────────────────┘
```

---

## WF-13: Citizen Confirmation (within Complaint Detail)

```
┌──────────────────────────────────────────────────────┐
│  Complaint #38 — Resolution Submitted                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Before:                    After (Proof):           │
│  ┌───────────────┐          ┌───────────────┐        │
│  │ [Original     │          │ [Proof photo] │        │
│  │  photo]       │          │               │        │
│  └───────────────┘          └───────────────┘        │
│                                                      │
│  📍 Proof taken 45m from original location ✅        │
│  📅 Submitted: Feb 25, 2026                          │
│                                                      │
│  Is this issue resolved?                             │
│                                                      │
│  [ ✅ Accept — Issue Resolved ]                      │
│  [ ❌ Reject — Issue NOT Resolved ]                  │
│                                                      │
│  (Rejection requires reason, min 20 characters)      │
└──────────────────────────────────────────────────────┘
```
