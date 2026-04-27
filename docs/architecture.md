# 🏗️ **Architecture Technique — HouseBooker**

---

## 📌 **1. Introduction**

**HouseBooker** est une plateforme de location immobilière conçue avec une **architecture microservices** pour offrir une solution **scalable**, **maintenable**, et **sécurisée**. Elle permet aux locataires, propriétaires et administrateurs d'interagir de manière fluide et sécurisée.

### **Objectifs Clés**

- **Scalabilité** : Supporter une croissance rapide du nombre d'utilisateurs et de logements.
- **Résilience** : Garantir une disponibilité élevée grâce à une architecture distribuée.
- **Sécurité** : Protéger les données sensibles (paiements, contrats, informations personnelles).
- **Évolutivité** : Faciliter l'ajout de nouvelles fonctionnalités sans impacter les services existants.

---

## 🧠 **2. Vue d’ensemble de l’architecture**

L’architecture de HouseBooker est organisée en **plusieurs couches logiques** :

1. **Client (Frontend)** : Application web (React/Angular/Vue.js).
2. **Reverse Proxy (Nginx)** : Gestion du trafic HTTPS et routage vers l'API Gateway.
3. **API Gateway** : Point d'entrée unique pour les requêtes clients, avec authentification et routage dynamique.
4. **Service Discovery (Eureka)** : Enregistrement et découverte des microservices.
5. **Microservices Métier** : Services indépendants pour chaque fonctionnalité (authentification, réservations, paiements, etc.).
6. **Communication Asynchrone (Kafka)** : Échanges d'événements entre services pour un découplage maximal.
7. **Bases de Données Indépendantes** : Chaque microservice possède sa propre base de données (PostgreSQL, MongoDB, etc.).

---

## 🌐 **3. Flux Global des Requêtes**

Voici le parcours d'une requête typique dans HouseBooker :

