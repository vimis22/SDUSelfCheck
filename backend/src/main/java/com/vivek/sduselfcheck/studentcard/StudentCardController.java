package com.vivek.sduselfcheck.studentcard;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student-cards")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StudentCardController {

    private final StudentCardService studentCardService;

    public StudentCardController(StudentCardService studentCardService) {
        this.studentCardService = studentCardService;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getByStudentId(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(studentCardService.getByStudentId(studentId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}
