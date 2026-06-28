package com.vivek.sduselfcheck.teacher;

public record TeacherResponse(
        Long teacherId,
        String employeeNumber,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String role,
        String status,
        String department
) {
}