package com.notification.service.channel;

// =====================================================
// EmailChannelHandler.java - Email Delivery
// =====================================================
//
// Handles sending notifications via email.
//
// In a real system, this would integrate with:
// - SendGrid
// - Amazon SES
// - Mailgun
// - SMTP server
//
// For this demo, we just log the email (mock implementation).
//

import com.notification.model.entity.Notification;
import com.notification.model.entity.NotificationUser;
import com.notification.model.enums.ChannelType;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Email channel handler.
 * 
 * Sends notifications via email to users.
 */
@Component
public class EmailChannelHandler implements ChannelHandler {

    private static final Logger log = LoggerFactory.getLogger(EmailChannelHandler.class);
    private final JavaMailSender mailSender;

    public EmailChannelHandler(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public ChannelType getChannelType() {
        return ChannelType.EMAIL;
    }
    
    @Override
    public boolean canHandle(Notification notification) {
        if (!ChannelHandler.super.canHandle(notification)) {
            return false;
        }
        
        // Check if user has an email address
        NotificationUser notificationUser = notification.getNotificationUser();
        if (notificationUser == null || notificationUser.getEmail() == null || notificationUser.getEmail().isBlank()) {
            log.warn("Cannot send email: User {} has no email address", 
                notificationUser != null ? notificationUser.getId() : "null");
            return false;
        }
        
        return true;
    }
    
    @Override
    public boolean send(Notification notification) {
        NotificationUser notificationUser = notification.getNotificationUser();
        String email = notificationUser.getEmail();
        
        log.info("========== SENDING EMAIL ==========");
        log.info("To: {}", email);
        log.info("Subject: {}", notification.getSubject());
        log.info("Body: {}", notification.getContent());
        log.info("====================================");

        try {
            // 1. On crée un MimeMessage à la place du SimpleMailMessage
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            // 2. Le helper avec le flag "true" indique qu'on gère le multipart/HTML
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("noreply@housebooker.com");
            helper.setTo(email);
            helper.setSubject(notification.getSubject());

            // 3. Le second paramètre à "true" est LE paramètre magique qui active le rendu HTML !
            helper.setText(notification.getContent(), true);

            // Envoi réel
            mailSender.send(mimeMessage);

            log.info("Email sent successfully to via SMTP: {}", email);
            return true;

        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP server. Error: {}", email, e.getMessage());
            // Retourner false déclenchera le mécanisme de retry/DLQ géré par ton architecture
            return false;
        }
    }
}
