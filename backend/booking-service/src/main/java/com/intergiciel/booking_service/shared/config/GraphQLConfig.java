package com.intergiciel.booking_service.shared.config;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.graphql.server.WebGraphQlInterceptor;

import java.util.Map;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.Date)
                .scalar(ExtendedScalars.DateTime)
                .scalar(ExtendedScalars.UUID);
    }

    @Bean
    public WebGraphQlInterceptor userIdInterceptor() {
        return (webInput, chain) -> {
            // Récupération du header injecté par la Gateway
            String userId = webInput.getHeaders().getFirst("X-User-Id");
            if (userId != null) {
                // On l'ajoute au contexte GraphQL
                webInput.configureExecutionInput((executionInput, builder) ->
                        builder.graphQLContext(Map.of("userId", Long.valueOf(userId))).build());
            }
            return chain.next(webInput);
        };
    }
}
