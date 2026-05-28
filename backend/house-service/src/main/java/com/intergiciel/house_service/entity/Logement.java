package com.intergiciel.house_service.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "logement")
public class Logement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String titre;
    private String description;
    private String adresse;
    private String type;
    private Double prix;
    private Double latitude;
    private Double longitude;
    private Integer nombreChambres;
    private Integer nombreCuisines;
    private Integer nombreSallesBain;
    private Integer nombreToilettes;
    private Boolean disponible;
    private UUID proprietaireId;

    @Enumerated(EnumType.STRING)
    private StatutValidation statutValidation;

    private OffsetDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (this.statutValidation == null) {
            this.statutValidation = StatutValidation.EN_ATTENTE;
        }
        if (this.dateCreation == null) {
            this.dateCreation = OffsetDateTime.now();
        }
        if (this.disponible == null) {
            this.disponible = Boolean.TRUE;
        }
    }

    // constructeur vide (OBLIGATOIRE)
    public Logement() {}

    // getters & setters (OBLIGATOIRE)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getNombreChambres() { return nombreChambres; }
    public void setNombreChambres(Integer nombreChambres) { this.nombreChambres = nombreChambres; }

    public Integer getNombreCuisines() { return nombreCuisines; }
    public void setNombreCuisines(Integer nombreCuisines) { this.nombreCuisines = nombreCuisines; }

    public Integer getNombreSallesBain() { return nombreSallesBain; }
    public void setNombreSallesBain(Integer nombreSallesBain) { this.nombreSallesBain = nombreSallesBain; }

    public Integer getNombreToilettes() { return nombreToilettes; }
    public void setNombreToilettes(Integer nombreToilettes) { this.nombreToilettes = nombreToilettes; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public UUID getProprietaireId() { return proprietaireId; }
    public void setProprietaireId(UUID proprietaireId) { this.proprietaireId = proprietaireId; }

    public StatutValidation getStatutValidation() { return statutValidation; }
    public void setStatutValidation(StatutValidation statutValidation) { this.statutValidation = statutValidation; }

    public OffsetDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(OffsetDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
