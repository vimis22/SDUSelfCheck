package com.vivek.sduselfcheck.teacher;

public record TeacherCourseResponse(
        Long courseId,
        String code,
        String name,
        Integer ects,
        Integer semesterNumber,
        Boolean mandatory,
        String educationName,
        int enrolledStudentCount
) {}
