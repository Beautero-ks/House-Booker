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

        if (ex instanceof RuntimeException) {
            log.warn("[GraphQLExceptionHandler] Erreur métier sur {}: {}",
                    env.getField().getName(), ex.getMessage());

            return GraphqlErrorBuilder.newError(env)
                    .message(ex.getMessage())
                    .errorType(resolveErrorType(ex.getMessage()))
                    .build();
        }

        log.error("[GraphQLExceptionHandler] Erreur inattendue sur {}: {}",
                env.getField().getName(), ex.getMessage(), ex);

        return GraphqlErrorBuilder.newError(env)
                .message("Une erreur interne est survenue")
                .errorType(ErrorType.INTERNAL_ERROR)
                .build();
    }

    private ErrorType resolveErrorType(String message) {
        if (message == null) return ErrorType.INTERNAL_ERROR;
        if (message.contains("existe déjà"))            return ErrorType.BAD_REQUEST;
        if (message.contains("introuvable"))            return ErrorType.NOT_FOUND;
        if (message.contains("invalide")
         || message.contains("expiré")
         || message.contains("incorrect")
         || message.contains("non vérifié"))            return ErrorType.UNAUTHORIZED;
        return ErrorType.BAD_REQUEST;
    }
}