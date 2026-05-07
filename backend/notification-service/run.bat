@echo off
echo ==========================================
echo HouseBooker - Notification Service
echo ==========================================

:: Définir les variables d'environnement
set JAVA_TOOL_OPTIONS=-Djava.awt.headless=true -Dspring.output.ansi.enabled=never -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8
set MAVEN_OPTS=--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED

:: Nettoyer et lancer
call mvn clean spring-boot:run

pause
