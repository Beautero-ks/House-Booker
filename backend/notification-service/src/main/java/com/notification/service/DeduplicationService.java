package com.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeduplicationService {

    private final StringRedisTemplate redisTemplate;

    @Value("${notification.dedupe.ttl-seconds:86400}")
    private int ttlSeconds; // 24h par défaut

    /**
     * Vérifie si un eventId a déjà été traité.
     * @param eventId identifiant unique de l'événement
     * @return true si déjà vu (duplicata), false sinon
     */
    public boolean isDuplicate(String eventId) {
        String key = "dedupe:" + eventId;
        Boolean alreadyExists = redisTemplate.opsForValue().setIfAbsent(key, "1", Duration.ofSeconds(ttlSeconds));
        // setIfAbsent retourne true si la clé n'existait pas, false sinon
        return !Boolean.TRUE.equals(alreadyExists);
    }
}