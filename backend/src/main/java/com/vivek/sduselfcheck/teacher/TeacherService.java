package com.vivek.sduselfcheck.teacher;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.enrollment.CourseEnrollmentRepository;
import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.exam.ExamRepository;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.examregistration.PendingGradeRegistrationResponse;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ExamRepository examRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final GradeResultRepository gradeResultRepository;

    public TeacherService(
            TeacherRepository teacherRepository,
            CourseRepository courseRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            ExamRepository examRepository,
            ExamRegistrationRepository examRegistrationRepository,
            GradeResultRepository gradeResultRepository
    ) {
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.examRepository = examRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.gradeResultRepository = gradeResultRepository;
    }

    // ── All teachers (admin use) ──────────────────────────────────────────────────

    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll(Sort.by(Sort.Direction.ASC, "teacherId"))
                .stream()
                .map(teacher -> new TeacherResponse(
                        teacher.getTeacherId(),
                        teacher.getEmployeeNumber(),
                        teacher.getAppUser().getFirstName(),
                        teacher.getAppUser().getMiddleName(),
                        teacher.getAppUser().getLastName(),
                        teacher.getAppUser().getEmail(),
                        teacher.getAppUser().getRole(),
                        teacher.getAppUser().getStatus(),
                        teacher.getDepartment()
                ))
                .toList();
    }

    // ── Teacher's courses ─────────────────────────────────────────────────────────

    public List<TeacherCourseResponse> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherTeacherId(teacherId)
                .stream()
                .map(course -> {
                    int enrolled = (int) courseEnrollmentRepository.findByCourseCourseId(course.getCourseId())
                            .stream().filter(e -> "ENROLLED".equals(e.getStatus())).count();
                    return new TeacherCourseResponse(
                            course.getCourseId(),
                            course.getCode(),
                            course.getName(),
                            course.getEcts(),
                            course.getSemesterNumber(),
                            course.getMandatory(),
                            course.getEducation() != null ? course.getEducation().getName() : null,
                            enrolled
                    );
                })
                .toList();
    }

    public List<TeacherCourseStudentResponse> getStudentsByCourseId(Long teacherId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        if (course.getTeacher() == null || !course.getTeacher().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Course does not belong to this teacher.");
        }
        return courseEnrollmentRepository.findByCourseCourseId(courseId)
                .stream()
                .map(e -> {
                    Long studentId = e.getStudent().getStudentId();
                    boolean hasExamReg = examRepository.findFirstByCourseAndReexamFalse(course)
                            .map(exam -> examRegistrationRepository
                                    .existsByStudentStudentIdAndExamExamId(studentId, exam.getExamId()))
                            .orElse(false);
                    return new TeacherCourseStudentResponse(
                            studentId,
                            e.getStudent().getStudentNumber(),
                            e.getStudent().getUser().getFirstName(),
                            e.getStudent().getUser().getLastName(),
                            e.getStudent().getUser().getEmail(),
                            e.getStatus(),
                            hasExamReg
                    );
                })
                .toList();
    }

    // ── Teacher's exams ───────────────────────────────────────────────────────────

    public List<TeacherExamResponse> getExamsByTeacherId(Long teacherId) {
        List<Course> courses = courseRepository.findByTeacherTeacherId(teacherId);
        if (courses.isEmpty()) return List.of();
        List<Exam> exams = examRepository.findByCourseIn(courses);
        return exams.stream()
                .map(exam -> {
                    int regCount = (int) examRegistrationRepository.findByExamExamId(exam.getExamId())
                            .stream().filter(r -> "REGISTERED".equals(r.getStatus())).count();
                    return new TeacherExamResponse(
                            exam.getExamId(),
                            exam.getTitle(),
                            exam.getExamType(),
                            exam.getExamDate(),
                            exam.getStartTime() != null ? exam.getStartTime().toString() : null,
                            exam.getEndTime() != null ? exam.getEndTime().toString() : null,
                            exam.getLocation(),
                            exam.getReexam(),
                            exam.getCourse().getCourseId(),
                            exam.getCourse().getCode(),
                            exam.getCourse().getName(),
                            regCount
                    );
                })
                .toList();
    }

    public List<TeacherExamRegistrationDetailResponse> getRegistrationsByExamId(Long teacherId, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));
        Course course = exam.getCourse();
        if (course.getTeacher() == null || !course.getTeacher().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Exam does not belong to this teacher.");
        }
        return examRegistrationRepository.findByExamExamId(examId)
                .stream()
                .map(r -> {
                    boolean hasResult = gradeResultRepository
                            .existsByExamRegistrationExamRegistrationId(r.getExamRegistrationId());
                    return new TeacherExamRegistrationDetailResponse(
                            r.getExamRegistrationId(),
                            r.getStudent().getStudentId(),
                            r.getStudent().getStudentNumber(),
                            r.getStudent().getUser().getFirstName(),
                            r.getStudent().getUser().getLastName(),
                            r.getStatus(),
                            r.getAttemptNumber(),
                            hasResult
                    );
                })
                .toList();
    }

    // ── Pending registrations (no grade yet) for teacher's courses ────────────────

    public List<PendingGradeRegistrationResponse> getPendingRegistrationsByTeacherId(Long teacherId) {
        List<Course> courses = courseRepository.findByTeacherTeacherId(teacherId);
        if (courses.isEmpty()) return List.of();
        Set<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toSet());
        return examRegistrationRepository.findAllWithoutGradeResult()
                .stream()
                .filter(r -> courseIds.contains(r.getExam().getCourse().getCourseId()))
                .map(r -> new PendingGradeRegistrationResponse(
                        r.getExamRegistrationId(),
                        r.getStudent().getStudentId(),
                        r.getStudent().getStudentNumber(),
                        r.getStudent().getUser().getFirstName(),
                        r.getStudent().getUser().getLastName(),
                        r.getExam().getExamId(),
                        r.getExam().getTitle(),
                        r.getExam().getExamType(),
                        r.getExam().getExamDate(),
                        r.getExam().getCourse().getCourseId(),
                        r.getExam().getCourse().getCode(),
                        r.getExam().getCourse().getName(),
                        r.getStatus(),
                        r.getAttemptNumber()
                ))
                .toList();
    }
}
