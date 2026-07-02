package com.vivek.sduselfcheck.teacher;

import com.vivek.sduselfcheck.examregistration.PendingGradeRegistrationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    // ── All teachers ──────────────────────────────────────────────────────────────

    @GetMapping
    public List<TeacherResponse> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    // ── Teacher's courses ─────────────────────────────────────────────────────────

    @GetMapping("/{teacherId}/courses")
    public ResponseEntity<?> getCoursesByTeacherId(@PathVariable Long teacherId) {
        try {
            return ResponseEntity.ok(teacherService.getCoursesByTeacherId(teacherId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{teacherId}/courses/{courseId}/students")
    public ResponseEntity<?> getStudentsByCourseId(
            @PathVariable Long teacherId,
            @PathVariable Long courseId
    ) {
        try {
            return ResponseEntity.ok(teacherService.getStudentsByCourseId(teacherId, courseId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Teacher's exams ───────────────────────────────────────────────────────────

    @GetMapping("/{teacherId}/exams")
    public ResponseEntity<?> getExamsByTeacherId(@PathVariable Long teacherId) {
        try {
            return ResponseEntity.ok(teacherService.getExamsByTeacherId(teacherId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{teacherId}/exams/{examId}/registrations")
    public ResponseEntity<?> getRegistrationsByExamId(
            @PathVariable Long teacherId,
            @PathVariable Long examId
    ) {
        try {
            return ResponseEntity.ok(teacherService.getRegistrationsByExamId(teacherId, examId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Pending registrations (no grade) for teacher's courses ───────────────────

    @GetMapping("/{teacherId}/exam-registrations/missing-results")
    public ResponseEntity<?> getPendingRegistrationsByTeacherId(@PathVariable Long teacherId) {
        try {
            return ResponseEntity.ok(teacherService.getPendingRegistrationsByTeacherId(teacherId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
