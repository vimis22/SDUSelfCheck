package com.vivek.sduselfcheck.admin;

public record UpdateTeacherRequest(
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String employeeNumber,
        String department,
        String title,
        String status
) {}
