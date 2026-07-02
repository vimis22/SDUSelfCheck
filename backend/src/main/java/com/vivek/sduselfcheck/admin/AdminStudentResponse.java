package com.vivek.sduselfcheck.admin;

public record AdminStudentResponse(
        Long studentId,
        String studentNumber,
        String firstName,
        String lastName,
        String email,
        String educationName,
        Integer semester,
        String enrollmentStatus,
        String phoneNumber,
        Long educationId
) {}
