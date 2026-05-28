package com.intergiciel.auth_service.config;

import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.repository.UserRepository;
import com.intergiciel.auth_service.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            try {
                if (tokenService.validateAccessToken(token)) {
                    String userId = tokenService.extractUserId(token);
                    UUID userUuid = UUID.fromString(userId);
                    userRepository.findByIdAndDeletedAtIsNull(userUuid)
                            .filter(User::isEnabled)
                            .ifPresent(user -> {
                                List<SimpleGrantedAuthority> authorities = List.of(
                                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                                );
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(user, null, authorities);
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                            });
                }
            } catch (Exception ex) {
                log.debug("[JwtAuthenticationFilter] Token invalide ou absence d'authentification : {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
