package com.intergiciel.house_service.controller;


import com.intergiciel.house_service.dto.LogementCreateDto;
import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.dto.LogementUpdateDto;
import com.intergiciel.house_service.service.LogementService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class LogementController {

    private final LogementService service;

    @MutationMapping("create")
    public LogementDto create(@Argument("input") LogementCreateDto input) {
        return service.save(input);
    }

    @QueryMapping("getAll")
    public List<LogementDto> getAll() {
        return service.findAll();
    }

    @QueryMapping("getById")
    public LogementDto getById(@Argument UUID id) {
        return service.getById(id);
    }

    @MutationMapping("mettreAJourLogement")
    public LogementDto mettreAJourLogement(@Argument UUID id, @Argument("input") LogementUpdateDto input) {
        return service.update(id, input);
    }

    @MutationMapping("supprimerLogement")
    public Boolean supprimerLogement(@Argument UUID id) {
        service.delete(id);
        return Boolean.TRUE;
    }


    @QueryMapping("searchByVille")
    public List<LogementDto> searchByVille(@Argument String ville) {
        return service.searchByVille(ville);
    }

    @QueryMapping("searchByType")
    public List<LogementDto> searchByType(@Argument String type) {
        return service.searchByType(type);
    }

    @QueryMapping("searchByPrix")
    public List<LogementDto> searchByPrix(@Argument Double min, @Argument Double max) {
        return service.searchByPrix(min, max);
    }

    @QueryMapping("searchDisponible")
    public List<LogementDto> searchDisponible(@Argument Boolean disponible) {
        return service.searchDisponible(disponible);
    }

    @MutationMapping("validerLogement")
    public LogementDto validerLogement(@Argument UUID id) {
        return service.valider(id);
    }

    @MutationMapping("rejeterLogement")
    public LogementDto rejeterLogement(@Argument UUID id) {
        return service.rejeter(id);
    }

    @QueryMapping("getEnAttente")
    public List<LogementDto> getEnAttente() {
        return service.getEnAttente();
    }

}
