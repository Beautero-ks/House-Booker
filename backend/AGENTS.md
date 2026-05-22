# AGENTS.md — Guidance for AI coding agents working on this repo

Purpose: give short, actionable instructions so an AI agent can be immediately productive in this microservices repo.

- Root facts
  - This is a multi-module Spring Boot (Maven) backend located at the repository root `backend/`.
  - Each service lives in its own folder (e.g. `notification-service`, `booking-service`, `eureka-server`, `notificationUser-service`). Each service has a `pom.xml`, `src/` and usually a `compose.yaml` or `docker-compose.yml` for local infra.
  - Many services use Spring Cloud patterns (Eureka) and event-driven communication (notification-service contains Kafka docs).

- What an agent may do automatically
  - Read and summarize code, add small focused changes (new class, small configuration), and create tests or helper scripts.
  - Modify or add service-local configuration (`application.yaml`, `pom.xml`) and source under a single service at a time.

- What an agent must NOT do without human approval
  - Run destructive commands or deploy to production. Do not change CI/CD pipelines or credentials.
  - Add new external credentials or publish secrets. If secret needed, escalate and request a human.

- Developer workflows (how to build & run services locally)
  - Build individual module: `mvn -pl <module-name> -am -DskipTests package` from `backend/`.
  - Run a service: `mvn -pl <module-name> spring-boot:run` (set env vars such as `KAFKA_BOOTSTRAP_SERVERS` as needed).
  - Many services provide `compose.yaml` or `docker-compose.yml` to bring up local infra (e.g. `notification-service/docker-compose.yml` and `notification-service/KAFKA_GUIDE.md`). Prefer these for local Kafka/Postgres instances.

- Project-specific conventions & patterns (examples)
  - Event topics: services use domain-style topic names (e.g. recommended `bookings.created`, `notifications.email`). See `notification-service/KAFKA_GUIDE.md` and `notification-service/src/main/java` for consumer patterns.
  - Services are Spring Boot + Maven. Look for `BookingServiceApplication.java` in `booking-service` as an entrypoint example.
  - GraphQL schemas are placed under `src/main/resources/graphql/schema.graphqls` in services that expose GraphQL (example: `booking-service/target/classes/graphql/schema.graphqls`).
  - Local infra compose files live next to each service (e.g. `notification-service/docker-compose.yml`); use them to start Kafka and related components.

- Integration points & cross-service communication
  - Service discovery: there is an `eureka-server` module — services register there in distributed runs.
  - Event broker: notification-service contains Kafka documentation and consumer code; prefer Kafka for async event flows. Confirm topic names by scanning `notification-service/src/main/java/**/kafka` and `KAFKA_GUIDE.md`.
  - REST/GraphQL APIs: services expose endpoints via Spring Boot (look for `*Application.java` classes and controllers). Use those to trigger local flows when testing.

- Quick on-ramps for agents making changes (implementation checklist)
  1. Read `notification-service/KAFKA_GUIDE.md` and `notification-service/src/main/java/**/kafka` to learn existing consumer patterns.
  2. In `booking-service`, find the persistence/save point (repository or mutation resolver). If none present, add a small producer component and call it where bookings are created.
  3. Use JSON messages for PoC events (topic `bookings.created`) with a minimal schema: {bookingId,userId,houseId,startDate,endDate,totalPrice}.
  4. Run `notification-service` local compose to start Kafka, then run both services and create a booking to validate the flow.

- References (example files to inspect)
  - `notification-service/KAFKA_GUIDE.md`
  - `notification-service/src/main/java` (search for `@KafkaListener`, consumer classes)
  - `booking-service/src/main/resources/graphql/schema.graphqls`
  - `eureka-server/` (service discovery)

If you need to make code changes to enable an event flow (booking -> notification), prefer a small, transactional-safe publish after commit (use Spring's ApplicationEvent or a @TransactionalEventListener) and fire JSON messages on `bookings.created` topic. When adding dependencies, update `pom.xml` only for the target module.

---
Created automatically to help agent contributors get productive fast. For implementation of a specific event flow (booking -> notification), see the generated plan in repository notes or ask to continue and apply the minimal changes.

