package com.vivek.sduselfcheck.admin;

import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.enrollment.CourseEnrollment;
import com.vivek.sduselfcheck.enrollment.CourseEnrollmentRepository;
import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import com.vivek.sduselfcheck.student.StudentRepository;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import com.vivek.sduselfcheck.user.AppUser;
import com.vivek.sduselfcheck.user.AppUserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final AppUserRepository appUserRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final GradeResultRepository gradeResultRepository;

    public AdminService(
            AppUserRepository appUserRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            ExamRegistrationRepository examRegistrationRepository,
            GradeResultRepository gradeResultRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.gradeResultRepository = gradeResultRepository;
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public AdminStatsResponse getStats() {
        long userCount = appUserRepository.count();
        long studentCount = studentRepository.count();
        long teacherCount = teacherRepository.count();
        long courseCount = courseRepository.count();
        long activeEnrollmentCount = courseEnrollmentRepository.findAll().stream()
                .filter(e -> "ENROLLED".equals(e.getStatus())).count();
        long activeExamRegCount = examRegistrationRepository.findAll().stream()
                .filter(r -> "REGISTERED".equals(r.getStatus())).count();
        return new AdminStatsResponse(userCount, studentCount, teacherCount, courseCount,
                activeEnrollmentCount, activeExamRegCount);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public List<AdminUserResponse> getAllUsers() {
        Map<Long, Long> userToStudent = new HashMap<>();
        studentRepository.findAll()
                .forEach(s -> userToStudent.put(s.getUser().getUserId(), s.getStudentId()));

        Map<Long, Long> userToTeacher = new HashMap<>();
        teacherRepository.findAll()
                .forEach(t -> userToTeacher.put(t.getAppUser().getUserId(), t.getTeacherId()));

        return appUserRepository.findAll(Sort.by("userId")).stream()
                .map(u -> new AdminUserResponse(
                        u.getUserId(),
                        u.getEmail(),
                        u.getRole(),
                        u.getStatus(),
                        u.getFirstName(),
                        u.getLastName(),
                        userToStudent.get(u.getUserId()),
                        userToTeacher.get(u.getUserId())
                ))
                .toList();
    }

    public void disableUser(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setStatus("DISABLED");
        appUserRepository.save(user);
    }

    public void enableUser(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setStatus("ACTIVE");
        appUserRepository.save(user);
    }

    // ── Students ──────────────────────────────────────────────────────────────

    public List<AdminStudentResponse> getAllStudents() {
        return studentRepository.findAll(Sort.by("studentId")).stream()
                .map(s -> new AdminStudentResponse(
                        s.getStudentId(),
                        s.getStudentNumber(),
                        s.getUser().getFirstName(),
                        s.getUser().getLastName(),
                        s.getUser().getEmail(),
                        s.getEducation() != null ? s.getEducation().getName() : null,
                        s.getSemester(),
                        s.getEnrollmentStatus()
                ))
                .toList();
    }

    // ── Course Enrollments ────────────────────────────────────────────────────

    public List<AdminEnrollmentResponse> getAllCourseEnrollments() {
        return courseEnrollmentRepository.findAll(Sort.by("enrollmentId")).stream()
                .map(e -> new AdminEnrollmentResponse(
                        e.getEnrollmentId(),
                        e.getStudent().getStudentId(),
                        e.getStudent().getStudentNumber(),
                        e.getStudent().getUser().getFirstName(),
                        e.getStudent().getUser().getLastName(),
                        e.getCourse().getCourseId(),
                        e.getCourse().getCode(),
                        e.getCourse().getName(),
                        e.getStatus(),
                        e.getEnrolledAt()
                ))
                .toList();
    }

    public void cancelCourseEnrollment(Long enrollmentId) {
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));

        if (!"ENROLLED".equals(enrollment.getStatus())) {
            throw new RuntimeException("Enrollment is not active (status: " + enrollment.getStatus() + ").");
        }

        Optional<ExamRegistration> ordinaryReg = examRegistrationRepository
                .findByStudentStudentIdAndExamCourseCourseIdAndExamReexamFalse(
                        enrollment.getStudent().getStudentId(), enrollment.getCourse().getCourseId());

        if (ordinaryReg.isPresent() && gradeResultRepository.existsByExamRegistrationExamRegistrationId(
                ordinaryReg.get().getExamRegistrationId())) {
            throw new RuntimeException("Cannot cancel – a grade result already exists for this course.");
        }

        enrollment.setStatus("CANCELLED");
        courseEnrollmentRepository.save(enrollment);

        ordinaryReg.ifPresent(reg -> {
            if ("REGISTERED".equals(reg.getStatus())) {
                reg.setStatus("CANCELLED");
                examRegistrationRepository.save(reg);
            }
        });
    }

    // ── Exam Registrations ────────────────────────────────────────────────────

    public List<AdminExamRegistrationResponse> getAllExamRegistrations() {
        return examRegistrationRepository.findAll(Sort.by("examRegistrationId")).stream()
                .map(r -> new AdminExamRegistrationResponse(
                        r.getExamRegistrationId(),
                        r.getStudent().getStudentId(),
                        r.getStudent().getStudentNumber(),
                        r.getStudent().getUser().getFirstName(),
                        r.getStudent().getUser().getLastName(),
                        r.getExam().getExamId(),
                        r.getExam().getTitle(),
                        r.getExam().getReexam(),
                        r.getExam().getCourse().getCourseId(),
                        r.getExam().getCourse().getCode(),
                        r.getExam().getCourse().getName(),
                        r.getStatus(),
                        r.getAttemptNumber(),
                        r.getRegisteredAt()
                ))
                .toList();
    }

    public void cancelExamRegistration(Long registrationId) {
        ExamRegistration reg = examRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        if (!"REGISTERED".equals(reg.getStatus())) {
            throw new RuntimeException("Registration is not active (status: " + reg.getStatus() + ").");
        }

        if (gradeResultRepository.existsByExamRegistrationExamRegistrationId(registrationId)) {
            throw new RuntimeException("Cannot cancel – a grade result exists for this registration.");
        }

        reg.setStatus("CANCELLED");
        examRegistrationRepository.save(reg);
    }
}
