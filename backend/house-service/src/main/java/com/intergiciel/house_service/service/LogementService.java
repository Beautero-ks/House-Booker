package com.intergiciel.house_service.service;
import java.time.LocalDateTime;

import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.entity.StatutValidation;
import com.intergiciel.house_service.exception.LogementNotFoundException;
import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.repository.LogementRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;


import java.util.List;
import java.util.UUID;

@Service
public class LogementService {

    private final LogementRepository repository;

    public LogementService(LogementRepository repository) {
        this.repository = repository;
    }

    // public Logement save(Logement logement) {
    //     return repository.save(logement);
    // }
// sauvegarder un logement 
    public Logement save(Logement logement) {

    logement.setStatutValidation(StatutValidation.EN_ATTENTE);
    logement.setDateCreation(LocalDateTime.now());

    return repository.save(logement);
    }
//select
    public List<Logement> findAll() {
        return repository.findAll();
    }
    // getbyid

   public Logement getById(UUID id) {
    return repository.findById(id)
            .orElseThrow(() -> new LogementNotFoundException("Logement introuvable"));
    }
// update
    public Logement update(UUID id, Logement newData) {

    Logement logement = repository.findById(id)
            .orElseThrow(() -> new LogementNotFoundException("Logement introuvable"));

    logement.setTitre(newData.getTitre());
    logement.setDescription(newData.getDescription());
    logement.setAdresse(newData.getAdresse());
    logement.setType(newData.getType());
    logement.setPrix(newData.getPrix());
    logement.setLatitude(newData.getLatitude());
    logement.setLongitude(newData.getLongitude());
    logement.setDisponible(newData.getDisponible());

    return repository.save(logement);
}
//delete
public void delete(UUID id) {
    Logement logement = repository.findById(id)
            .orElseThrow(() -> new LogementNotFoundException("Logement introuvable"));

    repository.delete(logement);
}

// rechercher
public List<Logement> searchByVille(String ville) {
    return repository.findByAdresseContaining(ville);
}

public List<Logement> searchByType(String type) {
    return repository.findByType(type);
}

public List<Logement> searchByPrix(Double min, Double max) {
    return repository.findByPrixBetween(min, max);
}

public List<Logement> searchDisponible(Boolean disponible) {
    return repository.findByDisponible(disponible);
}
//recuperer les logements en attentes
public List<Logement> getEnAttente() {
    return repository.findByStatutValidation(StatutValidation.EN_ATTENTE);
}
// valider un logement
public Logement valider(UUID id) {
    Logement logement = repository.findById(id)
            .orElseThrow(() -> new LogementNotFoundException("Logement introuvable"));

    logement.setStatutValidation(StatutValidation.VALIDE);

    return repository.save(logement);
}
// rejeter un logement
public Logement rejeter(UUID id) {
    Logement logement = repository.findById(id)
            .orElseThrow(() -> new LogementNotFoundException("Logement introuvable"));

    logement.setStatutValidation(StatutValidation.REJETE);

    return repository.save(logement);
}
}



