package com.vivek.sduselfcheck.examregistration;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.exam.ExamRepository;
import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.student.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExamRegistrationService {

    private final ExamRegistrationRepository examRegistrationRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;

    public ExamRegistrationService(
            ExamRegistrationRepository examRegistrationRepository,
            StudentRepository studentRepository,
            ExamRepository examRepository
    ) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
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
                .map(this::mapToResponse)
                .toList();
    }

    public List<ExamRegistrationResponse> getExamRegistrationsByStudentId(Long studentId) {
        return examRegistrationRepository.findByStudentStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ExamRegistrationResponse registerForReexam(ReexamRegistrationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));

        Exam originalExam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + request.getExamId()));

        Course course = originalExam.getCourse();

        Exam reexam = examRepository.findFirstByCourseAndReexamTrue(course)
                .orElseThrow(() -> new RuntimeException("No re-exam found for course: " + course.getName()));

        boolean alreadyRegistered = examRegistrationRepository
                .existsByStudentStudentIdAndExamExamId(student.getStudentId(), reexam.getExamId());

        if (alreadyRegistered) {
            throw new RuntimeException("Student is already registered for the re-exam of course: " + course.getName());
        }

        ExamRegistration registration = new ExamRegistration(student, reexam, "REGISTERED", LocalDate.now(), 1);
        examRegistrationRepository.save(registration);

        return mapToResponse(registration);
    }

    private ExamRegistrationResponse mapToResponse(ExamRegistration registration) {
        return new ExamRegistrationResponse(
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
        );
    }
}
