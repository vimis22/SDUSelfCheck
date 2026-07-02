package com.vivek.sduselfcheck.teacher;

public record TeacherExamRegistrationDetailResponse(
        Long examRegistrationId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        String status,
        Integer attemptNumber,
        boolean hasResult
) {}
