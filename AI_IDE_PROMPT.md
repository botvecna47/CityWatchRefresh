# 🤖 AI IDE Auto-Setup Prompt

Copy and paste the following prompt into your AI IDE's chat (Windsurf, Cursor, Bolt, etc.) to automatically set up and run the CityWatch project.

---

### **CityWatch Setup & Run Prompt**

> I want to set up and run this project (CityWatch). It is a full-stack Java (Spring Boot) and React (Vite/TypeScript) application. Please perform the following steps autonomously:
>
> 1. **Check Prerequisites**: Verify if Java (JDK 17-23), Node.js, and PostgreSQL are installed.
> 2. **Backend Setup**:
>    - Navigate to the `backend/` directory.
>    - Ensure dependencies are downloaded (using the provided Maven wrapper/script).
>    - Check `backend/src/main/resources/application.properties` for database credentials.
>    - If PostgreSQL is running, ensure the `citywatch` database exists or create it.
>    - Start the Spring Boot application (ideally using `./mvnw spring-boot:run` or the local maven bin).
> 3. **Frontend Setup**:
>    - Navigate to the `frontend/` directory.
>    - Run `npm install` to install dependencies.
>    - Start the Vite development server using `npm run dev`.
> 4. **Verification**: 
>    - Confirm the backend is accessible at `http://localhost:8081`.
>    - Confirm the frontend is running at `http://localhost:5173`.
>
> Please handle any configuration or dependency issues you encounter along the way.

---

## 🛠 Manual Execution Reference
If you prefer running commands manually, refer to the [README.md](file:///c:/Users/Darshdeep/Desktop/Desktop/Trial%20And%20Error/CityWatchRevive_V_01/README.md).
