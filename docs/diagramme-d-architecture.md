# 🏗️ **HouseBooker — Diagrammes d'Architecture**

---

## 🔁 **Flux Global des Requêtes**

```mermaid
flowchart TD
    A["Client\n(Web/Mobile)"] -->|HTTP/HTTPS| B[Nginx\nReverse Proxy]
    B -->|to| C["API Gateway\n(JWT Check)"]
    C --> D[Eureka\nService Discovery]
    D -->|to| E["Microservices\n(Auth, Booking, House, etc.)"]
    E --> F[Database]
    F -->|to| G[Response]
    G --> A
```
---
![Flux global des requêtes](./imgs/flux-global-requetes.png)
---

### **Description du Flux**

1. **Client** : Envoie une requête HTTP/HTTPS.
2. **Nginx** : Termine le SSL/TLS et redirige vers l'API Gateway.
3. **API Gateway** :
- Valide le token JWT.
- Filtre les requêtes.
4. **Eureka** : Fournit l'adresse du service cible.
5. **Microservice** : Traite la requête.
6. **Base de Données** : Stocke ou récupère les données.
7. **Réponse** : Retourne le résultat au client.

---

## 📡 **Architecture Event-Driven avec Kafka**

```mermaid
flowchart LR
    subgraph Auth-Service
        A1[Auth-Service] -->|user.created| T1[user.created\nTopic]
    end

    subgraph Booking-Service
        B1[Booking-Service] -->|booking.created| T2[booking.created\nTopic]
    end

    subgraph Payment-Service
        P1[Payment-Service] -->|payment.completed| T3[payment.completed\nTopic]
    end

    subgraph Review-Service
        R1[Review-Service] -->|review.created| T4[review.created\nTopic]
    end

    T1 --> U1[User-Service]
    T1 --> N1[Notification-Service]

    T2 --> P1
    T2 --> N2[Notification-Service]
    T2 --> C1[Contract-Service]

    T3 --> C2[Contract-Service]
    T3 --> N3[Notification-Service]
    T3 --> B2[Booking-Service]

    T4 --> H1[House-Service]
    T4 --> S1[Search-Service]
    T4 --> N4[Notification-Service]
```
---
![Architecture event-driven avec kafka](./imgs/architecture-event-driven.png)
---

### **Description des Topics et Événements**

#### **👤 user.created**

- **Émis par** : Auth-Service
- **Consommé par** :
    - User-Service
    - Notification-Service

#### **📅 booking.created**

- **Émis par** : Booking-Service
- **Consommé par** :
    - Payment-Service
    - Notification-Service
    - Contract-Service

#### **💳 payment.completed**

- **Émis par** : Payment-Service
- **Consommé par** :
    - Contract-Service
    - Notification-Service
    - Booking-Service

#### **⭐ review.created**

- **Émis par** : Review-Service
- **Consommé par** :
    - House-Service (mise à jour du rating)
    - Search-Service (indexation)
    - Notification-Service

---

## 🎯 **Avantages de l'Architecture Event-Driven**

- **Découplage total des services** : Chaque service évolue indépendamment.
- **Communication asynchrone** : Meilleure tolérance aux pannes et scalabilité.
- **Résilience** : Un service en panne n'affecte pas les autres.
- **Extensibilité** : Ajout facile de nouveaux consommateurs d'événements.

---

## 📌 **Exemple de Séquence : Réservation Complète**

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Booking_Service
    participant Kafka
    participant Payment_Service
    participant Contract_Service
    participant Notification_Service

    Client->>API_Gateway: POST /api/bookings (avec JWT)
    API_Gateway->>Booking_Service: Valide JWT et route la requête
    Booking_Service->>Kafka: Publie booking.created
    Kafka->>Payment_Service: Consomme booking.created
    Payment_Service->>Kafka: Publie payment.completed
    Kafka->>Contract_Service: Consomme payment.completed
    Kafka->>Notification_Service: Consomme payment.completed
    Contract_Service->>Client: Retourne le contrat généré
    Notification_Service->>Client: Envoie un email de confirmation
```
---
![Exemple de diagramme de sequence complet de reservation](./imgs/sequence-reservation.png)
### **Description de la Séquence**

1. Le client envoie une requête de réservation.
2. L'API Gateway valide le JWT et route la requête vers `Booking-Service`.
3. `Booking-Service` publie un événement `booking.created` sur Kafka.
4. `Payment-Service` consomme l'événement et initie le paiement.
5. Une fois le paiement validé, `Payment-Service` publie `payment.completed`.
6. `Contract-Service` et `Notification-Service` consomment l'événement pour générer un contrat et envoyer une notification.