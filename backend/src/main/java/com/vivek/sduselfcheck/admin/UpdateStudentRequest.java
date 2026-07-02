package com.vivek.sduselfcheck.admin;

public record UpdateStudentRequest(
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String studentNumber,
        Long educationId,
        Integer semester,
        String enrollmentStatus
) {}
