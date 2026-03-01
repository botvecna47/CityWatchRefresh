# CityWatch — Deployment Plan

**Version:** 1.0
**Date:** February 2026

---

## 1. Deployment Environments

| Environment | Purpose | URL | Database |
|---|---|---|---|
| **Local Dev** | Individual development | `http://localhost:5173` (frontend) / `http://localhost:8080` (backend) | Local PostgreSQL / H2 |
| **Demo** | Presentation to examiners | Same machine or LAN | Local PostgreSQL with seed data |
| **Pilot** (Future) | Real-world trial | Cloud hosted (TBD) | Cloud PostgreSQL |

---

## 2. Local Development Setup

### 2.1 Prerequisites

| Software | Version | Purpose |
|---|---|---|
| JDK | 17+ | Backend runtime |
| Node.js | 18+ | Frontend tooling |
| npm | 9+ | Package management |
| PostgreSQL | 15+ | Database |
| Git | 2.x | Version control |
| VS Code or IntelliJ | Latest | IDE |
| Postman (optional) | Latest | API testing |

### 2.2 Backend Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd CityWatchRevive_V_01

# 2. Create PostgreSQL database
psql -U postgres
CREATE DATABASE citywatch;
\q

# 3. Configure application.properties
cd backend/src/main/resources/
# Edit application.properties:
#   spring.datasource.url=jdbc:postgresql://localhost:5432/citywatch
#   spring.datasource.username=postgres
#   spring.datasource.password=<your-password>
#   spring.jpa.hibernate.ddl-auto=update
#   jwt.secret=<your-256-bit-secret>

# 4. Run backend
cd backend/
./mvnw spring-boot:run
# Server starts on http://localhost:8080
```

### 2.3 Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend/

# 2. Install dependencies
npm install

# 3. Create .env file
# VITE_API_BASE_URL=http://localhost:8080/api
# VITE_GOOGLE_MAPS_API_KEY=<your-key>

# 4. Run frontend
npm run dev
# App starts on http://localhost:5173
```

---

## 3. Environment Variables

### Backend (`application.properties`)

| Variable | Description | Example |
|---|---|---|
| `spring.datasource.url` | DB connection URL | `jdbc:postgresql://localhost:5432/citywatch` |
| `spring.datasource.username` | DB username | `postgres` |
| `spring.datasource.password` | DB password | `<secure-password>` |
| `spring.jpa.hibernate.ddl-auto` | Schema strategy | `update` (dev) / `validate` (prod) |
| `jwt.secret` | JWT signing secret | `<256-bit-random-string>` |
| `jwt.expiration` | Token expiry (ms) | `86400000` (24 hours) |
| `upload.dir` | Image storage path | `./uploads/` |
| `server.port` | Backend port | `8080` |

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps key | `AIza...` |

> [!CAUTION]
> **Never commit `.env` files or `application.properties` with real secrets to Git.** Use `.env.example` / `application.properties.example` with placeholder values.

---

## 4. Database Initialization

### 4.1 Schema Creation

Option A (Auto — recommended for dev):
```properties
spring.jpa.hibernate.ddl-auto=update
```
Hibernate auto-creates tables from entity classes.

Option B (Manual — recommended for production):
```bash
psql -U postgres -d citywatch -f docs/schema.sql
```
Use the SQL script from `docs/01-database-schema.md`.

### 4.2 Seed Data

After schema creation, seed essential data:

