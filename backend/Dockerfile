# ── Stage 1: Build the fat JAR with Maven ─────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml first so dependency layer is cached if source hasn't changed
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build (skip tests — they need a live DB)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Minimal runtime image ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the fat JAR from build stage
COPY --from=build /app/target/citywatch-backend-0.0.1-SNAPSHOT.jar app.jar

# Render injects PORT automatically; default to 8080 if not set
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
