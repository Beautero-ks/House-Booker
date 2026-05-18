package com.notification.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "notification.routing")
@Data
public class RoutingProperties {
    private Map<String, List<String>> rules;
}