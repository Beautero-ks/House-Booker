#!/bin/bash
echo "Waiting for Docker Compose to finish pulling and starting..."
cd /home/lincol-b/Documents/Intergiciel/projet/House-Booker/infrastructure
docker compose up -d postgres-auth kafka zookeeper

echo "Starting Spring Boot application..."
cd /home/lincol-b/Documents/Intergiciel/projet/House-Booker/backend/auth-service
./mvnw spring-boot:run