1. **Client** : Envoie une requête HTTP/HTTPS (ex: `POST /api/bookings`).
2. **Nginx** : Termine le SSL/TLS et redirige vers l'API Gateway.
3. **API Gateway** :
- Valide le token JWT.
- Interroge Eureka pour localiser le service cible (`booking-service`).
4. **Microservice** : Traite la requête (ex: création d'une réservation).
5. **Kafka** : Publie un événement (ex: `BookingCreatedEvent`).
6. **Autres Microservices** : Réagissent à l'événement (ex: `payment-service` traite le paiement).
7. **Réponse** : Retourne le résultat au client.

### 💡 **Pour visualiser ce processus :**
Les diagrammes d'architecture détaillés sont consultables via ce lien ([voir les diagrammes](./diagramme-d-architecture.md)) vers les schémas pour mieux comprendre les interactions de ce flux.

## 🧱 **4. Composants Principaux**

---

### 🌍 **Reverse Proxy — Nginx**

**Rôle** :

- Point d'entrée public pour le trafic HTTP/HTTPS.
- Terminaison SSL/TLS.
- Routage vers l'API Gateway.
- Protection contre les attaques DDoS (limitation de débit).

**Configuration Exemple** :

```nginx
server {
    listen 443 ssl;
    server_name housebooker.com;

    ssl_certificate /etc/letsencrypt/live/housebooker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/housebooker.com/privkey.pem;

    location / {
        proxy_pass http://api-gateway:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 🚪 **API Gateway**

**Rôle** :

- Routage dynamique des requêtes vers les microservices.
- Validation des tokens JWT.
- Filtrage et logging des requêtes.
- Load balancing entre instances de services.

**Technologies** :

- Spring Cloud Gateway.
- Intégration avec Eureka pour la découverte de services.

**Exemple de Configuration** (`application.yml`) :

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: booking-service
          uri: lb://booking-service
          predicates:
            - Path=/api/bookings/**
          filters:
            - name: JWTValidation
            - name: RequestLogging
```

---

### 🔍 **Service Discovery — Eureka**

**Rôle** :

- Enregistrement automatique des microservices.
- Résolution dynamique des adresses IP/ports.
- Load balancing intégré.

**Configuration Minimale** (`application.yml`) :

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
```

---

### 📡 **Event Streaming — Kafka**

**Rôle** :

- Communication asynchrone entre services.
- Découplage des microservices.
- Propagation d'événements métier (ex: `PaymentCompletedEvent`).

**Topics Principaux** :


| Topic                 | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `user-events`         | Événements liés aux utilisateurs (création, mise à jour). |
| `booking-events`      | Réservations (création, annulation).                      |
| `payment-events`      | Paiements (succès, échec).                                |
| `notification-events` | Notifications (emails, SMS).                              |


**Exemple de Producteur Kafka (Spring Boot)** :

```java
@KafkaListener(topics = "booking-events")
public void handleBookingEvent(BookingEvent event) {
    if (event.getType().equals("BOOKING_CREATED")) {
        // Logique métier (ex: envoyer un email de confirmation)
    }
}
```

---

## 🧩 **5. Microservices**

Chaque microservice est **autonome** et possède :

- Sa propre base de données.
- Ses dépendances spécifiques.
- Son cycle de déploiement indépendant.

---

### 🔐 **Auth-Service**

**Responsabilités** :

- Authentification (login, logout).
- Génération et validation des tokens JWT.
- Gestion des rôles et permissions (ex: `ROLE_USER`, `ROLE_ADMIN`).

**Endpoints** :


| Méthode | Endpoint             | Description                     |
| ------- | -------------------- | ------------------------------- |
| POST    | `/api/auth/register` | Inscription d'un utilisateur.   |
| POST    | `/api/auth/login`    | Connexion et génération de JWT. |
| GET     | `/api/auth/validate` | Validation d'un token JWT.      |


**Base de Données** :

- Table `users` (id, email, password_hash, role).
- Table `tokens` (token, user_id, expiry_date).

---

### 👤 **User-Service**

**Responsabilités** :

- Gestion des profils utilisateurs.
- Mise à jour des informations personnelles.

**Endpoints** :


| Méthode | Endpoint          | Description              |
| ------- | ----------------- | ------------------------ |
| GET     | `/api/users/{id}` | Récupérer un profil.     |
| PUT     | `/api/users/{id}` | Mettre à jour un profil. |


**Base de Données** :

- Table `profiles` (id, user_id, first_name, last_name, phone).

---

### 🏠 **House-Service**

**Responsabilités** :

- Publication et gestion des logements.
- Recherche et filtrage (intègre `search-service`).

**Endpoints** :


| Méthode | Endpoint           | Description            |
| ------- | ------------------ | ---------------------- |
| POST    | `/api/houses`      | Ajouter un logement.   |
| GET     | `/api/houses`      | Lister les logements.  |
| GET     | `/api/houses/{id}` | Détails d'un logement. |


**Base de Données** :

- Table `houses` (id, owner_id, title, description, price, address).
- Table `amenities` (house_id, wifi, parking, etc.).

---

### 📅 **Booking-Service**

**Responsabilités** :

- Création et gestion des réservations.
- Vérification des disponibilités.

**Endpoints** :


| Méthode | Endpoint                    | Description                |
| ------- | --------------------------- | -------------------------- |
| POST    | `/api/bookings`             | Créer une réservation.     |
| GET     | `/api/bookings/{id}`        | Détails d'une réservation. |
| PUT     | `/api/bookings/{id}/cancel` | Annuler une réservation.   |


**Base de Données** :

- Table `bookings` (id, user_id, house_id, start_date, end_date, status).
- Table `availability` (house_id, date, is_available).

---

### 💳 **Payment-Service**

**Responsabilités** :

- Traitement des paiements (Mobile Money, cartes bancaires).
- Génération de reçus.

**Endpoints** :


| Méthode | Endpoint             | Description            |
| ------- | -------------------- | ---------------------- |
| POST    | `/api/payments`      | Traiter un paiement.   |
| GET     | `/api/payments/{id}` | Détails d'un paiement. |


**Base de Données** :

- Table `payments` (id, booking_id, amount, method, status, transaction_id).

---

### 💰 **Billing-Service**

**Responsabilités** :

- Génération de factures mensuelles.
- Suivi des paiements et relances.

**Endpoints** :


| Méthode | Endpoint                | Description              |
| ------- | ----------------------- | ------------------------ |
| GET     | `/api/billing/{userId}` | Historique des factures. |
| POST    | `/api/billing/generate` | Générer une facture.     |


**Base de Données** :

- Table `invoices` (id, user_id, amount, due_date, status).

---

### ⭐ **Review-Service**

**Responsabilités** :

- Gestion des avis et notations.
- Calcul des notes moyennes par logement.

**Endpoints** :


| Méthode | Endpoint                 | Description                    |
| ------- | ------------------------ | ------------------------------ |
| POST    | `/api/reviews`           | Ajouter un avis.               |
| GET     | `/api/reviews/{houseId}` | Lister les avis d'un logement. |


**Base de Données** :

- Table `reviews` (id, user_id, house_id, rating, comment, date).

---

### 💬 **Messaging-Service**

**Responsabilités** :

- Messagerie en temps réel entre utilisateurs.
- Historique des conversations.

**Endpoints** :


| Méthode | Endpoint                 | Description                  |
| ------- | ------------------------ | ---------------------------- |
| POST    | `/api/messages`          | Envoyer un message.          |
| GET     | `/api/messages/{userId}` | Récupérer les conversations. |


**Base de Données** :

- Table `messages` (id, sender_id, receiver_id, content, timestamp, is_read).

---

### 🔔 **Notification-Service**

**Responsabilités** :

- Envoi d'emails et notifications push.
- Gestion des templates de notifications.

**Endpoints** :


| Méthode | Endpoint             | Description               |
| ------- | -------------------- | ------------------------- |
| POST    | `/api/notifications` | Envoyer une notification. |


**Technologies** :

- Intégration avec SendGrid pour les emails.
- Firebase Cloud Messaging (FCM) pour les notifications push.

---

### 📄 **Contract-Service**

**Responsabilités** :

- Génération de contrats de location (PDF).
- Stockage sécurisé des documents.

**Endpoints** :


| Méthode | Endpoint                     | Description           |
| ------- | ---------------------------- | --------------------- |
| GET     | `/api/contracts/{bookingId}` | Récupérer un contrat. |
| POST    | `/api/contracts`             | Générer un contrat.   |


**Technologies** :

- Bibliothèque PDF (ex: Apache PDFBox).
- Stockage dans un bucket S3 (AWS) ou équivalent.

---

### 🔎 **Search-Service** (Optionnel)

**Responsabilités** :

- Indexation et recherche avancée des logements.
- Filtres par localisation, prix, équipements.

**Technologies** :

- Elasticsearch pour la recherche full-text.
- Intégration avec `house-service` pour les données.

---

### 🛠️ **Admin-Service**

**Responsabilités** :

- Supervision globale de la plateforme.
- Validation des logements et des comptes.
- Gestion des remboursements.

**Endpoints** :


| Méthode | Endpoint                       | Description              |
| ------- | ------------------------------ | ------------------------ |
| GET     | `/api/admin/users`             | Lister les utilisateurs. |
| PUT     | `/api/admin/users/{id}/verify` | Valider un compte.       |
| GET     | `/api/admin/stats`             | Statistiques globales.   |


**Base de Données** :

- Accès en lecture aux bases des autres services (via APIs).

---

## 🗄️ **6. Gestion des Données**

### **Principe Fondamental**

👉 **1 Microservice = 1 Base de Données**

**Avantages** :

- **Indépendance** : Chaque service peut évoluer sans impacter les autres.
- **Résilience** : Une panne ne bloque pas l'ensemble du système.
- **Scalabilité** : Chaque base peut être optimisée pour son usage (ex: PostgreSQL pour les données relationnelles, MongoDB pour les documents).

**Exemple de Schéma pour `booking-service**` :

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    house_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (house_id) REFERENCES houses(id)
);

CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    house_id INT NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE (house_id, date),
    FOREIGN KEY (house_id) REFERENCES houses(id)
);
```

---

## 🔐 **7. Sécurité**

### 🎟️ **Authentification**

- **JWT (JSON Web Tokens)** :
    - Générés par `auth-service` après login.
    - Stockés côté client (localStorage ou cookies HTTP-only).
    - Validés par l'API Gateway et les microservices.

**Structure d'un JWT** :

```json
{
  "sub": "user123",
  "roles": ["USER"],
  "exp": 1735689600,
  "iat": 1735603200
}
```

### 🛡️ **Autorisation**

- **Rôles et Permissions** :
    - Définis dans le token JWT (ex: `ROLE_USER`, `ROLE_ADMIN`).
    - Vérifiés par :
        1. L'API Gateway (filtrage initial).
        2. Les microservices (validation fine).

**Exemple de Vérification dans un Microservice** (Spring Security) :

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/stats")
public ResponseEntity<?> getStats() {
    // Logique métier
}
```

### 🔒 **Bonnes Pratiques**

1. **Pas de Base de Données Partagée** : Chaque service gère ses données.
2. **Validation Côté Backend** : Toujours valider les entrées, même si le frontend le fait.
3. **Chiffrement** :
- Données sensibles (ex: mots de passe) hashées avec BCrypt.
- Communications chiffrées (TLS 1.3).
4. **Audit Logs** : Journalisation des actions critiques (ex: changements de rôle).

---

## 🔁 **8. Communication Inter-Services**

### 🔹 **REST (Synchrone)**

- Utilisé pour :
    - Les requêtes directes (ex: `user-service` → `house-service`).
    - La récupération de données en temps réel.
- **Outils** : Spring WebClient ou Feign Client.

**Exemple avec Feign Client** :

```java
@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}
```

### 🔹 **Kafka (Asynchrone)**

- Utilisé pour :
    - Les événements métier (ex: `BookingCreatedEvent`).
    - Le découplage des services.
- **Avantages** :
    - Résilience (un service en panne ne bloque pas les autres).
    - Scalabilité (les consommateurs peuvent traiter les événements à leur rythme).

**Exemple de Consommateur Kafka** :

```java
@Service
public class PaymentEventConsumer {

