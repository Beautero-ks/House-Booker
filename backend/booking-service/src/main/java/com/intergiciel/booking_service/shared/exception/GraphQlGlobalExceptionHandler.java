package com.intergiciel.booking_service.shared.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class GraphQlGlobalExceptionHandler {

    @GraphQlExceptionHandler(Exception.class)
    public GraphQLError handleException(Exception ex) {
        Throwable rootCause = ex;
        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        String message = rootCause.getMessage();
        if (message == null || message.isBlank()) {
            message = ex.getMessage();
        }
        if (message == null || message.isBlank()) {
            message = "Unexpected error";
        }

        return GraphqlErrorBuilder.newError()
                .message(message)
                .build();
    }
}
