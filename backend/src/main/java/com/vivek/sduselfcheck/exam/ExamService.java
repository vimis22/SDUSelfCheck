package com.vivek.sduselfcheck.exam;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<ExamResponse> getAllExams() {
        return examRepository.findAll(Sort.by(Sort.Direction.ASC, "examId"))
                .stream()
                .map(exam -> new ExamResponse(
                        exam.getExamId(),
                        exam.getTitle(),
                        exam.getExamType(),
                        exam.getExamDate(),
                        exam.getStartTime(),
                        exam.getEndTime(),
                        exam.getLocation(),
                        exam.getReexam(),
                        exam.getCourse().getCourseId(),
                        exam.getCourse().getCode(),
                        exam.getCourse().getName()
                ))
                .toList();
    }
}