    @KafkaListener(topics = "payment-events")
    public void handlePaymentEvent(PaymentEvent event) {
        if (event.getStatus().equals("COMPLETED")) {
            // Mettre à jour le statut de la réservation
        }
    }
}
```

### 📡 **Exemples d’Événements Kafka**


| Événement               | Description                 | Producteur        | Consommateurs                                                 |
| ----------------------- | --------------------------- | ----------------- | ------------------------------------------------------------- |
| `UserCreatedEvent`      | Nouvel utilisateur inscrit. | `auth-service`    | `notification-service`, `user-service`                        |
| `BookingCreatedEvent`   | Nouvelle réservation créée. | `booking-service` | `payment-service`, `contract-service`, `notification-service` |
| `PaymentCompletedEvent` | Paiement validé.            | `payment-service` | `booking-service`, `notification-service`                     |
| `ReviewSubmittedEvent`  | Nouvel avis soumis.         | `review-service`  | `house-service` (mise à jour de la note moyenne)              |


---

## 🔄 **9. Cas d’Usage — Réservation Complète**

### **Séquence Détaillée**

1. **Utilisateur** : Soumet une réservation via le frontend (`POST /api/bookings`).
2. **API Gateway** :
- Valide le JWT.
- Route la requête vers `booking-service`.
3. **Booking-Service** :
- Vérifie la disponibilité du logement.
- Crée une réservation avec statut `PENDING`.
- Publie un `BookingCreatedEvent` sur Kafka.
4. **Payment-Service** (consommateur Kafka) :
- Reçoit l'événement et initie le paiement.
- Met à jour le statut de la réservation (`PAID` ou `FAILED`).
- Publie un `PaymentCompletedEvent` ou `PaymentFailedEvent`.
5. **Contract-Service** (consommateur Kafka) :
- Génère un contrat PDF si le paiement est validé.
- Stocke le contrat dans un bucket S3.
6. **Notification-Service** (consommateur Kafka) :
- Envoie un email de confirmation au locataire et au propriétaire.
7. **Frontend** : Met à jour l'interface utilisateur (ex: affiche le contrat).

---

## 🐳 **10. Déploiement**

### 🔹 **Environnement Actuel**

- **Docker** : Conteneurisation des services.
- **Docker Compose** : Orchestration locale.
- **AWS EC2** : Hébergement des conteneurs.

**Exemple de `docker-compose.yml**` :

```yaml
version: '3.8'

