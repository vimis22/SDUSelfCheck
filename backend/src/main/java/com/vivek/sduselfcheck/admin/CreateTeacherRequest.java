package com.vivek.sduselfcheck.admin;

public record CreateTeacherRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String employeeNumber,
        String department
) {}
