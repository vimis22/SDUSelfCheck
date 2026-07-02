package com.vivek.sduselfcheck.examregistration;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exam-registrations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ExamRegistrationController {

    private final ExamRegistrationService examRegistrationService;

    public ExamRegistrationController(ExamRegistrationService examRegistrationService) {
        this.examRegistrationService = examRegistrationService;
    }

    @GetMapping
    public List<ExamRegistrationResponse> getAllExamRegistrations() {
        return examRegistrationService.getAllExamRegistrations();
    }

    @GetMapping("/without-grade-result")
    public List<PendingGradeRegistrationResponse> getExamRegistrationsWithoutGradeResult() {
        return examRegistrationService.getExamRegistrationsWithoutGradeResult();
    }

    @GetMapping("/student/{studentId}")
    public List<ExamRegistrationResponse> getExamRegistrationsByStudentId(@PathVariable Long studentId) {
        return examRegistrationService.getExamRegistrationsByStudentId(studentId);
    }

    @PostMapping("/reexam")
    public ResponseEntity<?> registerForReexam(@RequestBody ReexamRegistrationRequest request) {
        try {
            return ResponseEntity.ok(examRegistrationService.registerForReexam(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
