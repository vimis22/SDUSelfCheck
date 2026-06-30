package com.vivek.sduselfcheck.examregistration;

import java.time.LocalDate;

public record PendingGradeRegistrationResponse(
        Long examRegistrationId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        Long examId,
        String examTitle,
        String examType,
        LocalDate examDate,
        Long courseId,
        String courseCode,
        String courseName,
        String status,
        Integer attemptNumber
) {
}
