package com.vivek.sduselfcheck.result;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grade-results")
@CrossOrigin(origins = "http://localhost:3000")
public class GradeResultController {

    private final GradeResultService gradeResultService;

    public GradeResultController(GradeResultService gradeResultService) {
        this.gradeResultService = gradeResultService;
    }

    @GetMapping
    public List<GradeResultResponse> getAllGradeResults() {
        return gradeResultService.getAllGradeResults();
    }

    @GetMapping("/{gradeResultId}")
    public GradeResultResponse getGradeResultById(@PathVariable Long gradeResultId) {
        return gradeResultService.getGradeResultById(gradeResultId);
    }

    @GetMapping("/exam-registration/{examRegistrationId}")
    public GradeResultResponse getGradeResultByExamRegistrationId(@PathVariable Long examRegistrationId) {
        return gradeResultService.getGradeResultByExamRegistrationId(examRegistrationId);
    }

    @GetMapping("/student/{studentId}")
    public List<GradeResultResponse> getGradeResultsByStudentId(@PathVariable Long studentId) {
        return gradeResultService.getGradeResultsByStudentId(studentId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<GradeResultResponse> getGradeResultsByTeacherId(@PathVariable Long teacherId) {
        return gradeResultService.getGradeResultsByTeacherId(teacherId);
    }

    @PostMapping
    public GradeResultResponse createGradeResult(@RequestBody GradeResultRequest request) {
        return gradeResultService.createGradeResult(request);
    }

    @PutMapping("/{gradeResultId}")
    public GradeResultResponse updateGradeResult(
            @PathVariable Long gradeResultId,
            @RequestBody GradeResultRequest request
    ) {
        return gradeResultService.updateGradeResult(gradeResultId, request);
    }
}