package com.vivek.sduselfcheck.enrollment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CourseEnrollmentController {

    private final CourseEnrollmentService courseEnrollmentService;

    public CourseEnrollmentController(CourseEnrollmentService courseEnrollmentService) {
        this.courseEnrollmentService = courseEnrollmentService;
    }

    @GetMapping("/api/enrollments")
    public List<CourseEnrollmentResponse> getAllEnrollments() {
        return courseEnrollmentService.getAllEnrollments();
    }
}