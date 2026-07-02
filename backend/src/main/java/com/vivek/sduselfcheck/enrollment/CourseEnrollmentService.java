package com.vivek.sduselfcheck.enrollment;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.exam.ExamRepository;
import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.student.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final GradeResultRepository gradeResultRepository;

    public CourseEnrollmentService(
            CourseEnrollmentRepository courseEnrollmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            ExamRepository examRepository,
            ExamRegistrationRepository examRegistrationRepository,
            GradeResultRepository gradeResultRepository
    ) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.gradeResultRepository = gradeResultRepository;
    }

    public List<CourseEnrollmentResponse> getAllEnrollments() {
        return courseEnrollmentRepository.findAll(Sort.by(Sort.Direction.ASC, "enrollmentId"))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CourseEnrollmentResponse> getEnrollmentsByStudentId(Long studentId) {
        return courseEnrollmentRepository.findByStudentStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CourseEnrollmentResponse enrollInCourse(CourseEnrollmentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));

        Optional<CourseEnrollment> existing = courseEnrollmentRepository
                .findByStudentStudentIdAndCourseCourseId(request.getStudentId(), request.getCourseId());

        CourseEnrollment enrollment;
        if (existing.isPresent()) {
            enrollment = existing.get();
            if ("ENROLLED".equals(enrollment.getStatus())) {
                throw new RuntimeException("Student is already enrolled in course: " + course.getName());
            }
            // Re-enrollment after cancellation
            enrollment.setStatus("ENROLLED");
            enrollment.setEnrolledAt(LocalDate.now());
        } else {
            enrollment = new CourseEnrollment(student, course, "ENROLLED", LocalDate.now());
        }
        courseEnrollmentRepository.save(enrollment);

        // Ensure ordinary exam registration exists (create or re-activate)
        Optional<Exam> ordinaryExamOpt = examRepository.findFirstByCourseAndReexamFalse(course);
        if (ordinaryExamOpt.isPresent()) {
            Exam exam = ordinaryExamOpt.get();
            Optional<ExamRegistration> existingReg = examRegistrationRepository
                    .findByStudentStudentIdAndExamExamId(student.getStudentId(), exam.getExamId());
            if (existingReg.isPresent()) {
                ExamRegistration reg = existingReg.get();
                if (!"REGISTERED".equals(reg.getStatus())) {
                    reg.setStatus("REGISTERED");
                    examRegistrationRepository.save(reg);
                }
            } else {
                examRegistrationRepository.save(
                        new ExamRegistration(student, exam, "REGISTERED", LocalDate.now(), 1)
                );
            }
        }

        return mapToResponse(enrollment);
    }

    public CourseEnrollmentResponse cancelEnrollment(CourseEnrollmentRequest request) {
        studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));

        courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));

        CourseEnrollment enrollment = courseEnrollmentRepository
                .findByStudentStudentIdAndCourseCourseId(request.getStudentId(), request.getCourseId())
                .orElseThrow(() -> new RuntimeException("No enrollment found for student "
                        + request.getStudentId() + " in course " + request.getCourseId()));

        if (!"ENROLLED".equals(enrollment.getStatus())) {
            throw new RuntimeException("Enrollment is not active (current status: " + enrollment.getStatus() + ")");
        }

        // Block cancellation if student already has a grade result for this course
        Optional<ExamRegistration> ordinaryReg = examRegistrationRepository
                .findByStudentStudentIdAndExamCourseCourseIdAndExamReexamFalse(
                        request.getStudentId(), request.getCourseId());

        if (ordinaryReg.isPresent()
                && gradeResultRepository.existsByExamRegistrationExamRegistrationId(
                        ordinaryReg.get().getExamRegistrationId())) {
            throw new RuntimeException("Cannot cancel enrollment – a grade result already exists for this course.");
        }

        // Cancel enrollment
        enrollment.setStatus("CANCELLED");
        courseEnrollmentRepository.save(enrollment);

        // Cancel the ordinary exam registration
        ordinaryReg.ifPresent(reg -> {
            if ("REGISTERED".equals(reg.getStatus())) {
                reg.setStatus("CANCELLED");
                examRegistrationRepository.save(reg);
            }
        });

        return mapToResponse(enrollment);
    }

    private CourseEnrollmentResponse mapToResponse(CourseEnrollment enrollment) {
        return new CourseEnrollmentResponse(
                enrollment.getEnrollmentId(),
                enrollment.getStudent().getStudentId(),
                enrollment.getStudent().getStudentNumber(),
                enrollment.getStudent().getUser().getFirstName(),
                enrollment.getStudent().getUser().getLastName(),
                enrollment.getCourse().getCourseId(),
                enrollment.getCourse().getCode(),
                enrollment.getCourse().getName(),
                enrollment.getCourse().getEcts(),
                enrollment.getCourse().getSemesterNumber(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt()
        );
    }
}
