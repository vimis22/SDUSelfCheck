package com.vivek.sduselfcheck.studentcard;

import java.time.LocalDate;

public record StudentCardResponse(
        Long cardId,
        Long studentId,
        String studentNumber,
        String firstName,
        String lastName,
        String email,
        String educationName,
        String cardNumber,
        LocalDate validUntil,
        String status,
        String qrCodeValue
) {}
