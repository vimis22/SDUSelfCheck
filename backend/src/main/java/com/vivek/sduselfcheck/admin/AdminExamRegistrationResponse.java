package com.vivek.sduselfcheck.admin;

import java.time.LocalDate;

public record AdminExamRegistrationResponse(
        Long examRegistrationId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        Long examId,
        String examTitle,
        Boolean reexam,
        Long courseId,
        String courseCode,
        String courseName,
        String status,
        Integer attemptNumber,
        LocalDate registeredAt
) {}
