package com.intergiciel.notification_service.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.intergiciel.notification_service.domain.model.Notification;
import com.intergiciel.notification_service.service.EmailService;

import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryRegistry;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final RetryRegistry retryRegistry;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async("emailExecutor")                    // Utilise le ThreadPool dédié
    @Override
    public void sendEmail(Notification notification) {
        io.github.resilience4j.retry.Retry retry = retryRegistry.retry("email-retry");

        Runnable decoratedRunnable = Retry.decorateRunnable(retry, () -> {
            try {
                String htmlContent = buildEmailContent(notification);
                sendHtmlEmail(notification.getEmailTo(), notification.getTitle(), htmlContent);
                
                log.info("Email sent successfully to {}", notification.getEmailTo());
            } catch (MessagingException e) {
                log.error("Failed to send email to {}", notification.getEmailTo(), e);
                throw new RuntimeException(e);
            }
        });

        decoratedRunnable.run();
    }

    @Async
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String buildEmailContent(Notification notification) {
    Context context = new Context();
    context.setVariable("title", notification.getTitle());
    context.setVariable("message", notification.getMessage());
    context.setVariable("referenceId", notification.getReferenceId());

    String templateName = switch (notification.getType()) {
        case BOOKING_CONFIRMED -> "email/booking-confirmation";
        case PAYMENT_SUCCESS -> "email/payment-success";
        case USER_REGISTERED -> "email/welcome";
        default -> "email/default-notification";
    };

    return templateEngine.process(templateName, context);
}
}