services:
  eureka-server:
    image: housebooker/eureka-server
    ports:
      - "8761:8761"

  api-gateway:
    image: housebooker/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server

  auth-service:
    image: housebooker/auth-service
    depends_on:
      - eureka-server
      - postgres-auth

  postgres-auth:
    image: postgres:13
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data

volumes:
  postgres-auth-data:
```

### 🔹 **Évolution Possible**

- **Kubernetes** : Pour une orchestration avancée (scaling automatique, self-healing).
- **Multi-Cloud** : Déploiement sur AWS + Azure pour la redondance.
- **Serverless** : Utilisation d'AWS Lambda pour certains services (ex: `contract-service`).

---

## 📁 **11. Structure du Projet**

```
project-root/
│
├── backend/
│   ├── api-gateway/                  # Spring Cloud Gateway
│   ├── eureka-server/                # Service Discovery
│   ├── auth-service/                 # Authentification
│   ├── user-service/                 # Profils utilisateurs
│   ├── house-service/                # Logements
│   ├── booking-service/              # Réservations
│   ├── payment-service/              # Paiements
│   ├── billing-service/              # Facturation
│   ├── review-service/               # Avis
│   ├── messaging-service/            # Messagerie
│   ├── notification-service/         # Notifications
│   ├── contract-service/             # Contrats
│   ├── search-service/               # Recherche (optionnel)
│   └── admin-service/                # Administration
│
├── frontend/
│   └── web-app/                      # Application React/Angular
│
├── infrastructure/
│   ├── nginx/                        # Configuration Nginx
│   ├── docker-compose.yml           # Orchestration locale
│   └── kubernetes/                   # Manifests Kubernetes (futur)
│
├── docs/
│   ├── architecture.md              # Ce document
│   ├── api-specs/                    # Spécifications OpenAPI
│   └── deployment.md                 # Guide de déploiement
│
└── README.md                         # Instructions générales
```

---

## 📈 **12. Scalabilité**

### **Stratégies Clés**

1. **Scaling Horizontal** :
- Ajout d'instances pour les services critiques (ex: `booking-service` pendant les pics de réservation).
- Utilisation de Kubernetes pour le scaling automatique.
2. **Caching** :
- Redis pour mettre en cache les données fréquemment accédées (ex: détails des logements).
3. **Base de Données** :
- Réplication des bases de données (ex: PostgreSQL avec réplicas en lecture).
- Partitionnement des tables (ex: `bookings` par région).
4. **Kafka** :
- Partitionnement des topics pour paralléliser la consommation.
- Augmentation du nombre de brokers pour améliorer le débit.

---

## ⚠️ **13. Limitations et Risques**


| Limitation/Risque       | Impact                                    | Atténuation                                               |
| ----------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Complexité accrue       | Maintenance difficile                     | Documentation complète, tests automatisés.                |
| Latence Kafka           | Délais dans la propagation des événements | Optimisation des consommateurs.                           |
| Coût infrastructure     | Budget élevé                              | Utilisation de services managés (ex: AWS MSK pour Kafka). |
| Consistance des données | Risque de désynchronisation               | Transactions distribuées (Saga Pattern).                  |


---

## 🎯 **14. Conclusion**

L’architecture de **HouseBooker** combine les meilleures pratiques des systèmes distribués modernes :

- **Microservices** pour une modularité maximale.
- **Kafka** pour une communication asynchrone et résiliente.
- **Sécurité** intégrée à tous les niveaux (JWT, chiffrement, audit).
- **Scalabilité** horizontale et verticale.

### **Prochaines Étapes**

1. **Implémenter les Services de Base** : Commencer par `auth-service`, `user-service`, et `house-service`.
2. **Configurer Kafka** : Définir les topics et les consommateurs.
3. **Automatiser les Tests** : Intégrer des tests unitaires et d’intégration.
4. **Déployer en Staging** : Valider l’architecture avant la production.