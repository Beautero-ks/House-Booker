package com.notification.service.channel;

// =====================================================
// EmailChannelHandler.java - Email Delivery
// =====================================================
//
// Handles sending notifications via email.
//
import com.notification.model.entity.Notification;
import com.notification.model.entity.NotificationUser;
import com.notification.model.enums.ChannelType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final String fromAddress;

    public EmailChannelHandler(
            JavaMailSender mailSender,
            @Value("${notification.mail.from:no-reply@housebooker.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
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
        String subject = notification.getSubject() == null || notification.getSubject().isBlank()
                ? "Notification HouseBooker"
                : notification.getSubject();
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject(subject);
        message.setText(notification.getContent());

        try {
            mailSender.send(message);
            log.info("Email sent to {} via SMTP", email);
            return true;
        } catch (MailException e) {
            log.error("Email failed to send to {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
}
