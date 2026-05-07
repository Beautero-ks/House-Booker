package com.intergiciel.booking_service.shared.config;

import graphql.kickstart.servlet.context.DefaultGraphQLServletContext;
import graphql.kickstart.servlet.context.GraphQLServletContext;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class GraphQLContextInterceptor implements DataFetcher {
    private final JwtDecoder jwtDecoder;

    public GraphQLContextInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Object get(DataFetchingEnvironment environment) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                Jwt jwt = jwtDecoder.decode(token);
                Long userId = Long.parseLong(jwt.getSubject());
                environment.getContext().put("userId", userId);
            } catch (Exception e) {
                throw new RuntimeException("Token JWT invalide", e);
            }
        }
        return null;
    }
}
