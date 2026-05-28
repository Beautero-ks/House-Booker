package com.intergiciel.auth_service.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;

/**
 * GraphQL Exception Handler
 *
 * Remplace GlobalExceptionHandler (REST) pour GraphQL.
 * Transforme les exceptions Java en erreurs GraphQL standard :
 *
 *  RuntimeException  →  ErrorType selon le message
 *  Exception         →  INTERNAL_ERROR
 *
 * Réponse GraphQL en cas d'erreur :
 * {
 *   "errors": [{
 *     "message": "Email ou mot de passe incorrect",
 *     "extensions": { "classification": "UNAUTHORIZED" }
 *   }],
 *   "data": { "login": null }
 * }
 */
@Component
@Slf4j
public class GraphQLExceptionHandler extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {

        if (ex instanceof ResourceNotFoundException) {
            log.warn("[GraphQLExceptionHandler] Ressource introuvable sur {}: {}",
                    env.getField().getName(), ex.getMessage());
            return buildError(env, ex.getMessage(), ErrorType.NOT_FOUND);
        }

        if (ex instanceof ConflictException) {
            log.warn("[GraphQLExceptionHandler] Conflit métier sur {}: {}",
                    env.getField().getName(), ex.getMessage());
            return buildError(env, ex.getMessage(), ErrorType.BAD_REQUEST);
        }

        if (ex instanceof BadRequestException) {
            log.warn("[GraphQLExceptionHandler] Requête invalide sur {}: {}",
                    env.getField().getName(), ex.getMessage());
            return buildError(env, ex.getMessage(), ErrorType.BAD_REQUEST);
        }

        if (ex instanceof UnauthorizedException) {
            log.warn("[GraphQLExceptionHandler] Accès non autorisé sur {}: {}",
                    env.getField().getName(), ex.getMessage());
            return buildError(env, ex.getMessage(), ErrorType.UNAUTHORIZED);
        }

        if (ex instanceof RuntimeException) {
            log.warn("[GraphQLExceptionHandler] Erreur métier sur {}: {}",
                    env.getField().getName(), ex.getMessage());
            return buildError(env, ex.getMessage(), ErrorType.BAD_REQUEST);
        }

        log.error("[GraphQLExceptionHandler] Erreur inattendue sur {}: {}",
                env.getField().getName(), ex.getMessage(), ex);

        return buildError(env, "Une erreur interne est survenue", ErrorType.INTERNAL_ERROR);
    }

    private GraphQLError buildError(DataFetchingEnvironment env, String message, ErrorType errorType) {
        return GraphqlErrorBuilder.newError(env)
                .message(message)
                .errorType(errorType)
                .build();
    }
}