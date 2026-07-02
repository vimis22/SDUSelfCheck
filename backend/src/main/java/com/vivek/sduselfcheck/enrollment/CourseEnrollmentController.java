package com.vivek.sduselfcheck.enrollment;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CourseEnrollmentController {

    private final CourseEnrollmentService courseEnrollmentService;

    public CourseEnrollmentController(CourseEnrollmentService courseEnrollmentService) {
        this.courseEnrollmentService = courseEnrollmentService;
    }

    @GetMapping
    public List<CourseEnrollmentResponse> getAllEnrollments() {
        return courseEnrollmentService.getAllEnrollments();
    }

    @GetMapping("/student/{studentId}")
    public List<CourseEnrollmentResponse> getEnrollmentsByStudentId(@PathVariable Long studentId) {
        return courseEnrollmentService.getEnrollmentsByStudentId(studentId);
    }

    @PostMapping("/register")
    public CourseEnrollmentResponse enrollInCourse(@RequestBody CourseEnrollmentRequest request) {
        return courseEnrollmentService.enrollInCourse(request);
    }

    @PostMapping("/unregister")
    public CourseEnrollmentResponse cancelEnrollment(@RequestBody CourseEnrollmentRequest request) {
        return courseEnrollmentService.cancelEnrollment(request);
    }
}
