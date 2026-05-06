package com.intergiciel.house_service.repository;

import com.intergiciel.house_service.entity.Logement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.intergiciel.house_service.entity.StatutValidation;

public interface LogementRepository extends JpaRepository<Logement, Long> {
   

List<Logement> findByAdresseContaining(String adresse);

List<Logement> findByType(String type);

List<Logement> findByPrixBetween(Double min, Double max);

List<Logement> findByDisponible(Boolean disponible);
List<Logement> findByStatutValidation(StatutValidation statut);
}