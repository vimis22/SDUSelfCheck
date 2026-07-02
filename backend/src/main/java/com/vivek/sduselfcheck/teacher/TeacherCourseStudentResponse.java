package com.vivek.sduselfcheck.teacher;

public record TeacherCourseStudentResponse(
        Long studentId,
        String studentNumber,
        String firstName,
        String lastName,
        String email,
        String courseStatus,
        boolean hasExamRegistration
) {}
