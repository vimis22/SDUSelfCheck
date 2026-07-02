package com.vivek.sduselfcheck.admin;

public record CreateStudentRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String studentNumber,
        Long educationId,
        Integer semester
) {}
