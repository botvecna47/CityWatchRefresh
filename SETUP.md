# CityWatch — Developer Setup Guide

> A complete guide to running the CityWatch platform locally on a fresh Windows machine.

---

## Prerequisites — What You Need to Install

### 1. JDK 23 (Java Development Kit)
The backend requires **JDK 23** specifically. JDK 25 (the latest) breaks Lombok's annotation processor.

- Download from: https://www.oracle.com/java/technologies/downloads/#java23
- Install to the default path: `C:\Program Files\Java\jdk-23`
- After installing, verify: `java -version` → should show `23.x.x`

> **Why not JDK 25?**
> JDK 25 removed internal compiler APIs (`TypeTag`) that Lombok uses to process annotations like `@Builder`, `@Data`, etc. This causes a `Fatal error compiling: TypeTag :: UNKNOWN` crash. JDK 23 works perfectly.

---

### 2. Node.js 18+ (LTS)
The frontend is a Vite + React app and requires Node.js.

- Download from: https://nodejs.org/en/download (choose the **LTS** version)
- Verify: `node --version` → should show `v18.x.x` or higher

---

### 3. Git
- Download from: https://git-scm.com/download/win
- Verify: `git --version`

---

## Step-by-Step Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/botvecna47/CityWatchRefresh.git
cd CityWatchRefresh
```

---

### Step 2 — Run the Setup Checker

Double-click `setup-check.bat` in the project root.

This script will:
- Verify JDK 23, Node.js, and Git are installed
- Run `npm install` for the frontend automatically
- Report any missing dependencies clearly

---

### Step 3 — Configure Environment Variables

You need two `.env` files. They are **not committed to Git** for security reasons.

#### `backend/.env`
Copy `backend/.env.example` to `backend/.env` and fill in:

```env
CW_JWT_SECRET=<any long random string — 64+ characters>
DB_URL=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.zutdbxtzwaktrrfjtetg
DB_PASSWORD=<ask project owner for the password>
```

> For local PostgreSQL instead of Supabase, uncomment the local DB lines and comment out the Supabase ones.

#### `frontend/.env`
Copy `frontend/.env.example` to `frontend/.env` and fill in:

```env
VITE_SUPABASE_URL=https://zutdbxtzwaktrrfjtetg.supabase.co
VITE_SUPABASE_ANON_KEY=<ask project owner for the anon key>
```

---

### Step 4 — Run the Project

Double-click **`run.bat`** in the project root.

This opens two terminal windows:
| Window | Service | URL |
|---|---|---|
| `CityWatch Backend` | Spring Boot API | http://localhost:8081 |
| `CityWatch Frontend` | Vite React App | http://localhost:5173 |

Wait ~20 seconds for the backend to start (it connects to the Supabase PostgreSQL database).
Then open http://localhost:5173 in your browser.

---

## Project Structure

```
CityWatchRevive_V_01/
├── backend/                    # Spring Boot 3.2 + Java 23
│   ├── src/
│   │   └── main/java/com/citywatch/
│   │       ├── controller/     # REST API endpoints
│   │       ├── service/        # Business logic
│   │       ├── entity/         # JPA database models
│   │       ├── repository/     # Spring Data JPA repos
│   │       ├── security/       # JWT auth filter + config
│   │       ├── dto/            # Request/Response DTOs
│   │       └── config/         # Spring Security, CORS
│   ├── .env                    # ⚠ NOT committed — create from .env.example
│   ├── .env.example            # Template for backend .env
│   └── pom.xml                 # Maven dependencies
│
├── frontend/                   # Vite + React + TypeScript
│   ├── src/app/
│   │   ├── pages/              # Route-level page components
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React context providers (Auth, Complaints, etc.)
│   │   ├── api/                # API client and service functions
│   │   └── routes.tsx          # React Router route definitions
│   ├── .env                    # ⚠ NOT committed — create from .env.example
│   ├── .env.example            # Template for frontend .env
│   └── package.json
│
├── run.bat                     # ✅ Start both servers (Windows)
├── setup-check.bat             # ✅ First-time dependency checker (Windows)
└── SETUP.md                    # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 23, Spring Security (JWT) |
| Database | PostgreSQL on Supabase |
| Image Storage | Supabase Storage (`citywatch-images` bucket) |
| Auth | JWT Bearer tokens |

---

## Test Accounts

The database is pre-seeded with the following test accounts (password: `Admin@123`):

| Role | Email | Access |
|---|---|---|
| Citizen | `c1@gmail.com` | Submit & upvote complaints |
| Coordinator | `ravi@citywatch.in` | Accept & resolve complaints |
| Admin | `admin@citywatch.in` | Full system access |

---

## Common Issues

### `ECONNREFUSED 127.0.0.1:8081`
The backend is not running. Start it via `run.bat` or run manually:
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
mvn spring-boot:run
```

### `TypeTag :: UNKNOWN` compile error
You are using JDK 25. Switch to JDK 23. See [Prerequisites → JDK 23](#1-jdk-23-java-development-kit).

### `Bucket not found` (image upload error)
The Supabase `citywatch-images` bucket doesn't exist or your anon key is wrong.
Verify your `frontend/.env` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Can't sign in / 401 errors
Make sure `backend/.env` is correctly configured with `CW_JWT_SECRET` and the database credentials.
