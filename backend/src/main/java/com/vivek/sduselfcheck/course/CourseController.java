package com.vivek.sduselfcheck.course;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/api/courses")
    public List<CourseResponse> getCourses(){
        return courseService.getAllCourses();
    }
}
