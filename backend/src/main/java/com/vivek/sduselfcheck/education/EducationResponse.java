package com.vivek.sduselfcheck.education;

public record EducationResponse(
        Long educationId,
        String code,
        String name,
        String degreeType,
        Integer ects,
        String schoolName,
        String facultyName
) {
}