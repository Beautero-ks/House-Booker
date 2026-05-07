package com.intergiciel.notification_service.service;

import com.intergiciel.notification_service.domain.model.Notification;

import jakarta.mail.MessagingException;

public interface EmailService {

    void sendEmail(Notification notification) throws MessagingException;

    void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException;
}