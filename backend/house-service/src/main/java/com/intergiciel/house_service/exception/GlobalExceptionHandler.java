package com.intergiciel.house_service.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LogementNotFoundException.class)
    public ResponseEntity<String> handleNotFound(LogementNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @GraphQlExceptionHandler({IllegalArgumentException.class, RuntimeException.class})
    public GraphQLError handleGraphQlRuntimeException(RuntimeException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .build();
    }
}
