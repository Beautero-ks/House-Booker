package com.intergiciel.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Autorise ton frontend à lire et envoyer les cookies/headers de session
        config.setAllowCredentials(true);

        // Ajoute ici l'adresse exacte (origine) de ton application frontend
        config.addAllowedOrigin("http://localhost:4200"); // Port Angular typique
        config.addAllowedOrigin("http://localhost:3000"); // Port React/Next/Vue typique

        // Autorise tous les headers (Authorization, Content-Type, etc.)
        config.addAllowedHeader("*");

        // Autorise toutes les méthodes HTTP (POST pour GraphQL, GET, OPTIONS, etc.)
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Applique cette configuration CORS sur absolument toutes les routes de la Gateway
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}