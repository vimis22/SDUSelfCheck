package com.vivek.sduselfcheck.config;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.exam.ExamRepository;
import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.result.GradeResult;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.student.StudentRepository;
import com.vivek.sduselfcheck.teacher.Teacher;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExamRegistrationRepository examRegistrationRepository;
    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final GradeResultRepository gradeResultRepository;
    private final StudentRepository studentRepository;

    public DataInitializer(
            ExamRegistrationRepository examRegistrationRepository,
            ExamRepository examRepository,
            CourseRepository courseRepository,
            TeacherRepository teacherRepository,
            GradeResultRepository gradeResultRepository,
            StudentRepository studentRepository
    ) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.gradeResultRepository = gradeResultRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public void run(String... args) {
        updateStudentDocumentPreviewData();
        ensurePendingExamRegistration();

        if (gradeResultRepository.count() > 0) {
            System.out.println("Grade result test data already exists.");
            return;
        }

        List<ExamRegistration> examRegistrations = examRegistrationRepository.findAll();
        List<Teacher> teachers = teacherRepository.findAll();

        if (examRegistrations.isEmpty()) {
            System.out.println("No exam registrations found. Grade result test data was not inserted.");
            return;
        }

        if (teachers.isEmpty()) {
            System.out.println("No teachers found. Grade result test data was not inserted.");
            return;
        }

        Teacher teacher = teachers.get(0);

        if (examRegistrations.size() >= 1) {
            createGradeResult(
                    examRegistrations.get(0),
                    teacher,
                    "10",
                    "B",
                    true,
                    "Good performance. The student demonstrates strong understanding of the course content."
            );
        }

        if (examRegistrations.size() >= 2) {
            createGradeResult(
                    examRegistrations.get(1),
                    teacher,
                    "7",
                    "C",
                    true,
                    "Solid performance. The student has met the learning objectives with some minor weaknesses."
            );
        }

        if (examRegistrations.size() >= 3) {
            createGradeResult(
                    examRegistrations.get(2),
                    teacher,
                    "12",
                    "A",
                    true,
                    "Excellent performance. The student demonstrates a very high level of understanding."
            );
        }

        if (examRegistrations.size() >= 4) {
            createGradeResult(
                    examRegistrations.get(3),
                    teacher,
                    "02",
                    "E",
                    true,
                    "The student has passed, but the performance only meets the minimum requirements."
            );
        }

        System.out.println("Grade result test data inserted.");
    }

    private void ensurePendingExamRegistration() {
        // Already have a pending registration — nothing to do
        if (!examRegistrationRepository.findAllWithoutGradeResult().isEmpty()) {
            System.out.println("Pending exam registration already exists. Skipping.");
            return;
        }

        Student student = studentRepository.findById(1L).orElse(null);
        if (student == null) {
            System.out.println("Student not found. Skipping pending exam registration.");
            return;
        }

        // Find target course by code
        Course targetCourse = courseRepository.findByCode("TS20054102").orElse(null);

        if (targetCourse == null) {
            System.out.println("Course TS20054102 not found. Skipping pending exam registration.");
            return;
        }

        // Find or create an exam for this course
        List<Exam> examsForCourse = examRepository.findByCourse(targetCourse);

        Exam targetExam;

        if (examsForCourse.isEmpty()) {
            targetExam = new Exam(
                    "Engineering Research in Software Exam",
                    "WRITTEN",
                    LocalDate.of(2026, 8, 20),
                    null,
                    null,
                    "Campus Odense",
                    false,
                    targetCourse
            );
            examRepository.save(targetExam);
            System.out.println("Exam created for course: " + targetCourse.getName());
        } else {
            targetExam = examsForCourse.get(0);
        }

        Long studentId = student.getStudentId();
        Long examId = targetExam.getExamId();

        // Try attempt 1 first
        if (!examRegistrationRepository.existsByStudentStudentIdAndExamExamIdAndAttemptNumber(studentId, examId, 1)) {
            examRegistrationRepository.save(
                    new ExamRegistration(student, targetExam, "REGISTERED", LocalDate.now(), 1)
            );
            System.out.println("Pending exam registration (attempt 1) created for: " + targetExam.getTitle());
            return;
        }

        // Attempt 1 exists with a grade result — try attempt 2
        if (!examRegistrationRepository.existsByStudentStudentIdAndExamExamIdAndAttemptNumber(studentId, examId, 2)) {
            examRegistrationRepository.save(
                    new ExamRegistration(student, targetExam, "REGISTERED", LocalDate.now(), 2)
            );
            System.out.println("Pending exam registration (attempt 2) created for: " + targetExam.getTitle());
        } else {
            System.out.println("All registrations for this exam already have grade results. Skipping.");
        }
    }

    private void updateStudentDocumentPreviewData() {
        Student student = studentRepository.findById(1L)
                .orElse(null);

        if (student == null) {
            System.out.println("Student test data was not updated because student_id 1 was not found.");
            return;
        }

        student.setEnrollmentStatus("ACTIVE");
        student.setSemester(2);

        studentRepository.save(student);

        System.out.println("Student document preview test data updated.");
    }

    private void createGradeResult(
            ExamRegistration examRegistration,
            Teacher teacher,
            String gradeValue,
            String ectsGrade,
            boolean passed,
            String feedback
    ) {
        if (gradeResultRepository.existsByExamRegistrationExamRegistrationId(
                examRegistration.getExamRegistrationId()
        )) {
            return;
        }

        GradeResult gradeResult = new GradeResult();
        gradeResult.setExamRegistration(examRegistration);
        gradeResult.setTeacher(teacher);
        gradeResult.setGradeValue(gradeValue);
        gradeResult.setEctsGrade(ectsGrade);
        gradeResult.setPassed(passed);
        gradeResult.setFeedback(feedback);
        gradeResult.setGradedAt(LocalDateTime.now());

        gradeResultRepository.save(gradeResult);
    }
}
