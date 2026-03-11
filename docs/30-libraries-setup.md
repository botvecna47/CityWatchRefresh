# CityWatch Environment Setup Report

> **Date Tracking**: 2026-03-11
> **Purpose**: A comprehensive log of the project scaffolding and library installation process for absolute clarity on the technology stack.

---

## 1. Frontend Setup (React + Vite)

The frontend application was initialized using Vite with a React template. This ensures a fast, modern build process.

**Command Executed:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Core Libraries Installed

| Library | Version / Command | Purpose |
|---|---|---|
| **React Router DOM** | `npm i react-router-dom` | Handles navigation between pages (Home, Reports, Map, Dashboards). |
| **Lucide React** | `npm i lucide-react` | Provides crisp, customizable SVG icons (Bell, Home, Search, etc.). |
| **Axios** | `npm i axios` | Used to make HTTP requests to the Spring Boot backend securely. |
| **Leaflet & React-Leaflet** | `npm i leaflet react-leaflet` | Powers the free, interactive "Report Map" feature without needing paid APIs. |

### Styling Libraries Installed (Tailwind CSS)

To achieve the premium, green-and-cream glassmorphic aesthetic efficiently, Tailwind CSS is used.

**Commands Executed:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
*Note: This generated the `tailwind.config.js` and `postcss.config.js` files, which will be configured with our specific color palette.*

---

## 2. Backend Setup (Spring Boot)

The Backend directory (`backend/`) was scaffolded. Because Spring Boot uses Maven, all dependencies are managed internally through the `pom.xml` file rather than via terminal commands.

**Command Executed:**
```bash
mkdir backend
```

### Planned Maven Dependencies
When the Spring application is fully generated via Spring Initializr (or manual `pom.xml` definition), it will include:

- `spring-boot-starter-web`: For REST API endpoints (Controllers).
- `spring-boot-starter-data-jpa`: For database abstraction.
- `postgresql`: The driver to connect to the physical PG database.
- `spring-boot-starter-security`: For robust role-based authentication (Admin, Coordinator, Citizen).
- `java-jwt`: For generating and parsing JSON Web Tokens.
- `spring-boot-starter-validation`: To ensure data integrity (e.g., minimum description lengths).

---

## Next Steps

1. Configure `tailwind.config.js` on the frontend with the CityWatch design tokens.
2. Initialize the backend `pom.xml`, configure PostgreSQL credentials in `application.properties`, and set up the `src/main/java/` directory structure.
