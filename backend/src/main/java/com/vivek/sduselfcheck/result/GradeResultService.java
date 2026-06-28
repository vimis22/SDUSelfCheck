package com.vivek.sduselfcheck.result;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.teacher.Teacher;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GradeResultService {

    private final GradeResultRepository gradeResultRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final TeacherRepository teacherRepository;

    public GradeResultService(
            GradeResultRepository gradeResultRepository,
            ExamRegistrationRepository examRegistrationRepository,
            TeacherRepository teacherRepository
    ) {
        this.gradeResultRepository = gradeResultRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.teacherRepository = teacherRepository;
    }

    public List<GradeResultResponse> getAllGradeResults() {
        return gradeResultRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public GradeResultResponse getGradeResultById(Long gradeResultId) {
        GradeResult gradeResult = gradeResultRepository.findById(gradeResultId)
                .orElseThrow(() -> new RuntimeException("Grade result not found with id: " + gradeResultId));

        return mapToResponse(gradeResult);
    }

    public GradeResultResponse getGradeResultByExamRegistrationId(Long examRegistrationId) {
        GradeResult gradeResult = gradeResultRepository
                .findByExamRegistrationExamRegistrationId(examRegistrationId)
                .orElseThrow(() -> new RuntimeException("Grade result not found for exam registration id: " + examRegistrationId));

        return mapToResponse(gradeResult);
    }

    public List<GradeResultResponse> getGradeResultsByStudentId(Long studentId) {
        return gradeResultRepository.findByExamRegistrationStudentStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<GradeResultResponse> getGradeResultsByTeacherId(Long teacherId) {
        return gradeResultRepository.findByTeacherTeacherId(teacherId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public GradeResultResponse createGradeResult(GradeResultRequest request) {
        ExamRegistration examRegistration = examRegistrationRepository.findById(request.getExamRegistrationId())
                .orElseThrow(() -> new RuntimeException("Exam registration not found with id: " + request.getExamRegistrationId()));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + request.getTeacherId()));

        if (gradeResultRepository.existsByExamRegistrationExamRegistrationId(request.getExamRegistrationId())) {
            throw new RuntimeException("A grade result already exists for exam registration id: " + request.getExamRegistrationId());
        }

        GradeResult gradeResult = new GradeResult();
        gradeResult.setExamRegistration(examRegistration);
        gradeResult.setTeacher(teacher);
        gradeResult.setGradeValue(request.getGradeValue());
        gradeResult.setEctsGrade(request.getEctsGrade());
        gradeResult.setPassed(request.isPassed());
        gradeResult.setFeedback(request.getFeedback());
        gradeResult.setGradedAt(LocalDateTime.now());

        gradeResultRepository.save(gradeResult);
        return mapToResponse(gradeResult);
    }

    public GradeResultResponse updateGradeResult(Long gradeResultId, GradeResultRequest request) {
        GradeResult gradeResult = gradeResultRepository.findById(gradeResultId)
                .orElseThrow(() -> new RuntimeException("Grade result not found with id: " + gradeResultId));

        ExamRegistration examRegistration = examRegistrationRepository.findById(request.getExamRegistrationId())
                .orElseThrow(() -> new RuntimeException("Exam registration not found with id: " + request.getExamRegistrationId()));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + request.getTeacherId()));

        boolean examRegistrationChanged = !gradeResult.getExamRegistration().getExamRegistrationId()
                .equals(request.getExamRegistrationId());

        if (examRegistrationChanged && gradeResultRepository.existsByExamRegistrationExamRegistrationId(request.getExamRegistrationId())) {
            throw new RuntimeException("A grade result already exists for exam registration id: " + request.getExamRegistrationId());
        }

        gradeResult.setExamRegistration(examRegistration);
        gradeResult.setTeacher(teacher);
        gradeResult.setGradeValue(request.getGradeValue());
        gradeResult.setEctsGrade(request.getEctsGrade());
        gradeResult.setPassed(request.isPassed());
        gradeResult.setFeedback(request.getFeedback());
        gradeResult.setGradedAt(LocalDateTime.now());

        gradeResultRepository.save(gradeResult);
        return mapToResponse(gradeResult);
    }

    private GradeResultResponse mapToResponse(GradeResult gradeResult) {
        ExamRegistration examRegistration = gradeResult.getExamRegistration();
        Student student = examRegistration.getStudent();
        Exam exam = examRegistration.getExam();
        Course course = exam.getCourse();
        Teacher teacher = gradeResult.getTeacher();

        return new GradeResultResponse(
                gradeResult.getGradeResultId(),

                examRegistration.getExamRegistrationId(),

                student.getStudentId(),
                student.getStudentNumber(),
                student.getUser().getFirstName(),
                student.getUser().getLastName(),

                exam.getExamId(),
                exam.getTitle(),
                exam.getExamType(),
                exam.getExamDate(),

                course.getCourseId(),
                course.getCode(),
                course.getName(),

                teacher.getTeacherId(),
                teacher.getEmployeeNumber(),
                teacher.getAppUser().getFirstName(),
                teacher.getAppUser().getLastName(),

                gradeResult.getGradeValue(),
                gradeResult.getEctsGrade(),
                gradeResult.isPassed(),
                gradeResult.getFeedback(),
                gradeResult.getGradedAt()
        );
    }
}