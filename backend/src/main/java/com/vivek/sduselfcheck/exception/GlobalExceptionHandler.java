package com.vivek.sduselfcheck.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = resolveHttpStatus(exception.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", exception.getMessage());
        body.put("path", request.getRequestURI());

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", "Unexpected server error.");
        body.put("path", request.getRequestURI());

        return ResponseEntity.status(status).body(body);
    }

    private HttpStatus resolveHttpStatus(String message) {
        if (message == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("already exists") || lowerMessage.contains("duplicate")) {
            return HttpStatus.CONFLICT;
        }

        if (lowerMessage.contains("not found")) {
            return HttpStatus.NOT_FOUND;
        }

        return HttpStatus.BAD_REQUEST;
    }
}