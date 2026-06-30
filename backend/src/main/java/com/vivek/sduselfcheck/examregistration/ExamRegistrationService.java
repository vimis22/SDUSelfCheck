package com.vivek.sduselfcheck.examregistration;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamRegistrationService {

    private final ExamRegistrationRepository examRegistrationRepository;

    public ExamRegistrationService(ExamRegistrationRepository examRegistrationRepository) {
        this.examRegistrationRepository = examRegistrationRepository;
    }

    public List<PendingGradeRegistrationResponse> getExamRegistrationsWithoutGradeResult() {
        return examRegistrationRepository.findAllWithoutGradeResult()
                .stream()
                .map(registration -> new PendingGradeRegistrationResponse(
                        registration.getExamRegistrationId(),
                        registration.getStudent().getStudentId(),
                        registration.getStudent().getStudentNumber(),
                        registration.getStudent().getUser().getFirstName(),
                        registration.getStudent().getUser().getLastName(),
                        registration.getExam().getExamId(),
                        registration.getExam().getTitle(),
                        registration.getExam().getExamType(),
                        registration.getExam().getExamDate(),
                        registration.getExam().getCourse().getCourseId(),
                        registration.getExam().getCourse().getCode(),
                        registration.getExam().getCourse().getName(),
                        registration.getStatus(),
                        registration.getAttemptNumber()
                ))
                .toList();
    }

    public List<ExamRegistrationResponse> getAllExamRegistrations() {
        return examRegistrationRepository.findAll(Sort.by(Sort.Direction.ASC, "examRegistrationId"))
                .stream()
                .map(registration -> new ExamRegistrationResponse(
                        registration.getExamRegistrationId(),
                        registration.getStudent().getStudentId(),
                        registration.getStudent().getStudentNumber(),
                        registration.getStudent().getUser().getFirstName(),
                        registration.getStudent().getUser().getLastName(),
                        registration.getExam().getExamId(),
                        registration.getExam().getTitle(),
                        registration.getExam().getExamType(),
                        registration.getExam().getExamDate(),
                        registration.getExam().getCourse().getCode(),
                        registration.getExam().getCourse().getName(),
                        registration.getStatus(),
                        registration.getRegisteredAt(),
                        registration.getAttemptNumber()
                ))
                .toList();
    }
}