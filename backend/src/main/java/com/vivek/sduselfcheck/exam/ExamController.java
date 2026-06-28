package com.vivek.sduselfcheck.exam;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/api/exams")
    public List<ExamResponse> getAllExams() {
        return examService.getAllExams();
    }
}