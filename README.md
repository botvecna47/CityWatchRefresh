# CityWatch Civic Reporting App (Revive Version)

A sophisticated, modern Civic Reporting platform allowing citizens to intuitively report civic issues to city coordinators using a mobile-responsive interface, integrated map workflows, and real-time Supabase PostgreSQL backend synchronization.

## 📁 Repository Structure
* **`frontend/`** - The active React (Vite/TypeScript) codebase. Configured to interface securely with Supabase databases and a Spring Boot intermediary.
* **`backend/`** - The active Spring Boot API serving database interactions, user roles, and security implementations.
* **`database/`** - Schema definitions and setup references for Supabase/PostgreSQL.
* **`docs/`** - Startup guides, architecture models, implementation plans, and Figma Prompts.
* **`Reference/`** - Stale, mock, or deprecated architectures stored safely away from active execution paths.
* **`Report/` / `Diary/`** - Developer tracking and analysis output directories.

## 🚀 Quick Start
A dedicated batch script has been provided to effortlessly spin up both service layers at once on Windows environments. Make sure you have JDK 23 and Node.js installed.

1. Ensure your `.env` contains valid Supabase configurations inside `frontend/`.
2. Ensure your backend holds active properties.
3. Double-click or run:
```bash
run_project.bat
```
*(This automatically runs Maven Spring-Boot execution for the backend and Vite Dev Server for the frontend simultaneously in new windows.)*

## 🗺️ React-Leaflet Integration (Planned)
The frontend is actively targeted for mapping migrations:
* Interactive maps using `react-leaflet` for precision reporting.
* Auto-generating Geolocation capabilities for Coordinators' Resolution Proofs.
