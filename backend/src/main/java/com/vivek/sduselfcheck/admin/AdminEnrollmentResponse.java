package com.vivek.sduselfcheck.admin;

import java.time.LocalDate;

public record AdminEnrollmentResponse(
        Long enrollmentId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        Long courseId,
        String courseCode,
        String courseName,
        String status,
        LocalDate enrolledAt
) {}
