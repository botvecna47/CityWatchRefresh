# CityWatch — Legal Templates

> These are draft templates. Customize with your actual details before use.

---

## 1. Disclaimer

```
DISCLAIMER

CityWatch is an academic research project developed as a college mini project.
It is NOT affiliated with, endorsed by, or connected to any government body,
municipal corporation, or public authority.

This platform serves as a facilitation and monitoring tool only. CityWatch does
NOT guarantee the resolution of any civic complaint. Resolution depends on local
coordination efforts and is outside the platform's direct control.

CityWatch does NOT:
- Directly interact with any government system or database
- Make official complaints on behalf of users
- Guarantee timelines for issue resolution
- Hold any legal authority over municipal operations
- Rank, rate, or publicly evaluate any government official or department

Information submitted through CityWatch is used solely for complaint tracking
and coordination purposes within the platform.

By using CityWatch, you acknowledge that:
1. This is a research/academic project
2. No government authority is involved
3. Issue resolution is facilitated, not guaranteed
4. The platform operates within defined urban zones only
5. You are responsible for the accuracy of the information you submit

For questions or concerns, contact: [your-email@institution.edu]
```

---

## 2. Privacy Policy

```
PRIVACY POLICY
Last Updated: [Date]

1. INFORMATION WE COLLECT

1.1 Account Information
- Username (required)
- Email address (required)
- Phone number (optional)
- Password (stored as BCrypt hash, never in plain text)
- City (required)

1.2 Complaint Data
- Description text
- Live photographs (captured via device camera)
- GPS coordinates (captured via browser Geolocation API)

1.3 Automatically Collected Data
- IP address (for rate limiting and audit logging)
- Browser type and version
- Timestamps of all actions

2. HOW WE USE YOUR INFORMATION

We use collected information to:
- Authenticate and manage your account
- Process and track civic complaints
- Assign complaints to geographic areas
- Verify proof of complaint resolution (GPS distance check)
- Maintain audit logs for accountability
- Prevent abuse (rate limiting, duplicate detection)

3. DATA SHARING

We do NOT share your personal information with:
- Government bodies or municipal corporations
- Third-party advertisers
- External analytics services
- Any entity outside the CityWatch platform

Exception: Aggregated, anonymized statistics (total complaints per area)
may be displayed publicly. These contain no personally identifiable information.

4. DATA VISIBILITY WITHIN THE PLATFORM

- Your username is visible on complaints and comments you create
- Your email and phone are visible ONLY to you and system administrators
- Your GPS coordinates are used to assign complaints to areas; exact
  coordinates are visible to coordinators reviewing the complaint
- Your complaint photos are visible to coordinators for validation
  and to other users in the complaint detail view

5. DATA SECURITY

- Passwords are hashed using BCrypt with salt (never stored in plain text)
- API communication uses HTTPS in production
- JWT tokens expire after 24 hours
- SQL injection is prevented through parameterized queries
- EXIF metadata is stripped from uploaded images

6. DATA RETENTION

- Account data is retained while your account is active
- Complaints and associated data (photos, votes, proofs) are retained
  for the lifetime of the complaint and audit purposes
- Audit logs are retained indefinitely (append-only, cannot be deleted)
- You may request account deletion by contacting the administrator;
  complaint data may be retained in anonymized form for audit purposes

7. GPS AND CAMERA USAGE

- GPS: Used to assign complaints to geographic areas and verify
  coordinator proof submissions. Captured only when you actively
  submit a complaint or proof. Not tracked continuously.
- Camera: Used only for live photo capture during complaint submission
  or proof submission. Photos are uploaded to the CityWatch server only.
  No continuous recording occurs.
- Both require explicit browser permission. You may deny access,
  but complaint submission requires both.

8. COOKIES AND LOCAL STORAGE

- CityWatch stores a JWT authentication token in browser localStorage
- No tracking cookies are used
- No third-party analytics cookies are used

9. YOUR RIGHTS

You have the right to:
- View your personal information in your profile
- Request correction of inaccurate information
- Request account deletion (contact administrator)
- Deny camera/GPS permissions (with understanding that core
  functionality requires them)

10. CHANGES TO THIS POLICY

We may update this privacy policy as the project evolves.
Changes will be reflected in the "Last Updated" date above.

11. CONTACT

For privacy concerns: [your-email@institution.edu]
Project Guide: [guide-name], [department], [institution]
```

---

## 3. Terms of Use

```
TERMS OF USE
Last Updated: [Date]

By creating an account on CityWatch, you agree to these terms.

1. ELIGIBILITY
- You must be 18 years or older
- You must reside in or be familiar with the covered areas
- You must provide accurate registration information

2. ACCEPTABLE USE

You agree to:
- Submit genuine civic complaints only
- Provide accurate descriptions and locations
- Take live photos of actual issues (no downloaded or old images)
- Respond to resolution confirmations within 7 days
- Be respectful in comments and communications

You agree NOT to:
- Submit false, misleading, or spam complaints
- Spoof GPS location
- Upload photos unrelated to the complaint
- Harass coordinators or other users
- Attempt to access other users' accounts
- Attempt to bypass rate limits or security measures
- Use offensive or discriminatory language
- Submit complaints for political or personal vendettas
- Impersonate another person

3. TRUST SYSTEM

CityWatch maintains an internal trust system:
- Repeated false complaints may result in your trust level being reduced
- A "Restricted" trust level prevents complaint submission
- A "Suspended" account cannot log in
- These actions are taken by system administrators based on complaint
  outcomes and may be appealed by contacting the admin

4. COMPLAINT CONTENT

By submitting a complaint, you:
- Confirm that the issue described is genuine to your knowledge
- Grant CityWatch the right to display the complaint (description,
  photo, general location) to platform users
- Understand that complaints cannot be deleted after coordinator review
- Accept that your username will be visible on your complaint

5. COORDINATOR RESPONSIBILITIES

Coordinators additionally agree to:
- Review complaints honestly and independently
- Not share or discuss votes with other coordinators before voting
- Visit complaint locations in person when submitting resolution proof
- Not submit false proof of resolution
- Accept that poor performance may result in suspension

6. LIMITATION OF LIABILITY

CityWatch, its developers, or institution:
- Do NOT guarantee resolution of any reported issue
- Are NOT responsible for the accuracy of user-submitted content
- Are NOT liable for actions (or inaction) of municipal authorities
- Are NOT responsible for privacy breaches caused by user error
  (e.g., sharing login credentials)

7. ACCOUNT TERMINATION

We reserve the right to suspend or terminate accounts that:
- Violate these terms
- Submit repeated false complaints
- Engage in abusive behavior
- Attempt to manipulate the voting system

8. MODIFICATIONS

These terms may be updated. Continued use after updates
constitutes acceptance of the revised terms.

9. GOVERNING LAW

This project is an academic endeavor under [Institution Name].
Any disputes shall be resolved through institutional channels.

10. CONTACT

For questions: [your-email@institution.edu]
```

---

## 4. Cookie / Storage Notice (Banner Text)

```
CityWatch uses browser localStorage to keep you logged in. No tracking
cookies are used. By continuing, you accept our Privacy Policy.

[Accept] [Privacy Policy]
```
