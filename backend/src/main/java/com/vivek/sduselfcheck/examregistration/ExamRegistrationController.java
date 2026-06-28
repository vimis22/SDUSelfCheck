package com.vivek.sduselfcheck.examregistration;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExamRegistrationController {

    private final ExamRegistrationService examRegistrationService;

    public ExamRegistrationController(ExamRegistrationService examRegistrationService) {
        this.examRegistrationService = examRegistrationService;
    }

    @GetMapping("/api/exam-registrations")
    public List<ExamRegistrationResponse> getAllExamRegistrations() {
        return examRegistrationService.getAllExamRegistrations();
    }
}