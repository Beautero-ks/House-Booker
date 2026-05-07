package com.intergiciel.notification_service;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationType;
import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.dto.NotificationResponse;
import com.intergiciel.notification_service.service.NotificationService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
@ActiveProfiles("test")
class NotificationServiceIntegrationTest {

    @Autowired
    private NotificationService notificationService;

    @Test
    void shouldCreateAndSendNotification() {
        var request = NotificationRequest.builder()
                .userId("test-user")
                .title("Test")
                .message("Test message")
                .type(NotificationType.BOOKING_CONFIRMED)
                .channel(NotificationChannel.IN_APP)
                .build();

        NotificationResponse response = notificationService.createAndSendNotification(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
    }
}