```sql
-- Admin account (password: Admin@123, BCrypt hashed)
INSERT INTO users (username, email, password_hash, role, city, trust_level, status)
VALUES ('admin', 'admin@citywatch.local',
        '$2a$12$LJ3LdY4RL5FYI6zKJMWrHOUPdVRFzC3NN7ZK/aJK6pIz6XU5x5K1m.',
        'ADMIN', 'TestCity', 'NORMAL', 'ACTIVE');

-- Areas
INSERT INTO areas (name, city, center_lat, center_lng,
                   boundary_lat_min, boundary_lat_max,
                   boundary_lng_min, boundary_lng_max) VALUES
('Zone A', 'TestCity', 28.6139, 77.2090, 28.610, 28.618, 77.205, 77.213),
('Zone B', 'TestCity', 28.6200, 77.2150, 28.616, 28.624, 77.211, 77.219),
('Zone C', 'TestCity', 28.6100, 77.2200, 28.606, 28.614, 77.216, 77.224),
('Zone D', 'TestCity', 28.6250, 77.2100, 28.621, 28.629, 77.206, 77.214);

-- SLA config
INSERT INTO sla_config (category, sla_hours) VALUES
('GARBAGE', 72), ('POTHOLE', 168), ('STREETLIGHT', 96),
('DRAINAGE', 96), ('OTHER', 168);
```

---

## 5. Demo Preparation Checklist

- [ ] Backend running on `localhost:8080`
- [ ] Frontend running on `localhost:5173`
- [ ] Database seeded with: admin account, 4 areas, SLA config
- [ ] At least 3 coordinator accounts created (1 per area minimum)
- [ ] At least 5 sample complaints in various statuses
- [ ] Google Maps API key working (map displays correctly)
- [ ] Camera works on demo device (laptop/phone)
- [ ] GPS works on demo device (may need to be outdoors)
- [ ] Demo script prepared (which flows to show)
- [ ] Backup of database (`pg_dump citywatch > backup.sql`)

### Demo Walkthrough Script

1. **Show landing page** — professional look
2. **Register a citizen** — show form validation
3. **Submit complaint** — show camera, GPS, wizard flow
4. **Switch to coordinator** — show pending reviews, vote
5. **Show majority outcome** — complaint approved
6. **Show auto-assignment** — coordinator assigned, SLA timer
7. **Update progress** — mark in progress
8. **Submit proof** — show GPS distance verification
9. **Citizen confirmation** — accept or reject
10. **Admin panel** — show escalations, audit logs, stats
11. **Show edge case** — try submitting duplicate, show rate limit

---

## 6. Production Deployment (Future Pilot)

### 6.1 Hosting Options

| Component | Free Tier Option | Paid Option |
|---|---|---|
| Frontend | Vercel / Netlify | AWS CloudFront |
| Backend | Railway / Render | AWS EC2 / DigitalOcean |
| Database | Supabase / Neon (free tier PostgreSQL) | AWS RDS |
| Images | Local on server | AWS S3 |
| Domain | Free subdomain from host | Custom domain |

### 6.2 Production Checklist

- [ ] HTTPS enabled (mandatory for camera/GPS)
- [ ] JWT secret changed from dev default
- [ ] CORS restricted to production domain
- [ ] `spring.jpa.hibernate.ddl-auto=validate` (not `update`)
- [ ] Swagger/API docs disabled or password-protected
- [ ] Rate limiting active
- [ ] Database backups configured (daily)
- [ ] Error logs monitored
- [ ] `.env` files not committed
- [ ] Audit logs table: no UPDATE/DELETE permissions

### 6.3 Production Architecture

```
[User Browser]
      │ HTTPS
      ▼
[CDN / Vercel] ─── serves React SPA (static files)
      │
      │ HTTPS (API calls)
      ▼
[Backend Server] ─── Spring Boot JAR
      │
      │ JDBC
      ▼
[PostgreSQL] ─── managed database
      │
[Image Storage] ─── local disk or S3
```

---

## 7. Backup & Recovery

### 7.1 Database Backup

```bash
# Daily backup (production)
pg_dump -U postgres citywatch > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres -d citywatch < backup_20260228.sql
```

### 7.2 Recovery Plan

| Scenario | Action |
|---|---|
| Database corrupted | Restore from latest backup |
| Server crash | Redeploy from Git; restore DB from backup |
| Data loss (accidental deletion) | Restore from backup; audit log shows what was lost |
| JWT secret compromised | Generate new secret; all users must re-login |
| Admin account locked | Direct DB update to reset password hash |
