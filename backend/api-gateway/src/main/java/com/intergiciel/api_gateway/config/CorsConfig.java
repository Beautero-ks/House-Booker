package com.intergiciel.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origin-patterns:http://localhost:3000,http://localhost:4200,https://*.vercel.app}")
    private String allowedOriginPatterns;

    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Autorise ton frontend à lire et envoyer les cookies/headers de session
        config.setAllowCredentials(true);

        Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .forEach(config::addAllowedOriginPattern);

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
