package com.intergiciel.notification_service.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;

@Configuration
public class Resilience4jConfig {

    @Bean
    public RetryRegistry retryRegistry() {
        RetryConfig retryConfig = RetryConfig.custom()
                .maxAttempts(5)
                .waitDuration(Duration.ofSeconds(2))
                .retryExceptions(Exception.class)           // Retry sur toutes les exceptions
                .failAfterMaxAttempts(false)
                .build();

        return RetryRegistry.of(retryConfig);
    }
}