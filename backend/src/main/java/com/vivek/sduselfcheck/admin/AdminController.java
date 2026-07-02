package com.vivek.sduselfcheck.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}/disable")
    public ResponseEntity<?> disableUser(@PathVariable Long id) {
        try {
            adminService.disableUser(id);
            return ResponseEntity.ok(Map.of("message", "User disabled."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/users/{id}/enable")
    public ResponseEntity<?> enableUser(@PathVariable Long id) {
        try {
            adminService.enableUser(id);
            return ResponseEntity.ok(Map.of("message", "User enabled."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Students ──────────────────────────────────────────────────────────────

    @GetMapping("/students")
    public List<AdminStudentResponse> getAllStudents() {
        return adminService.getAllStudents();
    }

    // ── Course Enrollments ────────────────────────────────────────────────────

    @GetMapping("/course-registrations")
    public List<AdminEnrollmentResponse> getAllCourseEnrollments() {
        return adminService.getAllCourseEnrollments();
    }

    @PatchMapping("/course-registrations/{id}/cancel")
    public ResponseEntity<?> cancelCourseEnrollment(@PathVariable Long id) {
        try {
            adminService.cancelCourseEnrollment(id);
            return ResponseEntity.ok(Map.of("message", "Enrollment cancelled."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Exam Registrations ────────────────────────────────────────────────────

    @GetMapping("/exam-registrations")
    public List<AdminExamRegistrationResponse> getAllExamRegistrations() {
        return adminService.getAllExamRegistrations();
    }

    @PatchMapping("/exam-registrations/{id}/cancel")
    public ResponseEntity<?> cancelExamRegistration(@PathVariable Long id) {
        try {
            adminService.cancelExamRegistration(id);
            return ResponseEntity.ok(Map.of("message", "Registration cancelled."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
