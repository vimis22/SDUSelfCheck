package com.vivek.sduselfcheck.teacher;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/api/teachers")
    public List<TeacherResponse> getAllTeachers() {
        return teacherService.getAllTeachers();
    }
}