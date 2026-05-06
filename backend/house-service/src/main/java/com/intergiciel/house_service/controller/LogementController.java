package com.intergiciel.house_service.controller;


import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.service.LogementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/logements")
public class LogementController {

    private final LogementService service;

    public LogementController(LogementService service) {
        this.service = service;
    }
// create
    @PostMapping
    public Logement create(@RequestBody Logement logement) {
        return service.save(logement);
    }
// select
    @GetMapping
    public List<Logement> getAll() {
        return service.findAll();
    }
//getbyid
    @GetMapping("/{id}")
     public Logement getById(@PathVariable Long id) {
    return service.getById(id);
     }
    // update
    @PutMapping("/{id}")
      public Logement update(@PathVariable Long id, @RequestBody Logement newData) {
     return service.update(id, newData);
    }
    //delete
    @DeleteMapping("/{id}")
     public String delete(@PathVariable Long id) {
     service.delete(id);
    return "Logement supprimé avec succès";
     }

     
// recherche par ville
@GetMapping("/search/ville")
public List<Logement> searchByVille(@RequestParam String ville) {
    return service.searchByVille(ville);
}

// recherche par type
@GetMapping("/search/type")
public List<Logement> searchByType(@RequestParam String type) {
    return service.searchByType(type);
}

// recherche par prix
@GetMapping("/search/prix")
public List<Logement> searchByPrix(@RequestParam Double min, @RequestParam Double max) {
    return service.searchByPrix(min, max);
}

// disponibilité
@GetMapping("/search/disponible")
public List<Logement> searchDisponible(@RequestParam Boolean disponible) {
    return service.searchDisponible(disponible);
}
// recuperer les logements en attentes
@GetMapping("/en-attente")
public List<Logement> getEnAttente() {
    return service.getEnAttente();
}
// valider un logement 
@PutMapping("/{id}/valider")
public Logement valider(@PathVariable Long id) {
    return service.valider(id);
}
// rejeter un logement
@PutMapping("/{id}/rejeter")
public Logement rejeter(@PathVariable Long id) {
    return service.rejeter(id);
}

}

