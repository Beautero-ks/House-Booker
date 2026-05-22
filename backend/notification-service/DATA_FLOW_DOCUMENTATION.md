# 🔄 Notification System - Data Flow Documentation

> **A Debugger's Guide to Understanding the Notification System**
> 
> This document traces the complete journey of a notification from API request to delivery, explaining each component's role, inputs, and outputs.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Complete Data Flow](#complete-data-flow)
4. [Component-by-Component Breakdown](#component-by-component-breakdown)
5. [Channel-Specific Flows](#channel-specific-flows)
6. [Error Handling & Retry Flow](#error-handling--retry-flow)
7. [Quick Reference](#quick-reference)

---

## System Overview

### The Big Picture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │ ──▶ │  REST API   │ ──▶ │    Kafka    │ ──▶ │  Delivery   │
│  (Postman)  │     │ (Controller)│     │   (Queue)   │     │  (Handler)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                       │
                           ▼                                       ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │  PostgreSQL │                         │   External  │
                    │  (Storage)  │                         │  Providers  │
                    └─────────────┘                         └─────────────┘
                           ▲
                           │
                    ┌─────────────┐
                    │    Redis    │
                    │   (Cache)   │
                    └─────────────┘
```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| REST API | Entry point for requests | Spring Boot Controllers |
| Service Layer | Business logic | Spring Services |
| Message Queue | Async processing | Apache Kafka |
| Database | Persistent storage | PostgreSQL |
| Cache | Rate limiting & caching | Redis |
| Consumers | Message processors | Kafka Listeners |
| Channel Handlers | Delivery logic | Strategy Pattern |

---

## Architecture Diagram

### Request Flow (Synchronous)
```
HTTP POST /api/v1/notifications
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                     SYNCHRONOUS PHASE                               │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │ NotificationCon- │───▶│ NotificationSer- │───▶│ PostgreSQL   │ │
│  │ troller.java     │    │ vice.java        │    │ (save)       │ │
│  └──────────────────┘    └──────────────────┘    └──────────────┘ │
│           │                      │                                 │
│           │                      ▼                                 │
│           │              ┌──────────────────┐                      │
│           │              │ RateLimiterSer-  │◀───▶ Redis           │
│           │              │ vice.java        │                      │
│           │              └──────────────────┘                      │
│           │                      │                                 │
│           │                      ▼                                 │
│           │              ┌──────────────────┐                      │
│           │              │ Kafka Producer   │                      │
│           │              │ (send to topic)  │                      │
│           │              └──────────────────┘                      │
│           │                      │                                 │
│           ▼                      │                                 │
│  ┌──────────────────┐            │                                 │
│  │ HTTP 201 Created │◀───────────┘                                 │
│  │ Response         │                                              │
│  └──────────────────┘                                              │
└────────────────────────────────────────────────────────────────────┘
```

### Processing Flow (Asynchronous)
```
┌────────────────────────────────────────────────────────────────────┐
│                     ASYNCHRONOUS PHASE                              │
│                                                                     │
│  Kafka Topics:                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │notifications.  │  │notifications.  │  │notifications.  │        │
│  │email           │  │sms             │  │push            │  ...   │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘        │
│          │                   │                   │                  │
│          ▼                   ▼                   ▼                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              NotificationConsumer.java                       │   │
│  │  processEmailNotification() / processSmsNotification() /... │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              ChannelDispatcher.java                          │   │
│  │              (Routes to correct handler)                     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│          ┌──────────────────┼──────────────────┐                   │
│          ▼                  ▼                  ▼                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
│  │EmailChannel  │   │SmsChannel    │   │PushChannel   │   ...     │
│  │Handler.java  │   │Handler.java  │   │Handler.java  │           │
│  └──────────────┘   └──────────────┘   └──────────────┘           │
│          │                  │                  │                   │
│          ▼                  ▼                  ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              External Providers (SendGrid, Twilio, FCM)      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Complete Data Flow

### 🚀 Step-by-Step Journey of a Notification

Let's trace a notification from the moment a client makes an API call until it's delivered.

---

### STEP 1: HTTP Request Arrives

```
📍 Entry Point: NotificationController.java
📁 Location: src/main/java/com/notification/controller/NotificationController.java
```

**▶ INPUT (HTTP Request):**
```json
POST /api/v1/notifications
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "channel": "EMAIL",
  "priority": "HIGH",
  "templateName": "welcome-email",
  "templateVariables": {
    "userName": "John Doe",
    "activationLink": "https://example.com/activate/abc123"
  }
}
```

**🔍 What Happens Inside:**
```java
@PostMapping
public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
        @Valid @RequestBody SendNotificationRequest request) {
    
    // 1. @Valid triggers validation on request fields
    // 2. @RequestBody converts JSON to SendNotificationRequest object
    // 3. Calls service layer
    NotificationResponse response = notificationService.sendNotification(request);
    
    // 4. Wraps response in ApiResponse and returns 201 Created
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.success("Notification queued successfully", response));
}
```

**◀ OUTPUT (to Service Layer):**
```
SendNotificationRequest {
    userId: UUID(550e8400-e29b-41d4-a716-446655440001)
    channel: ChannelType.EMAIL
    priority: Priority.HIGH
    templateName: "welcome-email"
    templateVariables: Map{"userName" -> "John Doe", ...}
    subject: null
    content: null
}
```

---

### STEP 2: Service Layer Processing

```
📍 File: NotificationService.java
📁 Location: src/main/java/com/notification/service/NotificationService.java
```

**▶ INPUT:**
- `SendNotificationRequest` object from controller

**🔍 What Happens Inside (Sub-steps):**

#### Step 2.1: Validate User Exists
```java
// Query: SELECT * FROM users WHERE id = ?
User notificationUser = userRepository.findById(request.getUserId())
    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
```

**Database Query →**
```sql
SELECT id, email, phone, device_token, created_at, updated_at 
FROM users 
WHERE id = '550e8400-e29b-41d4-a716-446655440001'
```

**← Database Response:**
```
User {
    id: 550e8400-e29b-41d4-a716-446655440001
    email: "john@example.com"
    phone: "+1234567890"
    deviceToken: "fcm-token-abc123..."
}
```

#### Step 2.2: Check Deduplication (if eventId provided)
```
📍 File: DeduplicationService.java
📁 Location: src/main/java/com/notification/service/DeduplicationService.java
```

```java
if (request.getEventId() != null) {
    if (deduplicationService.isDuplicate(request.getEventId())) {
        // Return early - duplicate detected
        return NotificationResponse.builder()
            .status(NotificationStatus.FAILED)
            .errorMessage("Duplicate event: notification already processed")
            .build();
    }
}
```

**Redis Query →**
```
GET event:order-123-confirmation
```

**← Redis Response:**
```
null (not found = new event, proceed)
OR
"1" (found = duplicate, stop)
```

**Redis Write (if new) →**
```
SET event:order-123-confirmation "1" EX 86400
```

#### Step 2.3: Check Rate Limit
```
📍 File: RateLimiterService.java
📁 Location: src/main/java/com/notification/service/RateLimiterService.java
```

**▶ INPUT:**
```
userId: UUID
channel: ChannelType.EMAIL
```

**🔍 What Happens:**
```java
public boolean checkAndIncrement(UUID userId, ChannelType channel) {
    String key = buildKey(userId, channel);  // "rate:550e8400...:EMAIL"
    
    // Get current count from Redis
    String currentValue = redisTemplate.opsForValue().get(key);
    int currentCount = (currentValue != null) ? Integer.parseInt(currentValue) : 0;
    
    // Check against limit (EMAIL = 10/hour)
    int limit = getLimit(channel);  // 10
    
    if (currentCount >= limit) {
        throw new RateLimitExceededException(channel, limit, getRetryAfter(key));
    }
    
    // Increment counter
    redisTemplate.opsForValue().increment(key);
    return true;
}
```

**Redis Operations →**
```
GET rate:550e8400-e29b-41d4-a716-446655440001:EMAIL
→ Returns: "3"

INCR rate:550e8400-e29b-41d4-a716-446655440001:EMAIL
→ Returns: 4

(If new key, also sets TTL: EXPIRE key 3600)
```

**◀ OUTPUT:**
```
true (allowed) 
OR 
throws RateLimitExceededException
```

#### Step 2.4: Process Template
```
📍 File: TemplateService.java
📁 Location: src/main/java/com/notification/service/TemplateService.java
```

**▶ INPUT:**
```
templateName: "welcome-email"
variables: {"userName": "John Doe", "activationLink": "https://..."}
```

**🔍 What Happens:**
```java
public ProcessedTemplate processTemplate(String templateName, Map<String, String> variables) {
    // 1. Fetch template from cache or DB
    NotificationTemplate template = templateRepository.findByNameAndIsActiveTrue(templateName)
        .orElseThrow(() -> new ResourceNotFoundException("Template", "name", templateName));
    
    // 2. Replace placeholders
    String processedSubject = replacePlaceholders(template.getSubjectTemplate(), variables);
    String processedBody = replacePlaceholders(template.getBodyTemplate(), variables);
    
    return new ProcessedTemplate(processedSubject, processedBody, template.getChannel());
}

private String replacePlaceholders(String template, Map<String, String> variables) {
    // "Welcome, {{userName}}!" → "Welcome, John Doe!"
    for (Map.Entry<String, String> entry : variables.entrySet()) {
        template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
    }
    return template;
}
```

**Database/Cache Query →**
```sql
SELECT * FROM notification_templates WHERE name = 'welcome-email' AND is_active = true
```

**← Database Response:**
```
NotificationTemplate {
    id: abc123...
    name: "welcome-email"
    channel: EMAIL
    subjectTemplate: "Welcome, {{userName}}!"
    bodyTemplate: "Hi {{userName}}, click here to activate: {{activationLink}}"
}
```

**◀ OUTPUT:**
```
ProcessedTemplate {
    subject: "Welcome, John Doe!"
    body: "Hi John Doe, click here to activate: https://example.com/activate/abc123"
    channel: EMAIL
}
```

#### Step 2.5: Create Notification Record
```java
Notification notification = Notification.builder()
    .notificationUser(notificationUser)
    .channel(request.getChannel())
    .priority(request.getPriority())
    .subject(processedSubject)
    .content(processedBody)
    .status(NotificationStatus.PENDING)
    .build();

notification = notificationRepository.save(notification);
```

**Database Insert →**
```sql
INSERT INTO notifications 
(id, user_id, channel, priority, subject, content, status, retry_count, created_at)
VALUES 
('new-uuid', '550e8400...', 'EMAIL', 'HIGH', 'Welcome, John Doe!', 'Hi John Doe...', 'PENDING', 0, NOW())
RETURNING *
```

**← Database Response:**
```
Notification {
    id: 7f3b8c2a-1234-5678-9abc-def012345678
    userId: 550e8400-e29b-41d4-a716-446655440001
    channel: EMAIL
    priority: HIGH
    status: PENDING
    createdAt: 2026-02-01T10:30:00Z
}
```

#### Step 2.6: Send to Kafka
```java
private void sendToKafka(Notification notification) {
    String topic = getTopicForChannel(notification.getChannel());
    String notificationId = notification.getId().toString();
    
    // Send notification ID to channel-specific topic
    kafkaTemplate.send(topic, notificationId);
    
    log.info("Sent notification {} to topic {}", notificationId, topic);
}

private String getTopicForChannel(ChannelType channel) {
    return switch (channel) {
        case EMAIL -> emailTopic;      // "notifications.email"
        case SMS -> smsTopic;          // "notifications.sms"
        case PUSH -> pushTopic;        // "notifications.push"
        case IN_APP -> inAppTopic;     // "notifications.in-app"
    };
}
```

**Kafka Message →**
```
Topic: notifications.email
Key: null
Value: "7f3b8c2a-1234-5678-9abc-def012345678"
```

**◀ OUTPUT (to Controller):**
```
NotificationResponse {
    id: 7f3b8c2a-1234-5678-9abc-def012345678
    userId: 550e8400-e29b-41d4-a716-446655440001
    channel: EMAIL
    priority: HIGH
    subject: "Welcome, John Doe!"
    content: "Hi John Doe, click here to activate..."
    status: PENDING
    retryCount: 0
    createdAt: 2026-02-01T10:30:00Z
}
```

---

### STEP 3: HTTP Response Returned

```
📍 Back to: NotificationController.java
```

**◀ OUTPUT (HTTP Response):**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Notification queued successfully",
  "data": {
    "id": "7f3b8c2a-1234-5678-9abc-def012345678",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "channel": "EMAIL",
    "priority": "HIGH",
    "subject": "Welcome, John Doe!",
    "content": "Hi John Doe, click here to activate...",
    "status": "PENDING",
    "retryCount": 0,
    "createdAt": "2026-02-01T10:30:00Z"
  },
  "timestamp": "2026-02-01T10:30:00.123Z"
}
```

---

### ⏸️ SYNCHRONOUS PHASE ENDS HERE

> **The client receives 201 Created response immediately.**
> **Actual delivery happens asynchronously via Kafka consumers.**

---

### STEP 4: Kafka Consumer Picks Up Message

```
📍 File: NotificationConsumer.java
📁 Location: src/main/java/com/notification/kafka/NotificationConsumer.java
```

**▶ INPUT (from Kafka):**
```
ConsumerRecord {
    topic: "notifications.email"
    partition: 0
    offset: 12345
    key: null
    value: "7f3b8c2a-1234-5678-9abc-def012345678"
}
```

**🔍 What Happens:**
```java
@KafkaListener(
    topics = "${notification.kafka.topic.email:notifications.email}",
    groupId = "${spring.kafka.consumer.group-id:notification-service}-email"
)
public void processEmailNotification(
        ConsumerRecord<String, String> record,
        Acknowledgment acknowledgment) {
    processNotification(record, acknowledgment, "EMAIL");
}

private void processNotification(
        ConsumerRecord<String, String> record,
        Acknowledgment acknowledgment,
        String channelName) {
    
    String notificationId = record.value();
    
    try {
        // 1. Parse notification ID
        UUID id = UUID.fromString(notificationId);
        
        // 2. Fetch notification from database
        Optional<Notification> optionalNotification = notificationRepository.findById(id);
        
        if (optionalNotification.isEmpty()) {
            log.error("Notification not found: {}", notificationId);
            acknowledgment.acknowledge();  // Remove from queue
            return;
        }
        
        Notification notification = optionalNotification.get();
        
        // 3. Update status to PROCESSING
        notification.setStatus(NotificationStatus.PROCESSING);
        notificationRepository.save(notification);
        
        // 4. Dispatch to channel handler
        boolean success = channelDispatcher.dispatch(notification);
        
        // 5. Update final status
        if (success) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(OffsetDateTime.now());
        } else {
            handleFailure(notification);
        }
        
        notificationRepository.save(notification);
        
        // 6. Acknowledge message (remove from Kafka)
        acknowledgment.acknowledge();
        
    } catch (Exception e) {
        log.error("Error processing notification: {}", notificationId, e);
        // Don't acknowledge - message will be retried
    }
}
```

**Database Query →**
```sql
SELECT * FROM notifications WHERE id = '7f3b8c2a-1234-5678-9abc-def012345678'
```

**Database Update →**
```sql
UPDATE notifications 
SET status = 'PROCESSING', updated_at = NOW() 
WHERE id = '7f3b8c2a-1234-5678-9abc-def012345678'
```

**◀ OUTPUT (to ChannelDispatcher):**
```
Notification {
    id: 7f3b8c2a-1234-5678-9abc-def012345678
    notificationUser: User{id: 550e8400..., email: "john@example.com"}
    channel: EMAIL
    subject: "Welcome, John Doe!"
    content: "Hi John Doe, click here to activate..."
    status: PROCESSING
}
```

---

### STEP 5: Channel Dispatcher Routes to Handler

```
📍 File: ChannelDispatcher.java
📁 Location: src/main/java/com/notification/service/channel/ChannelDispatcher.java
```

**▶ INPUT:**
```
Notification object with channel = EMAIL
```

**🔍 What Happens:**
```java
public boolean dispatch(Notification notification) {
    ChannelType channel = notification.getChannel();
    
    // Look up handler from pre-built map
    ChannelHandler handler = handlers.get(channel);
    
    if (handler == null) {
        log.error("No handler found for channel: {}", channel);
        return false;
    }
    
    // Check if handler can process this notification
    if (!handler.canHandle(notification)) {
        log.error("Handler {} cannot process notification {}", channel, notification.getId());
        return false;
    }
    
    // Delegate to the appropriate handler
    return handler.send(notification);
}
```

**Handler Map (initialized at startup):**
```
handlers = {
    EMAIL -> EmailChannelHandler instance,
    SMS -> SmsChannelHandler instance,
    PUSH -> PushChannelHandler instance,
    IN_APP -> InAppChannelHandler instance
}
```

**◀ OUTPUT (delegates to):**
```
EmailChannelHandler.send(notification)
```

---

### STEP 6: Channel Handler Sends Notification

```
📍 File: EmailChannelHandler.java
📁 Location: src/main/java/com/notification/service/channel/EmailChannelHandler.java
```

**▶ INPUT:**
```
Notification {
    notificationUser.email: "john@example.com"
    subject: "Welcome, John Doe!"
    content: "Hi John Doe, click here to activate..."
}
```

**🔍 What Happens:**
```java
@Override
public boolean canHandle(Notification notification) {
    // Check if notificationUser has an email address
    User notificationUser = notification.getUser();
    if (notificationUser == null || notificationUser.getEmail() == null || notificationUser.getEmail().isBlank()) {
        log.warn("Cannot send email: User {} has no email address", 
            notificationUser != null ? notificationUser.getId() : "null");
        return false;
    }
    return true;
}

@Override
public boolean send(Notification notification) {
    User notificationUser = notification.getUser();
    String email = notificationUser.getEmail();
    
    log.info("========== SENDING EMAIL ==========");
    log.info("To: {}", email);
    log.info("Subject: {}", notification.getSubject());
    log.info("Body: {}", notification.getContent());
    log.info("====================================");
    
    // In production, this would call SendGrid/SES/SMTP:
    //
    // Email from = new Email("noreply@yourapp.com");
    // Email to = new Email(email);
    // Content content = new Content("text/html", notification.getContent());
    // Mail mail = new Mail(from, notification.getSubject(), to, content);
    // 
    // SendGrid sg = new SendGrid(apiKey);
    // Request request = new Request();
    // request.setMethod(Method.POST);
    // request.setEndpoint("mail/send");
    // request.setBody(mail.build());
    // Response response = sg.api(request);
    // return response.getStatusCode() == 202;
    
    // Mock implementation - always succeeds
    return true;
}
```

**External API Call (Production) →**
```
POST https://api.sendgrid.com/v3/mail/send
Authorization: Bearer SG.xxxxx

{
  "from": {"email": "noreply@yourapp.com"},
  "personalizations": [{
    "to": [{"email": "john@example.com"}],
    "subject": "Welcome, John Doe!"
  }],
  "content": [{
    "type": "text/html",
    "value": "Hi John Doe, click here to activate..."
  }]
}
```

**← External API Response:**
```
HTTP/1.1 202 Accepted
```

**◀ OUTPUT:**
```
boolean: true (success)
```

---

### STEP 7: Status Updated & Acknowledged

```
📍 Back to: NotificationConsumer.java
```

**Database Update →**
```sql
UPDATE notifications 
SET status = 'SENT', 
    sent_at = '2026-02-01T10:30:05Z',
    updated_at = NOW() 
WHERE id = '7f3b8c2a-1234-5678-9abc-def012345678'
```

**Kafka Acknowledgment →**
```
acknowledgment.acknowledge();
// Commits offset, message won't be redelivered
```

**Final Notification State:**
```
Notification {
    id: 7f3b8c2a-1234-5678-9abc-def012345678
    status: SENT
    sentAt: 2026-02-01T10:30:05Z
    retryCount: 0
}
```

---

## Component-by-Component Breakdown

### 📁 Controllers (Entry Points)

#### NotificationController.java
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/v1/notifications` | POST | `SendNotificationRequest` JSON | `NotificationResponse` wrapped in `ApiResponse` |
| `/api/v1/notifications/bulk` | POST | `BulkNotificationRequest` JSON | `BulkNotificationResponse` |
| `/api/v1/notifications/{id}` | GET | UUID path param | `NotificationResponse` |
| `/api/v1/notifications/notificationUser/{userId}` | GET | UUID + pagination params | `PagedResponse<NotificationResponse>` |
| `/api/v1/notifications/{id}/read` | PATCH | UUID path param | `NotificationResponse` |

#### TemplateController.java
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/v1/templates` | POST | `CreateTemplateRequest` JSON | `TemplateResponse` |
| `/api/v1/templates` | GET | Optional `channel` query param | `List<TemplateResponse>` |
| `/api/v1/templates/{id}` | GET | UUID path param | `TemplateResponse` |
| `/api/v1/templates/{id}` | PUT | UUID + `CreateTemplateRequest` | `TemplateResponse` |
| `/api/v1/templates/{id}` | DELETE | UUID path param | Success message |

#### UserController.java
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/v1/users/email/{email}` | GET | Email string | `User` |
| `/api/v1/users/phone/{phone}` | GET | Phone string | `User` |
| `/api/v1/users/push-eligible` | GET | None | `List<User>` |

#### HealthController.java
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/v1/health` | GET | None | "OK" status |
| `/api/v1/health/detailed` | GET | None | Dependency health map |

---

### 📁 DTOs (Data Transfer Objects)

#### Request DTOs
```
┌─────────────────────────────────────────────────────────────────────┐
│ SendNotificationRequest                                              │
├─────────────────────────────────────────────────────────────────────┤
│ + userId: UUID                    [Required]                        │
│ + channel: ChannelType            [Required] EMAIL|SMS|PUSH|IN_APP  │
│ + priority: Priority              [Optional] HIGH|MEDIUM|LOW        │
│ + templateName: String            [Optional] Use template           │
│ + templateVariables: Map<String>  [Optional] Template placeholders  │
│ + subject: String                 [Optional] Direct subject         │
│ + content: String                 [Optional] Direct content         │
│ + eventId: String                 [Optional] For deduplication      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BulkNotificationRequest                                              │
├─────────────────────────────────────────────────────────────────────┤
│ + userIds: List<UUID>             [Required] Multiple recipients    │
│ + channel: ChannelType            [Required]                        │
│ + priority: Priority              [Optional] Default: LOW           │
│ + templateName: String            [Optional]                        │
│ + templateVariables: Map<String>  [Optional]                        │
│ + subject: String                 [Optional]                        │
│ + content: String                 [Optional]                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ CreateTemplateRequest                                                │
├─────────────────────────────────────────────────────────────────────┤
│ + name: String                    [Required] Unique identifier      │
│ + channel: ChannelType            [Required]                        │
│ + subjectTemplate: String         [Optional] With {{placeholders}}  │
│ + bodyTemplate: String            [Required] With {{placeholders}}  │
└─────────────────────────────────────────────────────────────────────┘
```

#### Response DTOs
```
┌─────────────────────────────────────────────────────────────────────┐
│ ApiResponse<T>                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ + success: boolean                True if operation succeeded       │
│ + message: String                 Human-readable message            │
│ + data: T                         The actual response data          │
│ + timestamp: OffsetDateTime       When response was generated       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ NotificationResponse                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ + id: UUID                        Notification ID                   │
│ + userId: UUID                    Recipient notificationUser ID                 │
│ + channel: ChannelType            Delivery channel                  │
│ + priority: Priority              Processing priority               │
│ + subject: String                 Processed subject                 │
│ + content: String                 Processed content                 │
│ + status: NotificationStatus      Current state                     │
│ + retryCount: int                 Number of retry attempts          │
│ + errorMessage: String            Error details (if failed)         │
│ + createdAt: OffsetDateTime       When created                      │
│ + sentAt: OffsetDateTime          When sent to provider             │
│ + deliveredAt: OffsetDateTime     When confirmed delivered          │
│ + readAt: OffsetDateTime          When notificationUser read (in-app only)      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 📁 Services (Business Logic)

#### NotificationService.java
```
┌─────────────────────────────────────────────────────────────────────┐
│                        NotificationService                           │
├─────────────────────────────────────────────────────────────────────┤
│ Dependencies:                                                        │
│   - NotificationRepository                                           │
│   - UserRepository                                                   │
│   - TemplateService                                                  │
│   - RateLimiterService                                               │
│   - DeduplicationService                                             │
│   - KafkaTemplate                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Methods:                                                             │
│                                                                      │
│ sendNotification(SendNotificationRequest)                            │
│   IN:  SendNotificationRequest                                       │
│   OUT: NotificationResponse                                          │
│   DOES: Validates → Rate limits → Templates → Saves → Kafka         │
│                                                                      │
│ sendBulkNotification(BulkNotificationRequest)                        │
│   IN:  BulkNotificationRequest                                       │
│   OUT: BulkNotificationResponse                                      │
│   DOES: Loops through userIds, calls sendNotification for each      │
│                                                                      │
│ getNotificationById(UUID)                                            │
│   IN:  UUID notificationId                                           │
│   OUT: NotificationResponse                                          │
│   DOES: Fetches from database, converts to DTO                      │
│                                                                      │
│ getUserNotifications(UUID, Pageable)                                 │
│   IN:  UUID userId, Pageable (page, size)                           │
│   OUT: PagedResponse<NotificationResponse>                          │
│   DOES: Fetches paginated notifications for notificationUser                    │
│                                                                      │
│ markAsRead(UUID)                                                     │
│   IN:  UUID notificationId                                           │
│   OUT: NotificationResponse                                          │
│   DOES: Updates status to READ, sets readAt timestamp               │
└─────────────────────────────────────────────────────────────────────┘
```

#### RateLimiterService.java
```
┌─────────────────────────────────────────────────────────────────────┐
│                        RateLimiterService                            │
├─────────────────────────────────────────────────────────────────────┤
│ Dependencies:                                                        │
│   - StringRedisTemplate                                              │
│                                                                      │
│ Configuration (from application.yml):                                │
│   - emailLimit: 10/hour                                              │
│   - smsLimit: 5/hour                                                 │
│   - pushLimit: 20/hour                                               │
│   - inAppLimit: 100/hour                                             │
├─────────────────────────────────────────────────────────────────────┤
│ Methods:                                                             │
│                                                                      │
│ checkAndIncrement(UUID userId, ChannelType channel)                  │
│   IN:  userId, channel                                               │
│   OUT: boolean (true if allowed)                                     │
│   THROWS: RateLimitExceededException if limit reached               │
│   REDIS: GET/INCR rate:{userId}:{channel}                           │
│                                                                      │
│ getRemainingQuota(UUID userId, ChannelType channel)                  │
│   IN:  userId, channel                                               │
│   OUT: int (remaining notifications allowed)                        │
│   REDIS: GET rate:{userId}:{channel}                                │
│                                                                      │
│ isRateLimited(UUID userId, ChannelType channel)                      │
│   IN:  userId, channel                                               │
│   OUT: boolean (true if at or over limit)                           │
│                                                                      │
│ resetLimit(UUID userId, ChannelType channel)                         │
│   IN:  userId, channel                                               │
│   OUT: void                                                          │
│   REDIS: DEL rate:{userId}:{channel}                                │
└─────────────────────────────────────────────────────────────────────┘
```

#### DeduplicationService.java
```
┌─────────────────────────────────────────────────────────────────────┐
│                       DeduplicationService                           │
├─────────────────────────────────────────────────────────────────────┤
│ Dependencies:                                                        │
│   - StringRedisTemplate                                              │
│                                                                      │
│ Configuration:                                                       │
│   - TTL: 24 hours (86400 seconds)                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Methods:                                                             │
│                                                                      │
│ isDuplicate(String eventId)                                          │
│   IN:  eventId (e.g., "order-123-confirmation")                     │
│   OUT: boolean (true if already processed)                          │
│   REDIS: EXISTS event:{eventId}                                     │
│          If not exists: SET event:{eventId} "1" EX 86400            │
│                                                                      │
│ markAsSeen(String eventId)                                           │
│   IN:  eventId                                                       │
│   OUT: void                                                          │
│   REDIS: SET event:{eventId} "1" EX 86400                           │
└─────────────────────────────────────────────────────────────────────┘
```

#### TemplateService.java
```
┌─────────────────────────────────────────────────────────────────────┐
│                         TemplateService                              │
├─────────────────────────────────────────────────────────────────────┤
│ Dependencies:                                                        │
│   - NotificationTemplateRepository                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Methods:                                                             │
│                                                                      │
│ processTemplate(String name, Map<String,String> variables)           │
│   IN:  templateName, variable map                                   │
│   OUT: ProcessedTemplate {subject, body, channel}                   │
│   DOES: Fetches template, replaces {{placeholders}}                 │
│                                                                      │
│ createTemplate(CreateTemplateRequest)                                │
│   IN:  CreateTemplateRequest                                         │
│   OUT: TemplateResponse                                              │
│   @CacheEvict: Clears template cache                                │
│                                                                      │
│ getTemplateByName(String name)                                       │
│   IN:  template name                                                 │
│   OUT: TemplateResponse                                              │
│   @Cacheable: Results cached in Redis                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 📁 Kafka Components

#### NotificationConsumer.java
```
┌─────────────────────────────────────────────────────────────────────┐
│                      NotificationConsumer                            │
├─────────────────────────────────────────────────────────────────────┤
│ Listens to Topics:                                                   │
│   - notifications.email                                              │
│   - notifications.sms                                                │
│   - notifications.push                                               │
│   - notifications.in-app                                             │
├─────────────────────────────────────────────────────────────────────┤
│ Methods:                                                             │
│                                                                      │
│ @KafkaListener processEmailNotification(record, ack)                 │
│   Topic: notifications.email                                         │
│   GroupId: notification-service-email                               │
│                                                                      │
│ @KafkaListener processSmsNotification(record, ack)                   │
│   Topic: notifications.sms                                           │
│   GroupId: notification-service-sms                                 │
│                                                                      │
│ @KafkaListener processPushNotification(record, ack)                  │
│   Topic: notifications.push                                          │
│   GroupId: notification-service-push                                │
│                                                                      │
│ @KafkaListener processInAppNotification(record, ack)                 │
│   Topic: notifications.in-app                                        │
│   GroupId: notification-service-inapp                               │
├─────────────────────────────────────────────────────────────────────┤
│ Flow for each:                                                       │
│   1. Extract notification ID from Kafka message                     │
│   2. Fetch Notification from database                               │
│   3. Update status to PROCESSING                                    │
│   4. Call channelDispatcher.dispatch(notification)                  │
│   5. Update status to SENT or handle failure                        │
│   6. Acknowledge Kafka message                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 📁 Channel Handlers (Strategy Pattern)

```
                        ┌───────────────────┐
                        │  <<interface>>    │
                        │  ChannelHandler   │
                        ├───────────────────┤
                        │ +getChannelType() │
                        │ +canHandle()      │
                        │ +send()           │
                        └─────────┬─────────┘
                                  │
          ┌───────────────┬───────┴───────┬───────────────┐
          ▼               ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│EmailChannel     │ │SmsChannel       │ │PushChannel      │ │InAppChannel     │
│Handler          │ │Handler          │ │Handler          │ │Handler          │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│channel: EMAIL   │ │channel: SMS     │ │channel: PUSH    │ │channel: IN_APP  │
│                 │ │                 │ │                 │ │                 │
│canHandle:       │ │canHandle:       │ │canHandle:       │ │canHandle:       │
│ notificationUser.email!=null│ │ notificationUser.phone!=null│ │ notificationUser.device     │ │ notificationUser!=null      │
│                 │ │                 │ │   Token!=null   │ │                 │
│send:            │ │send:            │ │send:            │ │send:            │
│ → SendGrid      │ │ → Twilio        │ │ → FCM/APNs      │ │ → Already in DB │
│ → SES           │ │ → Nexmo         │ │                 │ │ → WebSocket     │
│ → SMTP          │ │ → AWS SNS       │ │                 │ │   (optional)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Channel-Specific Flows

### 📧 EMAIL Channel Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          EMAIL NOTIFICATION FLOW                          │
└──────────────────────────────────────────────────────────────────────────┘

1. API Request
   POST /api/v1/notifications
   {
     "userId": "...",
     "channel": "EMAIL",
     "subject": "Welcome!",
     "content": "<h1>Hello</h1><p>Welcome to our service!</p>"
   }

2. Validation
   ├── User exists? ✓
   ├── User has email? ✓ (john@example.com)
   └── Rate limit OK? ✓ (3/10 emails this hour)

3. Database Insert
   INSERT INTO notifications (channel='EMAIL', status='PENDING', ...)

4. Kafka Publish
   Topic: notifications.email
   Message: "notification-uuid-here"

5. Consumer Picks Up
   @KafkaListener(topics = "notifications.email")
   processEmailNotification()

6. Handler Execution
   EmailChannelHandler.send()
   ├── Validate: notificationUser.email != null ✓
   └── Send via provider (SendGrid/SES/SMTP)

7. External API Call
   POST https://api.sendgrid.com/v3/mail/send
   {
     "to": "john@example.com",
     "subject": "Welcome!",
     "content": "<h1>Hello</h1>..."
   }

8. Status Update
   UPDATE notifications SET status='SENT', sent_at=NOW()

9. Delivery Confirmation (async webhook from provider)
   UPDATE notifications SET status='DELIVERED', delivered_at=NOW()
```

### 📱 SMS Channel Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           SMS NOTIFICATION FLOW                           │
└──────────────────────────────────────────────────────────────────────────┘

1. API Request
   POST /api/v1/notifications
   {
     "userId": "...",
     "channel": "SMS",
     "content": "Your OTP is 123456"
   }

2. Validation
   ├── User exists? ✓
   ├── User has phone? ✓ (+1234567890)
   └── Rate limit OK? ✓ (2/5 SMS this hour) ⚠️ SMS is expensive!

3. Database Insert
   INSERT INTO notifications (channel='SMS', status='PENDING', ...)

4. Kafka Publish
   Topic: notifications.sms
   Message: "notification-uuid-here"

5. Consumer Picks Up
   @KafkaListener(topics = "notifications.sms")
   processSmsNotification()

6. Handler Execution
   SmsChannelHandler.send()
   ├── Validate: notificationUser.phone != null ✓
   ├── Truncate if > 160 chars (add "...")
   └── Send via provider (Twilio/Nexmo)

7. External API Call
   POST https://api.twilio.com/2010-04-01/Accounts/.../Messages
   {
     "To": "+1234567890",
     "From": "+1987654321",
     "Body": "Your OTP is 123456"
   }

8. Status Update
   UPDATE notifications SET status='SENT', sent_at=NOW()
```

### 🔔 PUSH Channel Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PUSH NOTIFICATION FLOW                           │
└──────────────────────────────────────────────────────────────────────────┘

1. API Request
   POST /api/v1/notifications
   {
     "userId": "...",
     "channel": "PUSH",
     "subject": "New Message",
     "content": "You have a new message from John"
   }

2. Validation
   ├── User exists? ✓
   ├── User has deviceToken? ✓ (fcm-token-abc123...)
   └── Rate limit OK? ✓ (5/20 push this hour)

3. Database Insert
   INSERT INTO notifications (channel='PUSH', status='PENDING', ...)

4. Kafka Publish
   Topic: notifications.push
   Message: "notification-uuid-here"

5. Consumer Picks Up
   @KafkaListener(topics = "notifications.push")
   processPushNotification()

6. Handler Execution
   PushChannelHandler.send()
   ├── Validate: notificationUser.deviceToken != null ✓
   └── Send via FCM/APNs

7. External API Call (FCM)
   POST https://fcm.googleapis.com/v1/projects/.../messages:send
   {
     "message": {
       "token": "fcm-token-abc123...",
       "notification": {
         "title": "New Message",
         "body": "You have a new message from John"
       }
     }
   }

8. Status Update
   UPDATE notifications SET status='SENT', sent_at=NOW()

9. Device Receives
   Mobile app displays push notification
```

### 📬 IN_APP Channel Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         IN-APP NOTIFICATION FLOW                          │
└──────────────────────────────────────────────────────────────────────────┘

1. API Request
   POST /api/v1/notifications
   {
     "userId": "...",
     "channel": "IN_APP",
     "subject": "New Feature Available",
     "content": "Check out our new dashboard!"
   }

2. Validation
   ├── User exists? ✓
   └── Rate limit OK? ✓ (15/100 in-app this hour)

3. Database Insert
   INSERT INTO notifications (channel='IN_APP', status='PENDING', ...)

4. Kafka Publish
   Topic: notifications.in-app
   Message: "notification-uuid-here"

5. Consumer Picks Up
   @KafkaListener(topics = "notifications.in-app")
   processInAppNotification()

6. Handler Execution
   InAppChannelHandler.send()
   ├── Validate: notificationUser != null ✓
   └── Mark as delivered (already in DB!)

7. Status Update
   UPDATE notifications SET status='DELIVERED', delivered_at=NOW()

8. User Fetches Inbox
   GET /api/v1/notifications/notificationUser/{userId}
   → Returns list of in-app notifications

9. User Reads Notification
   PATCH /api/v1/notifications/{id}/read
   → UPDATE notifications SET status='READ', read_at=NOW()
```

---

## Error Handling & Retry Flow

### Exception Handling Chain

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         EXCEPTION HANDLING FLOW                           │
└──────────────────────────────────────────────────────────────────────────┘

Controller Method
       │
       ▼
   try { ... }
       │
       ├──► ResourceNotFoundException
       │         │
       │         ▼
       │    GlobalExceptionHandler.handleResourceNotFound()
       │         │
       │         ▼
       │    HTTP 404 Not Found
       │    {
       │      "success": false,
       │      "message": "User not found with id: xxx"
       │    }
       │
       ├──► RateLimitExceededException
       │         │
       │         ▼
       │    GlobalExceptionHandler.handleRateLimit()
       │         │
       │         ▼
       │    HTTP 429 Too Many Requests
       │    Retry-After: 1800
       │    {
       │      "success": false,
       │      "message": "Rate limit exceeded for EMAIL",
       │      "data": {
       │        "channel": "EMAIL",
       │        "limit": 10,
       │        "retryAfterSeconds": 1800
       │      }
       │    }
       │
       ├──► MethodArgumentNotValidException
       │         │
       │         ▼
       │    GlobalExceptionHandler.handleValidationErrors()
       │         │
       │         ▼
       │    HTTP 400 Bad Request
       │    {
       │      "success": false,
       │      "message": "Validation failed",
       │      "data": {
       │        "userId": "User ID is required",
       │        "channel": "Channel is required"
       │      }
       │    }
       │
       └──► Exception (generic)
                 │
                 ▼
            GlobalExceptionHandler.handleGenericException()
                 │
                 ▼
            HTTP 500 Internal Server Error
            {
              "success": false,
              "message": "An unexpected error occurred"
            }
```

### Retry Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              RETRY FLOW                                   │
└──────────────────────────────────────────────────────────────────────────┘

Initial Attempt (Kafka Consumer)
       │
       ▼
   channelDispatcher.dispatch(notification)
       │
       ├──► Success
       │         │
       │         ▼
       │    status = SENT
       │    acknowledge()
       │
       └──► Failure
                 │
                 ▼
            retryCount < maxRetries? (default: 3)
                 │
         ┌──────┴──────┐
         ▼             ▼
        YES           NO
         │             │
         ▼             ▼
    status = PENDING   status = FAILED
    retryCount++       errorMessage = "Max retries exceeded"
    nextRetryAt =      → Dead Letter Queue (DLQ)
      now + delay
         │
         ▼
    Retry Delay Calculation (Exponential Backoff):
    ┌────────────────────────────────────────────┐
    │ Attempt 1: 30 seconds                      │
    │ Attempt 2: 60 seconds (30 * 2)             │
    │ Attempt 3: 120 seconds (60 * 2)            │
    │ After 3: FAILED                            │
    └────────────────────────────────────────────┘

RetryScheduler (runs every 60 seconds)
       │
       ▼
   Find notifications WHERE:
   - status = 'PENDING'
   - nextRetryAt <= NOW()
       │
       ▼
   For each notification:
   - channelDispatcher.dispatch()
   - Update status based on result
```

### Retry Scheduler Details

```
📍 File: RetryScheduler.java
📁 Location: src/main/java/com/notification/scheduler/RetryScheduler.java

@Scheduled(fixedDelayString = "${notification.retry.check-interval-ms:60000}")
public void processRetries() {
    
    // 1. Find notifications ready for retry
    List<Notification> notifications = notificationRepository
        .findReadyForProcessing(OffsetDateTime.now(), PageRequest.of(0, 100));
    
    // 2. Process each one
    for (Notification notification : notifications) {
        try {
            boolean success = channelDispatcher.dispatch(notification);
            
            if (success) {
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(OffsetDateTime.now());
            } else {
                handleRetryOrFail(notification);
            }
        } catch (Exception e) {
            handleRetryOrFail(notification);
        }
        
        notificationRepository.save(notification);
    }
}

private void handleRetryOrFail(Notification notification) {
    int maxRetries = 3;
    
    if (notification.getRetryCount() >= maxRetries) {
        notification.setStatus(NotificationStatus.FAILED);
        notification.setErrorMessage("Max retries exceeded");
    } else {
        notification.setRetryCount(notification.getRetryCount() + 1);
        notification.setNextRetryAt(calculateNextRetry(notification.getRetryCount()));
        notification.setStatus(NotificationStatus.PENDING);
    }
}
```

---

## Quick Reference

### Status State Machine

```
     ┌─────────────────────────────────────────────────────────────┐
     │                    NOTIFICATION STATUS                       │
     └─────────────────────────────────────────────────────────────┘

                              ┌─────────┐
                              │ PENDING │ ◄── Initial state
                              └────┬────┘
                                   │ Worker picks up
                                   ▼
                            ┌────────────┐
                            │ PROCESSING │
                            └──────┬─────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │ Success              │ Temp Failure         │ Perm Failure
            ▼                      ▼                      ▼
       ┌─────────┐           ┌─────────┐            ┌─────────┐
       │  SENT   │           │ PENDING │            │ FAILED  │
       └────┬────┘           │(retry)  │            └─────────┘
            │                └─────────┘
            │ Provider confirms
            ▼
      ┌───────────┐
      │ DELIVERED │
      └─────┬─────┘
            │ User reads (IN_APP only)
            ▼
       ┌─────────┐
       │  READ   │
       └─────────┘
```

### Redis Key Patterns

| Pattern | Purpose | TTL | Example |
|---------|---------|-----|---------|
| `rate:{userId}:{channel}` | Rate limiting | 1 hour | `rate:550e8400...:EMAIL` → "3" |
| `event:{eventId}` | Deduplication | 24 hours | `event:order-123` → "1" |
| `users::email:{email}` | User cache | 1 hour | `users::email:john@example.com` → User JSON |
| `templates::name:{name}` | Template cache | 1 hour | `templates::name:welcome-email` → Template JSON |

### Kafka Topics

| Topic | Purpose | Partitions | Consumer Group |
|-------|---------|------------|----------------|
| `notifications.email` | Email notifications | 3 | notification-service-email |
| `notifications.sms` | SMS notifications | 2 | notification-service-sms |
| `notifications.push` | Push notifications | 4 | notification-service-push |
| `notifications.in-app` | In-app notifications | 3 | notification-service-inapp |
| `notifications.dlq` | Dead letter queue | 1 | notification-service-dlq |

### Database Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | User information | `id`, `email`, `phone` |
| `notifications` | All notifications | `user_id`, `status`, `channel`, `created_at` |
| `notification_templates` | Message templates | `name`, `channel` |
| `user_preferences` | Channel preferences | `user_id + channel` (unique) |

---

## 📊 Complete Request Lifecycle Summary

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE NOTIFICATION LIFECYCLE                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ PHASE 1: API REQUEST (Synchronous, ~50ms)                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Client ──▶ NotificationController ──▶ NotificationService           │   │
│  │                                              │                       │   │
│  │                                              ├──▶ UserRepository     │   │
│  │                                              ├──▶ DeduplicationSvc   │   │
│  │                                              ├──▶ RateLimiterSvc     │   │
│  │                                              ├──▶ TemplateService    │   │
│  │                                              ├──▶ NotificationRepo   │   │
│  │                                              └──▶ KafkaTemplate      │   │
│  │                                                                      │   │
│  │ ◀── HTTP 201 Created (notification ID returned)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ PHASE 2: QUEUE (Asynchronous, variable)                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Kafka Topic: notifications.{channel}                                │   │
│  │ Message waits for consumer availability                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ PHASE 3: PROCESSING (Asynchronous, ~100-500ms)                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ NotificationConsumer ──▶ ChannelDispatcher ──▶ ChannelHandler       │   │
│  │                                                      │               │   │
│  │                                                      ▼               │   │
│  │                                              External Provider       │   │
│  │                                              (SendGrid/Twilio/FCM)   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ PHASE 4: DELIVERY (External, variable)                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ EMAIL: Provider ──▶ User's mailbox (seconds to minutes)            │   │
│  │ SMS:   Provider ──▶ User's phone (1-30 seconds)                    │   │
│  │ PUSH:  FCM/APNs ──▶ User's device (instant to seconds)             │   │
│  │ IN_APP: Already in DB ──▶ User fetches via API                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Debugging Tips

### Trace a Notification

1. **Find the notification ID** from API response
2. **Check database**: `SELECT * FROM notifications WHERE id = 'xxx'`
3. **Check status**:
   - `PENDING` → Still in queue or waiting for retry
   - `PROCESSING` → Consumer is handling it
   - `SENT` → Sent to provider
   - `DELIVERED` → Confirmed delivered
   - `FAILED` → Check `error_message` column

### Common Issues

| Symptom | Likely Cause | Where to Check |
|---------|--------------|----------------|
| 429 Too Many Requests | Rate limit hit | Redis: `GET rate:{userId}:{channel}` |
| Notification stuck in PENDING | Kafka consumer down | Kafka consumer logs |
| Notification stuck in PROCESSING | Consumer crashed | RetryScheduler will reset after 10 min |
| Delivery failed | Provider error | `error_message` in DB, provider dashboard |
| Duplicate notifications | Missing eventId | Use unique eventId for each event |

---

> **Document Version**: 1.0
> **Last Updated**: February 2026
> **Covers**: Notification System v1.0.0
