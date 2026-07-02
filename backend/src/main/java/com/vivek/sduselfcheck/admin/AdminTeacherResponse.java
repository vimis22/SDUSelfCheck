package com.vivek.sduselfcheck.admin;

public record AdminTeacherResponse(
        Long teacherId,
        String employeeNumber,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String department,
        String title,
        String status
) {}
