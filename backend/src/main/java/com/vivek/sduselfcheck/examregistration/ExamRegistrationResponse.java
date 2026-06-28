package com.vivek.sduselfcheck.examregistration;

import java.time.LocalDate;

public record ExamRegistrationResponse(
        Long examRegistrationId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        Long examId,
        String examTitle,
        String examType,
        LocalDate examDate,
        String courseCode,
        String courseName,
        String status,
        LocalDate registeredAt,
        Integer attemptNumber
) {
}