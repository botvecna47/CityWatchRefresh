@echo off
set "PROJECT_ROOT=%~dp0"

echo Starting CityWatch Backend...
start "CityWatch Backend" cmd /k "cd /d %PROJECT_ROOT%backend && set JAVA_HOME=C:\Program Files\Java\jdk-23&& .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"


echo Starting CityWatch Frontend...
start "CityWatch Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

echo Done! Both services are starting in separate windows.
