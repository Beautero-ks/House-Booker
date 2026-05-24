package com.intergiciel.api_gateway.filter;

import com.intergiciel.api_gateway.config.JwtUtils;
import io.jsonwebtoken.Claims;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    public static class Config {
        // Vous pouvez ajouter des propriétés de configuration ici si nécessaire
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. Vérifier la présence du header Authorization
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Header Authorization manquant", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Format de token invalide", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // 2. Valider le token
            if (jwtUtils.isInvalid(token)) {
                return onError(exchange, "Token JWT invalide ou expiré", HttpStatus.UNAUTHORIZED);
            }

            // 3. Extraire les infos (ex: subject/userId) et les propager aux microservices
            Claims claims = jwtUtils.getClaims(token);
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", claims.getSubject()) // Transmet l'ID unique de l'utilisateur
                    // .header("X-User-Roles", claims.get("roles").toString()) // Optionnel : si vous gérez des rôles
                    .build();

            // Continuer la chaîne avec la requête modifiée
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // Vous pouvez aussi écrire un corps de réponse JSON ici si nécessaire
        return response.setComplete();
    }
}
