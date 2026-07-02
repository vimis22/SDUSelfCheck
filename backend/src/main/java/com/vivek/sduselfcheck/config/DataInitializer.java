package com.vivek.sduselfcheck.config;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.education.Education;
import com.vivek.sduselfcheck.education.EducationRepository;
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
import com.vivek.sduselfcheck.user.AppUser;
import com.vivek.sduselfcheck.user.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExamRegistrationRepository examRegistrationRepository;
    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final EducationRepository educationRepository;
    private final TeacherRepository teacherRepository;
    private final GradeResultRepository gradeResultRepository;
    private final StudentRepository studentRepository;
    private final AppUserRepository appUserRepository;

    public DataInitializer(
            ExamRegistrationRepository examRegistrationRepository,
            ExamRepository examRepository,
            CourseRepository courseRepository,
            EducationRepository educationRepository,
            TeacherRepository teacherRepository,
            GradeResultRepository gradeResultRepository,
            StudentRepository studentRepository,
            AppUserRepository appUserRepository
    ) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.educationRepository = educationRepository;
        this.teacherRepository = teacherRepository;
        this.gradeResultRepository = gradeResultRepository;
        this.studentRepository = studentRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public void run(String... args) {
        ensureTestUsers();
        updateStudentDocumentPreviewData();
        ensureAvailableCourses();
        ensurePendingExamRegistration();

        if (gradeResultRepository.count() > 0) {
            System.out.println("Grade result test data already exists.");
            ensureFailedGradeResult();
            ensureReexamExam();
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
        ensureFailedGradeResult();
        ensureReexamExam();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Ensure canonical test users exist with correct credentials
    // ─────────────────────────────────────────────────────────────────────────────
    private void ensureTestUsers() {
        // Update existing student user (id=1) to canonical login credentials
        appUserRepository.findById(1L).ifPresent(user -> {
            boolean updated = false;
            if (!"student@sdu.dk".equals(user.getEmail())) {
                user.setEmail("student@sdu.dk");
                updated = true;
            }
            if (!"password".equals(user.getPasswordHash())) {
                user.setPasswordHash("password");
                updated = true;
            }
            if (!"STUDENT".equals(user.getRole())) {
                user.setRole("STUDENT");
                updated = true;
            }
            if (updated) {
                appUserRepository.save(user);
                System.out.println("Student user updated → student@sdu.dk / password");
            }
        });

        // Update existing teacher user (id=2) to canonical login credentials
        appUserRepository.findById(2L).ifPresent(user -> {
            boolean updated = false;
            if (!"teacher@sdu.dk".equals(user.getEmail())) {
                user.setEmail("teacher@sdu.dk");
                updated = true;
            }
            if (!"password".equals(user.getPasswordHash())) {
                user.setPasswordHash("password");
                updated = true;
            }
            if (!"TEACHER".equals(user.getRole())) {
                user.setRole("TEACHER");
                updated = true;
            }
            if (updated) {
                appUserRepository.save(user);
                System.out.println("Teacher user updated → teacher@sdu.dk / password");
            }
        });

        // Create admin user if not exists
        if (appUserRepository.findByEmail("admin@sdu.dk").isEmpty()) {
            AppUser admin = new AppUser();
            admin.setEmail("admin@sdu.dk");
            admin.setPasswordHash("password");
            admin.setRole("ADMIN");
            admin.setFirstName("Admin");
            admin.setLastName("SDU");
            admin.setStatus("ACTIVE");
            appUserRepository.save(admin);
            System.out.println("Admin user created → admin@sdu.dk / password");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Course setup
    //
    // semesterNumber convention:
    //   1  → 1. semester
    //   2  → 2. semester
    //   3  → 3. semester (elective courses)
    //  34  → 3. + 4. semester (Speciale 40 ECTS)
    //   4  → 4. semester (Speciale 30 ECTS)
    // ─────────────────────────────────────────────────────────────────────────────
    private void ensureAvailableCourses() {
        Education education = educationRepository.findById(1L).orElse(null);
        if (education == null) {
            System.out.println("Education id=1 not found. Skipping available courses setup.");
            return;
        }

        // code, name, ects, semesterNumber, mandatory
        Object[][] courseDefs = {
                // ── 3. semester elective courses ───────────────────────────────────────
                {"SE-EIS-03",  "Engineering of Innovative Software",  10,  3, false},
                {"SE-ICP-03",  "In-company Project",                  15,  3, false},
                {"SE-SM-03",   "Software Maintenance",                 5,  3, false},
                {"SE-CC-04",   "Cloud Computing Continuum",            5,  3, false},
                {"SE-CYB-04",  "Cybersecurity",                        5,  3, false},
                {"SE-DV-04",   "Data Visualization",                   5,  3, false},
                {"SE-HRI-04",  "Human-Robot Interaction",              5,  3, false},
                {"SE-EL-04",   "Embedded Linux",                       5,  3, false},
                // ── Speciale courses ───────────────────────────────────────────────────
                // semesterNumber 34 = spans 3. + 4. semester
                {"SE-MT40",    "Master's Thesis 40 ECTS",             40, 34, false},
                // semesterNumber 4 = 4. semester only
                {"SE-MT30",    "Master's Thesis 30 ECTS",             30,  4, false},
        };

        for (Object[] def : courseDefs) {
            String code       = (String)  def[0];
            String name       = (String)  def[1];
            Integer ects      = (Integer) def[2];
            Integer semester  = (Integer) def[3];
            Boolean mandatory = (Boolean) def[4];

            Course course = courseRepository.findByCode(code).orElse(null);
            if (course == null) {
                course = new Course(name, code, ects, semester, mandatory, education);
                courseRepository.save(course);
                System.out.println("Course created: " + name + " (semester " + semester + ")");
            } else if (!course.getSemesterNumber().equals(semester)) {
                // Fix wrong semester number from a previous run
                System.out.println("Fixing semester for '" + course.getName()
                        + "': " + course.getSemesterNumber() + " → " + semester);
                course.setSemesterNumber(semester);
                courseRepository.save(course);
            }

            // Ensure an ordinary exam exists
            if (examRepository.findFirstByCourseAndReexamFalse(course).isEmpty()) {
                Exam exam = new Exam(
                        name + " Eksamen",
                        "WRITTEN",
                        LocalDate.of(2026, 8, 15),
                        null,
                        null,
                        "Campus Odense",
                        false,
                        course
                );
                examRepository.save(exam);
                System.out.println("Ordinary exam created for: " + name);
            }
        }
    }

    // ── Ensures there is always at least one exam registration without a grade ───
    private void ensurePendingExamRegistration() {
        if (!examRegistrationRepository.findAllWithoutGradeResult().isEmpty()) {
            System.out.println("Pending exam registration already exists. Skipping.");
            return;
        }

        Student student = studentRepository.findById(1L).orElse(null);
        if (student == null) {
            System.out.println("Student not found. Skipping pending exam registration.");
            return;
        }

        Course targetCourse = courseRepository.findByCode("TS20054102").orElse(null);

        if (targetCourse == null) {
            System.out.println("Course TS20054102 not found. Skipping pending exam registration.");
            return;
        }

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

        if (!examRegistrationRepository.existsByStudentStudentIdAndExamExamIdAndAttemptNumber(studentId, examId, 1)) {
            examRegistrationRepository.save(
                    new ExamRegistration(student, targetExam, "REGISTERED", LocalDate.now(), 1)
            );
            System.out.println("Pending exam registration (attempt 1) created for: " + targetExam.getTitle());
            return;
        }

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
        Student student = studentRepository.findById(1L).orElse(null);

        if (student == null) {
            System.out.println("Student test data was not updated because student_id 1 was not found.");
            return;
        }

        student.setEnrollmentStatus("ACTIVE");
        student.setSemester(2);
        studentRepository.save(student);

        System.out.println("Student document preview test data updated.");
    }

    private void ensureFailedGradeResult() {
        List<GradeResult> studentGrades = gradeResultRepository.findByExamRegistrationStudentStudentId(1L);

        boolean alreadyHasFailed = studentGrades.stream().anyMatch(gr -> !gr.isPassed());
        if (alreadyHasFailed) {
            System.out.println("Failed grade result already exists. Skipping.");
            return;
        }

        if (studentGrades.isEmpty()) {
            System.out.println("No grade results found for student 1. Skipping failed grade setup.");
            return;
        }

        GradeResult gradeResult = studentGrades.get(0);
        gradeResult.setGradeValue("00");
        gradeResult.setEctsGrade("Fx");
        gradeResult.setPassed(false);
        gradeResultRepository.save(gradeResult);
        System.out.println("Updated grade result id=" + gradeResult.getGradeResultId() + " to failed (00/Fx).");
    }

    private void ensureReexamExam() {
        List<GradeResult> failedGrades = gradeResultRepository.findByExamRegistrationStudentStudentId(1L)
                .stream()
                .filter(gr -> !gr.isPassed())
                .toList();

        if (failedGrades.isEmpty()) {
            System.out.println("No failed grade results found. Skipping re-exam setup.");
            return;
        }

        for (GradeResult failed : failedGrades) {
            Course course = failed.getExamRegistration().getExam().getCourse();

            if (examRepository.findFirstByCourseAndReexamTrue(course).isPresent()) {
                System.out.println("Re-exam already exists for course: " + course.getName() + ". Skipping.");
                continue;
            }

            Exam reexam = new Exam(
                    course.getName() + " Re-eksamen",
                    "WRITTEN",
                    LocalDate.of(2026, 11, 15),
                    null,
                    null,
                    "Campus Odense",
                    true,
                    course
            );
            examRepository.save(reexam);
            System.out.println("Re-exam created for course: " + course.getName());
        }
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
