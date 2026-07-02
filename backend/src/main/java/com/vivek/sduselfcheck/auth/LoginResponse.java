package com.vivek.sduselfcheck.auth;

public record LoginResponse(
        Long userId,
        String email,
        String role,
        Long studentId,
        Long teacherId
) {
}
