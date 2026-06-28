package com.vivek.sduselfcheck.enrollment;

import java.time.LocalDate;

public record CourseEnrollmentResponse(
        Long enrollmentId,
        Long studentId,
        String studentNumber,
        String studentFirstName,
        String studentLastName,
        Long courseId,
        String courseCode,
        String courseName,
        Integer ects,
        Integer semesterNumber,
        String status,
        LocalDate enrolledAt
) {
}