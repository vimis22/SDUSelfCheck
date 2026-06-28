package com.vivek.sduselfcheck.course;

public record CourseResponse(
        Long courseId,
        String code,
        String name,
        Integer ects,
        Integer semesterNumber,
        Boolean mandatory,
        String educationName
) {

}