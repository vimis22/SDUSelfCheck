package com.vivek.sduselfcheck.student;

public record StudentResponse(
        Long studentId,
        String studentNumber,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String role,
        String status,
        String enrollmentStatus,
        String gender,
        Integer semester,
        String educationCode,
        String educationName
) {}