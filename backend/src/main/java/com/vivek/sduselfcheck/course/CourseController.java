package com.vivek.sduselfcheck.course;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
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
