# CityWatch Civic Reporting Platform

A modern, mobile-responsive Civic Reporting platform designed to bridge the gap between citizens and municipal authorities. Built as a comprehensive full-stack project, CityWatch enables users to intuitively report civic issues (such as potholes, garbage accumulation, and streetlight failures) using map-based workflows, while providing city coordinators with a robust dashboard for issue tracking and resolution.

## 🌟 Key Features

* **Real-time Reporting**: Citizens can easily drop pins on an interactive map to report issues.
* **Role-Based Access Control**: Distinct workflows for Citizens, Coordinators, and Administrators.
* **Geospatial Proximity Voting**: Prevents duplicate reports by clustering nearby complaints and allowing users to upvote existing issues.
* **SLA & Escalation Tracking**: Automated status updates and escalations when coordinators fail to resolve issues within the designated Service Level Agreement timeframe.
* **Audit Logging**: Comprehensive, tamper-evident tracking of all critical system actions.

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet Maps
* **Backend**: Java 23, Spring Boot 3.2, Spring Security (JWT-based Auth)
* **Database**: PostgreSQL (hosted on Supabase)
* **Storage**: Supabase Storage for complaint imagery

## 🚀 Quick Start (Windows)

Ensure you have **JDK 23** and **Node.js 18+** installed on your system.

1. Configure your `.env` files in both the `frontend/` and `backend/` directories.
2. Run the included batch script to launch both servers simultaneously:
   ```bash
   run_project.bat
   ```

### Manual Startup

**Backend (Spring Boot)**
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
.\apache-maven-3.9.6\bin\mvn spring-boot:run
```

**Frontend (Vite/React)**
```powershell
cd frontend
npm install
npm run dev
```

## 🔑 Test Accounts

The platform includes pre-seeded accounts for testing different role workflows. All default passwords are **`Admin@123`**.

| Role | Username / Email |
|------|------------------|
| 🛡️ Admin | `admin` / `admin@citywatch.in` |
| 🔧 Coordinator | `ravi_p` / `ravi@citywatch.in` |
| 🧑 Citizen | `citizen1` / `c1@gmail.com` |

## 📁 Repository Structure

* **`frontend/`** - React UI application
* **`backend/`** - Spring Boot RESTful API
* **`database/`** - Schema definitions and initial database setup scripts
* **`docs/`** - Additional project documentation and architecture design

---
*Developed as a full-stack engineering project demonstrating proficiency in Java Spring Boot, React, and PostgreSQL.*
