package com.vivek.sduselfcheck.config;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.education.Education;
import com.vivek.sduselfcheck.education.EducationRepository;
import com.vivek.sduselfcheck.enrollment.CourseEnrollment;
import com.vivek.sduselfcheck.enrollment.CourseEnrollmentRepository;
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
import com.vivek.sduselfcheck.studentcard.StudentCard;
import com.vivek.sduselfcheck.studentcard.StudentCardRepository;
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
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentCardRepository studentCardRepository;

    public DataInitializer(
            ExamRegistrationRepository examRegistrationRepository,
            ExamRepository examRepository,
            CourseRepository courseRepository,
            EducationRepository educationRepository,
            TeacherRepository teacherRepository,
            GradeResultRepository gradeResultRepository,
            StudentRepository studentRepository,
            AppUserRepository appUserRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            StudentCardRepository studentCardRepository
    ) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.educationRepository = educationRepository;
        this.teacherRepository = teacherRepository;
        this.gradeResultRepository = gradeResultRepository;
        this.studentRepository = studentRepository;
        this.appUserRepository = appUserRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.studentCardRepository = studentCardRepository;
    }

    @Override
    public void run(String... args) {
        ensureTestUsers();
        updateStudentDocumentPreviewData();
        ensureAvailableCourses();
        ensureTeacherCourses();
        ensureStudentCards();
        ensurePendingExamRegistration();

        if (gradeResultRepository.count() > 0) {
            System.out.println("Grade result test data already exists.");
            ensureFailedGradeResult();
            ensureReexamExam();
            ensureTeacherTestData();
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
        ensureTeacherTestData();
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
    // General course setup (existing courses, not teacher-specific)
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
                {"SE-SM-03",   "Software Maintenance",                 5,  3, false},
                {"SE-CC-04",   "Cloud Computing Continuum",            5,  3, false},
                {"SE-CYB-04",  "Cybersecurity",                        5,  3, false},
                {"SE-DV-04",   "Data Visualization",                   5,  3, false},
                {"SE-HRI-04",  "Human-Robot Interaction",              5,  3, false},
                {"SE-EL-04",   "Embedded Linux",                       5,  3, false},
                // ── Speciale courses ───────────────────────────────────────────────────
                {"SE-MT40",    "Master's Thesis 40 ECTS",             40, 34, false},
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

    // ─────────────────────────────────────────────────────────────────────────────
    // Teacher-specific courses — assigned to the teacher user
    // ─────────────────────────────────────────────────────────────────────────────
    private void ensureTeacherCourses() {
        AppUser teacherUser = appUserRepository.findByEmail("teacher@sdu.dk").orElse(null);
        if (teacherUser == null) {
            System.out.println("Teacher user not found. Skipping teacher courses setup.");
            return;
        }

        Teacher teacher = teacherRepository.findByAppUserUserId(teacherUser.getUserId()).orElse(null);
        if (teacher == null) {
            System.out.println("Teacher entity not found for teacher@sdu.dk. Skipping teacher courses setup.");
            return;
        }

        Education education = educationRepository.findById(1L).orElse(null);
        if (education == null) {
            System.out.println("Education id=1 not found. Skipping teacher courses setup.");
            return;
        }

        // Teacher's assigned courses
        Object[][] teacherCourseDefs = {
                {"SE-ASA-03", "Advanced Software Architecture",        10, 3, false},
                {"SE-BDS-03", "Big Data and Data Science Technologies", 5, 3, false},
                {"SE-AID-03", "Advanced Interaction Design",            5, 3, false},
                {"SE-MBS-03", "Model-Based Software Development",       5, 3, false},
                {"SE-ICP-03", "In-company Project",                    15, 3, false},
        };

        for (Object[] def : teacherCourseDefs) {
            String code       = (String)  def[0];
            String name       = (String)  def[1];
            Integer ects      = (Integer) def[2];
            Integer semester  = (Integer) def[3];
            Boolean mandatory = (Boolean) def[4];

            Course course = courseRepository.findByCode(code).orElse(null);
            if (course == null) {
                course = new Course(name, code, ects, semester, mandatory, education);
                System.out.println("Teacher course created: " + name);
            }

            // Assign teacher if not already assigned
            if (course.getTeacher() == null || !course.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
                course.setTeacher(teacher);
                courseRepository.save(course);
                System.out.println("Teacher assigned to course: " + name);
            } else {
                courseRepository.save(course);
            }

            // Ensure an ordinary exam exists
            final Course savedCourse = course;
            if (examRepository.findFirstByCourseAndReexamFalse(savedCourse).isEmpty()) {
                Exam exam = new Exam(
                        name + " Eksamen",
                        "WRITTEN",
                        LocalDate.of(2026, 8, 15),
                        null,
                        null,
                        "Campus Odense",
                        false,
                        savedCourse
                );
                examRepository.save(exam);
                System.out.println("Ordinary exam created for teacher course: " + name);
            }

            // Ensure a re-exam always exists for teacher courses (required for re-exam registration)
            if (examRepository.findFirstByCourseAndReexamTrue(savedCourse).isEmpty()) {
                Exam reexam = new Exam(
                        name + " Re-eksamen",
                        "WRITTEN",
                        LocalDate.of(2026, 11, 15),
                        null,
                        null,
                        "Campus Odense",
                        true,
                        savedCourse
                );
                examRepository.save(reexam);
                System.out.println("Re-exam created for teacher course: " + name);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Teacher test data — enrollments and exam registrations for teacher's courses
    // ─────────────────────────────────────────────────────────────────────────────
    private void ensureTeacherTestData() {
        AppUser teacherUser = appUserRepository.findByEmail("teacher@sdu.dk").orElse(null);
        if (teacherUser == null) return;

        Teacher teacher = teacherRepository.findByAppUserUserId(teacherUser.getUserId()).orElse(null);
        if (teacher == null) return;

        Student student = studentRepository.findById(1L).orElse(null);
        if (student == null) return;

        // SE-ASA-03: enroll student + create exam registration WITHOUT a grade result
        ensureEnrollmentAndRegistration(student, "SE-ASA-03", false, teacher, null, null);

        // SE-BDS-03: enroll student + create exam registration WITH a passed grade result
        ensureEnrollmentAndRegistration(student, "SE-BDS-03", true, teacher, "10", "B");

        // SE-AID-03: enroll student + create exam registration WITH a failed grade (00)
        ensureEnrollmentAndRegistration(student, "SE-AID-03", true, teacher, "00", "Fx");
    }

    private void ensureEnrollmentAndRegistration(
            Student student,
            String courseCode,
            boolean createGrade,
            Teacher teacher,
            String gradeValue,
            String ectsGrade
    ) {
        Course course = courseRepository.findByCode(courseCode).orElse(null);
        if (course == null) return;

        // Ensure course enrollment
        if (!courseEnrollmentRepository.existsByStudentStudentIdAndCourseCourseId(
                student.getStudentId(), course.getCourseId())) {
            courseEnrollmentRepository.save(
                    new CourseEnrollment(student, course, "ENROLLED", LocalDate.now())
            );
            System.out.println("Enrollment created: student " + student.getStudentId() + " → " + courseCode);
        }

        // Ensure exam registration
        Exam exam = examRepository.findFirstByCourseAndReexamFalse(course).orElse(null);
        if (exam == null) return;

        if (!examRegistrationRepository.existsByStudentStudentIdAndExamExamId(
                student.getStudentId(), exam.getExamId())) {
            ExamRegistration reg = new ExamRegistration(student, exam, "REGISTERED", LocalDate.now(), 1);
            examRegistrationRepository.save(reg);
            System.out.println("Exam registration created for " + courseCode);

            // Optionally create grade result
            if (createGrade && gradeValue != null) {
                boolean passed = !"00".equals(gradeValue) && !"-3".equals(gradeValue);
                createGradeResult(reg, teacher, gradeValue, ectsGrade != null ? ectsGrade : "", passed,
                        "Automatisk oprettet testresultat for " + course.getName() + ".");
            }
        } else if (createGrade && gradeValue != null) {
            // Registration already exists — ensure grade result exists
            examRegistrationRepository.findByStudentStudentIdAndExamExamId(
                    student.getStudentId(), exam.getExamId()
            ).ifPresent(reg -> {
                if (!gradeResultRepository.existsByExamRegistrationExamRegistrationId(reg.getExamRegistrationId())) {
                    boolean passed = !"00".equals(gradeValue) && !"-3".equals(gradeValue);
                    createGradeResult(reg, teacher, gradeValue, ectsGrade != null ? ectsGrade : "", passed,
                            "Automatisk oprettet testresultat for " + course.getName() + ".");
                }
            });
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

    // ─────────────────────────────────────────────────────────────────────────────
    // Student cards — one card per student
    // ─────────────────────────────────────────────────────────────────────────────
    private void ensureStudentCards() {
        for (Student student : studentRepository.findAll()) {
            if (studentCardRepository.findByStudentStudentId(student.getStudentId()).isPresent()) {
                continue;
            }

            String cardNumber = String.format("SDU-%04d-%06d", student.getStudentId(), student.getStudentId() * 12345L % 1000000);
            String qrCodeValue = "SDU-STUDENT-" + student.getStudentId() + "-" + student.getStudentNumber();
            LocalDate validUntil = LocalDate.of(2027, 7, 31);

            StudentCard card = new StudentCard(student, cardNumber, validUntil, "VALID", qrCodeValue);
            studentCardRepository.save(card);
            System.out.println("Student card created for student: " + student.getStudentNumber());
        }
    }
}
