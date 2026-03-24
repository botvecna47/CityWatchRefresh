# CityWatch — Startup Guide

## Prerequisites

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| **Java JDK** | 17–23 (NOT 25) | `java -version` |
| **PostgreSQL** | 12+ | `psql --version` |
| **Node.js** | 18+ | `node -v` |

> ⚠️ **JDK 25 is NOT compatible** with this project. Use JDK 23 or lower.

---

## One-Time Setup

### 1. Set `JAVA_HOME` (PowerShell as Admin)
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-23", "Machine")
```
Restart your terminal after this.

### 2. Create PostgreSQL Database
```sql
CREATE DATABASE citywatch;
```
The backend connects with user `postgres`, password `botvecna` on port `5432`.  
To change this, edit: `backend/src/main/resources/application.properties`

### 3. Install Frontend Dependencies
```powershell
cd Citywatchcivicreportingapp
npm install
```

---

## Running the Application

### Terminal 1 — Backend (Spring Boot on port 8081)
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
.\apache-maven-3.9.6\bin\mvn spring-boot:run
```
On first run, it auto-creates all database tables and seeds 4 test users.

### Terminal 2 — Frontend (Vite on port 5173)
```powershell
cd Citywatchcivicreportingapp
npm run dev
```

### Open in Browser
```
http://localhost:5173
```

---

## Test Accounts

All passwords: **`password123`**

| Role | Email |
|------|-------|
| 🛡️ Admin | `admin@citywatch.com` |
| 🔧 Coordinator (North) | `bob@citywatch.com` |
| 🔧 Coordinator (South) | `dave@citywatch.com` |
| 🧑 Citizen | `alice@example.com` |

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/login` | ❌ | `{ email, password }` → JWT + user |
| POST | `/api/auth/register` | ❌ | `{ name, email, password, city }` → JWT + user |
| GET | `/api/auth/me` | ✅ Bearer | Returns current user from token |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `mvn` not recognized | Use `.\apache-maven-3.9.6\bin\mvn` from the `backend` folder |
| `JAVA_HOME not defined` | Run `$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"` before mvn |
| `TypeTag :: UNKNOWN` error | You're using JDK 25. Switch to JDK 23 |
| `Connection refused` on login | Backend not running. Start it first on port 8081 |
| Frontend lint errors in IDE | Run `npm install` in `Citywatchcivicreportingapp` folder |
