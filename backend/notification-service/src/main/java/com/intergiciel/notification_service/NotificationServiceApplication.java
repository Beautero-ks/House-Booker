package com.intergiciel.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
public class NotificationServiceApplication {
    
    public static void main(String[] args) {
        // Lancer Spring Boot avec les bonnes options JVM
        // PAS DE HACK - configuration propre uniquement
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
