@echo off
echo Setting JAVA_HOME to JDK 23...
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=%JAVA_HOME%\bin;%PATH%
echo Java version:
java -version
echo.
echo Starting CityWatch backend...
mvn spring-boot:run
