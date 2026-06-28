package com.vivek.sduselfcheck.education;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EducationController {

    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    @GetMapping("/api/educations")
    public List<EducationResponse> getAllEducations() {
        return educationService.getAllEducations();
    }
}