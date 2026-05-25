package com.intergiciel.booking_service.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;


@Configuration
public class GraphQLSecurityConfig {

    @Bean
    public WebGraphQlInterceptor userInterceptor() {

        return (webInput, chain) -> {

            Authentication authentication =
                    (Authentication) webInput.getAttributes()
                            .get("org.springframework.security.core.Authentication");

            if (authentication != null
                    && authentication.getPrincipal() instanceof Jwt jwt) {

                webInput.configureExecutionInput((executionInput, builder) ->
                        builder.graphQLContext(contextBuilder -> {

                            contextBuilder.put(
                                    "userId",
                                    jwt.getSubject()
                            );

                            contextBuilder.put(
                                    "jwt",
                                    jwt
                            );

                        }).build()
                );
            }

            return chain.next(webInput);
        };
    }
}
