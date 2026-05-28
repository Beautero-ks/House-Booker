package com.intergiciel.house_service.service;

import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.mapper.LogementMapper;
import com.intergiciel.house_service.repository.LogementPhotoRepository;
import com.intergiciel.house_service.repository.LogementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LogementServiceTest {

    private final LogementRepository repository = mock(LogementRepository.class);
    private final LogementPhotoRepository photoRepository = mock(LogementPhotoRepository.class);
    private final LogementPhotoService photoService = mock(LogementPhotoService.class);
    private final LogementService service = new LogementService(
            repository,
            photoRepository,
            photoService,
            new LogementMapper()
    );

    @Test
    void getByProprietaireIdReturnsOnlyOwnerHousesWithPhotosMetadata() {
        UUID ownerId = UUID.randomUUID();
        Logement first = logement(ownerId, "Villa Bonapriso");
        Logement second = logement(ownerId, "Studio Akwa");

        when(repository.findByProprietaireIdOrderByDateCreationDesc(ownerId)).thenReturn(List.of(first, second));
        when(photoService.getPhotosForLogementIds(anyList())).thenReturn(Map.of());

        List<LogementDto> result = service.getByProprietaireId(ownerId);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(LogementDto::getProprietaireId).containsOnly(ownerId);
        assertThat(result).extracting(LogementDto::getTitre).containsExactly("Villa Bonapriso", "Studio Akwa");
        assertThat(result).extracting(LogementDto::getPhotoCount).containsOnly(0);
        verify(repository).findByProprietaireIdOrderByDateCreationDesc(ownerId);
    }

    @Test
    void getByProprietaireIdRejectsMissingOwnerId() {
        assertThatThrownBy(() -> service.getByProprietaireId(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("propriétaire");
        Mockito.verifyNoInteractions(repository);
    }

    private Logement logement(UUID ownerId, String title) {
        Logement logement = new Logement();
        logement.setId(UUID.randomUUID());
        logement.setTitre(title);
        logement.setAdresse("Douala");
        logement.setType("MAISON");
        logement.setPrix(25000D);
        logement.setDisponible(true);
        logement.setProprietaireId(ownerId);
        logement.setDateCreation(OffsetDateTime.now());
        logement.prePersist();
        return logement;
    }
}
