package com.vivek.sduselfcheck.admin;

public record AdminUserResponse(
        Long userId,
        String email,
        String role,
        String status,
        String firstName,
        String lastName,
        Long studentId,
        Long teacherId
) {}
