package com.notification.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.notification.model.enums.ChannelType;

import java.time.Duration;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    @Value("${notification.rate-limit.email.max-requests:10}")
    private int emailMaxRequests;

    @Value("${notification.rate-limit.email.window-seconds:3600}")
    private int emailWindowSeconds;

    @Value("${notification.rate-limit.sms.max-requests:5}")
    private int smsMaxRequests;

    @Value("${notification.rate-limit.sms.window-seconds:3600}")
    private int smsWindowSeconds;

    @Value("${notification.rate-limit.push.max-requests:20}")
    private int pushMaxRequests;

    @Value("${notification.rate-limit.push.window-seconds:3600}")
    private int pushWindowSeconds;

    @Value("${notification.rate-limit.in-app.max-requests:100}")
    private int inAppMaxRequests;

    @Value("${notification.rate-limit.in-app.window-seconds:3600}")
    private int inAppWindowSeconds;

    /**
     * Vérifie si l'utilisateur a dépassé sa limite de débit pour un canal donné.
     * Lève une exception si la limite est atteinte.
     */
    public void checkAndIncrement(UUID userId, ChannelType channel) {
        String key = buildKey(userId, channel);
        long current = redisTemplate.opsForValue().increment(key);
        if (current == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(getWindowSeconds(channel)));
        }
        int max = getMaxRequests(channel);
        if (current > max) {
            throw new RuntimeException("Limite de débit dépassée pour le canal " + channel +
                    ". Maximum " + max + " requêtes par " + getWindowSeconds(channel) + " secondes.");
        }
    }

    /**
     * Vérifie si l'utilisateur a dépassé sa limite sans incrémenter.
     */
    public boolean isRateLimited(UUID userId, ChannelType channel) {
        String key = buildKey(userId, channel);
        String val = redisTemplate.opsForValue().get(key);
        if (val == null) return false;
        long current = Long.parseLong(val);
        return current >= getMaxRequests(channel);
    }

    private String buildKey(UUID userId, ChannelType channel) {
        return "rate:limit:" + channel.name().toLowerCase() + ":" + userId.toString();
    }

    private int getMaxRequests(ChannelType channel) {
        return switch (channel) {
            case EMAIL -> emailMaxRequests;
            case SMS -> smsMaxRequests;
            case PUSH -> pushMaxRequests;
            case IN_APP -> inAppMaxRequests;
        };
    }

    private int getWindowSeconds(ChannelType channel) {
        return switch (channel) {
            case EMAIL -> emailWindowSeconds;
            case SMS -> smsWindowSeconds;
            case PUSH -> pushWindowSeconds;
            case IN_APP -> inAppWindowSeconds;
        };
    }
}