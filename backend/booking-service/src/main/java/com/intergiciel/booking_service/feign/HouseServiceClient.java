package com.intergiciel.booking_service.feign;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.shared.exception.HouseNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class HouseServiceClient {

    private static final String GET_HOUSE_BY_ID_QUERY = """
            query GetHouseById($id: UUID!) {
              getById(id: $id) {
                titre
                description
                adresse
                type
                prix
                latitude
                longitude
                disponible
                proprietaireId
                dateCreation
                statutValidation
              }
            }
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String graphqlPath;

    public HouseServiceClient(@Value("${house-service.url}") String houseServiceUrl,
                              @Value("${house-service.graphql-path:/api/v1/graphql}") String graphqlPath,
                              ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(houseServiceUrl)
                .build();
        this.graphqlPath = graphqlPath.startsWith("/") ? graphqlPath : "/" + graphqlPath;
        this.objectMapper = objectMapper;
    }

    public HouseDto getHouseById(UUID id) {
        GraphQlRequest request = new GraphQlRequest(
                GET_HOUSE_BY_ID_QUERY,
                Map.of("id", id.toString())
        );

        try {
            String rawResponse = restClient.post()
                    .uri(graphqlPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                throw new IllegalStateException("Empty response from house-service at path: " + graphqlPath);
            }

            GraphQlResponse response = objectMapper.readValue(rawResponse, GraphQlResponse.class);

            if (response == null) {
                throw new IllegalStateException("Empty response from house-service");
            }

            if (response.errors != null && !response.errors.isEmpty()) {
                String firstErrorMessage = response.errors.getFirst().message();
                throw new HouseNotFoundException("House service error: " + firstErrorMessage);
            }

            if (response.data() == null || response.data().getById() == null) {
                throw new HouseNotFoundException("House not found with ID: " + id);
            }

            return response.data().getById();
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException(
                    "House-service HTTP " + ex.getStatusCode().value() + " at " + graphqlPath + ", body: " +
                            truncate(ex.getResponseBodyAsString()),
                    ex
            );
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Invalid JSON from house-service", ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Unable to call house-service", ex);
        }
    }

    private static String truncate(String value) {
        if (value == null) {
            return "";
        }
        String compact = value.replaceAll("\\s+", " ").trim();
        return compact.length() <= 300 ? compact : compact.substring(0, 300) + "...";
    }

    private record GraphQlRequest(String query, Map<String, Object> variables) {
    }

    private record GraphQlResponse(GraphQlData data, List<GraphQlError> errors) {
    }

    private record GraphQlData(HouseDto getById) {
    }

    private record GraphQlError(String message) {
    }
}
