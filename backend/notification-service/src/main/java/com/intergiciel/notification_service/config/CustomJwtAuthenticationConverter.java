package com.intergiciel.notification_service.config;

import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Extraire les rôles ou claims personnalisés
        List<String> roles = jwt.getClaimAsStringList("roles");
        
        return new JwtAuthenticationToken(jwt, List.of(), jwt.getSubject());
    }
}