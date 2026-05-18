-- =====================================================
-- V2__seed_dev_data.sql - Jeu de données de développement
-- =====================================================
-- Ce script insère des notifications fictives pour faciliter
-- les tests en environnement de développement.
-- Il n'est PAS exécuté en production.
-- =====================================================

INSERT INTO notifications (id, user_id, channel, priority, subject, content, status, created_at)
VALUES
    ('01910000-0000-7000-8000-000000000001', '550e8400-e29b-41d4-a716-446655440001', 'EMAIL', 'HIGH',
     'Bienvenue sur HouseBooker', 'Merci de vous être inscrit !', 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    
    ('01910000-0000-7000-8000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'IN_APP', 'MEDIUM',
     'Votre réservation est confirmée', 'Réservation #1234 confirmée pour le 15 mai.', 'READ', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    
    ('01910000-0000-7000-8000-000000000003', '550e8400-e29b-41d4-a716-446655440002', 'SMS', 'CRITICAL',
     NULL, 'Votre code OTP est 123456', 'SENT', CURRENT_TIMESTAMP - INTERVAL '3 hours');