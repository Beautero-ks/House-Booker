package com.notification;

// =========================================================================
// NotificationServiceApplication.java - Point d'entrée principal
// =========================================================================
//
// Cette classe est le point de départ de l'application Spring Boot.
// Quand vous l'exécutez, Spring Boot :
// 1. Démarre un serveur Tomcat embarqué
// 2. Scanne les composants (@Controller, @Service, etc.)
// 3. Configure les connexions à la base de données, Redis, Kafka
// 4. Enregistre le service auprès d'Eureka (service discovery)
// 5. Rend l'API disponible sur le port configuré (8083 par défaut)
//

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application principale du microservice Notification
 * 
 * @SpringBootApplication combine :
 *   - @Configuration : déclare des beans Spring
 *   - @EnableAutoConfiguration : configure automatiquement selon les dépendances (JPA, Kafka, Redis...)
 *   - @ComponentScan : scanne les composants dans ce package et ses sous-packages
 *
 * @EnableDiscoveryClient : permet l'enregistrement du service auprès d'Eureka
 * (le service pourra être découvert par l'API Gateway et les autres microservices)
 *
 * @EnableScheduling : active les tâches planifiées (ex: nettoyage des logs, réessais)
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class NotificationServiceApplication {

    /**
     * Méthode principale - point d'entrée de l'application
     *
     * SpringApplication.run() :
     * 1. Crée le contexte Spring (ApplicationContext)
     * 2. Enregistre tous les beans Spring
     * 3. Démarre le serveur web embarqué
     *
     * @param args arguments de la ligne de commande (éventuels)
     */
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);

        // Une fois démarré, l'API est accessible à l'adresse :
        // - API REST : http://localhost:8083 (port défini dans application.yml)
        // - Swagger UI : http://localhost:8083/swagger-ui.html
        // - Health check : http://localhost:8083/actuator/health
        // - Eureka : le service apparaît dans la liste des instances
    }
}