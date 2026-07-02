package com.vivek.sduselfcheck.admin;

public record AdminStatsResponse(
        long userCount,
        long studentCount,
        long teacherCount,
        long courseCount,
        long activeEnrollmentCount,
        long activeExamRegistrationCount
) {}
