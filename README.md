# CityWatch Civic Reporting App (Revive Version)

A sophisticated, modern Civic Reporting platform allowing citizens to intuitively report civic issues to city coordinators using a mobile-responsive interface, integrated map workflows, and real-time backend synchronization.

## 🤖 AI-Powered Setup
If you are using an AI-capable IDE (like Cursor, Windsurf, or VS Code with an AI agent), you can automate the entire setup process.
**[Copy the prompt from AI_IDE_PROMPT.md](AI_IDE_PROMPT.md)** and paste it into your AI chat to have it install dependencies, configure the database, and start the servers for you.

## 📁 Repository Structure
* **`frontend/`** - React (Vite/TypeScript) codebase.
* **`backend/`** - Spring Boot API (Java 23).
* **`database/`** - Schema definitions and SQL migrations.
* **`docs/`** - Architecture, planning, and design assets.

## 🚀 Quick Start (Windows)
A dedicated batch script effortlessly spins up both service layers at once on Windows environments. Make sure you have JDK 23 and Node.js installed.

1. Ensure your `.env` contains valid Supabase configurations inside `frontend/`.
2. Double-click or run:
```bash
run_project.bat
```

*(This automatically runs Maven Spring-Boot execution for the backend and Vite Dev Server for the frontend simultaneously in new windows.)*

## 🛠️ Manual Startup Guide

### Prerequisites
| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| **Java JDK** | 17–23 (NOT 25) | `java -version` |
| **PostgreSQL** | 12+ | `psql --version` |
| **Node.js** | 18+ | `node -v` |

> ⚠️ **JDK 25 is NOT compatible** with this project. Use JDK 23 or lower.

### 1. Database Setup
```sql
CREATE DATABASE citywatch;
```
The backend connects with user `postgres`, password `botvecna` on port `5432`. To change this, edit: `backend/src/main/resources/application.properties`

### 2. Backend (Spring Boot on port 8081)
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
.\apache-maven-3.9.6\bin\mvn spring-boot:run
```
*On first run, it auto-creates all database tables and seeds demo users.*

### 3. Frontend (Vite on port 5173)
```powershell
cd frontend
npm install
npm run dev
```

## 🔑 Test Accounts
All passwords: **`Admin@123`** (Reset automatically on startup)

| Role | Username / Email |
|------|------------------|
| 🛡️ Admin | `admin` / `admin@nanded.gov.in` |
| 🔧 Coordinator (Vazirabad) | `coord_vazirabad` / `vazirabad@nanded.gov.in` |
| 🔧 Coordinator (Taroda) | `coord_taroda` / `taroda@nanded.gov.in` |
| 🧑 Citizen | `citizen1` / `citizen1@example.com` |

## 🐞 Debugging & Performance Profiling

Since adding heavy monitoring libraries to the frontend bundle negatively impacts performance, the best way to profile memory leaks and optimize your React application is by using **Chrome DevTools**.

### How to Catch Memory Leaks
1. Open Chrome DevTools (`F12`), click the **Memory** tab.
2. Select **Heap snapshot** and take a snapshot.
3. *Perform an action in your app* (e.g., navigate to a report, upload an image, then navigate back).
4. Take a **second snapshot** and change the view filter to **"Comparison"**.
5. Compare the two to see if objects (detached DOM nodes, unmounted React components) failed to garbage collect.

### Common React Memory Leak Culprits
- **Event Listeners**: Adding `window.addEventListener` inside a `useEffect` without `return () => window.removeEventListener(...)`.
- **SetInterval/SetTimeout**: Forgetting to `clearInterval()`.
- **Leaflet Maps**: Not properly destroying map instances.
