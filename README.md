# 🏠 HouseBooker

> Plateforme de location immobilière moderne basée sur une architecture microservices, sécurisée et scalable.

---

## 🚀 Aperçu

HouseBooker est une application web permettant de connecter **locataires**, **propriétaires** et **administrateurs** autour d’un système centralisé de gestion immobilière.

Elle permet de :

* rechercher et réserver des logements
* gérer des annonces immobilières
* effectuer des paiements sécurisés
* générer des contrats automatiquement
* communiquer en temps réel

---

## 🧩 Architecture

L’application repose sur une architecture **microservices distribuée** :

* Reverse Proxy (Nginx)
* API Gateway (Spring Cloud Gateway)
* Service Discovery (Eureka)
* Communication hybride : REST + Kafka
* Authentification via JWT
* Base de données indépendante par service

---

## 🛠️ Stack technique

### Backend

* Spring Boot
* Spring Cloud (Gateway, Eureka)
* Apache Kafka
* PostgreSQL

### Frontend

* React (ou Angular)

### DevOps

* Docker & Docker Compose
* AWS EC2 (déploiement)

---

## 🔐 Sécurité

* Authentification centralisée (JWT)
* Gestion des rôles et permissions
* Double validation (Gateway + microservices)
* Protection des endpoints

---

## 📦 Microservices

| Service              | Description            |
| -------------------- | ---------------------- |
| Auth-Service         | Authentification & JWT |
| User-Service         | Profil utilisateur     |
| House-Service        | Gestion des logements  |
| Booking-Service      | Réservations           |
| Payment-Service      | Paiements              |
| Billing-Service      | Facturation            |
| Review-Service       | Avis                   |
| Messaging-Service    | Chat                   |
| Notification-Service | Notifications          |
| Contract-Service     | Génération PDF         |
| Admin-Service        | Supervision            |
| Search-Service       | Recherche avancée      |

---

## 🔁 Fonctionnalités

* 🔍 Recherche avancée de logements
* 📅 Réservation avec gestion des dates
* 💳 Paiement sécurisé
* 📄 Génération automatique de contrats
* ⭐ Système d’avis
* 💬 Messagerie temps réel
* 🔔 Notifications système

---

## 📁 Structure du projet

```
project-root/
│
├── backend/
├── frontend/
├── infrastructure/
├── docs/
└── README.md
```

---

## ⚙️ Installation (local)

### Prérequis

* Docker
* Docker Compose

### Lancer le projet

```bash
git clone <repo-url>
cd project-root
docker-compose up -d
```

---

## 🌐 Accès

* Frontend : http://localhost
* API Gateway : http://localhost:8080

---

## ☁️ Déploiement

* Déployé sur AWS EC2
* Orchestration via Docker Compose
* Évolutif vers Kubernetes

---

## 📈 Roadmap

* [ ] Intégration paiement réel
* [ x] Notifications push
* [ ] Monitoring (Prometheus / Grafana)
* [ ] Déploiement Kubernetes

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`feature/ma-feature`)
3. Commit
4. Push
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 👨‍💻 Auteur

Projet académique inspiré des architectures modernes utilisées en entreprise.
