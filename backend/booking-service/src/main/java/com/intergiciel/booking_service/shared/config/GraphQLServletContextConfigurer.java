package com.intergiciel.booking_service.shared.config;

import io.jsonwebtoken.Jwt;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

@Configuration
public class GraphQLServletContextConfigurer {
    private final JwtDecoder jwtDecoder;

    public GraphQLServletContextConfigurer(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Bean
    public GraphQLServletContextBuilder graphQLServletContextBuilder() {
        return (request, response) -> {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    UUID userId = (jwt.getSubject());
                    return new DefaultGraphQLServletContext(request, response, userId);
                } catch (Exception e) {
                    throw new RuntimeException("Token JWT invalide", e);
                }
            }
            return new DefaultGraphQLServletContext(request, response);
        };
    }
}
