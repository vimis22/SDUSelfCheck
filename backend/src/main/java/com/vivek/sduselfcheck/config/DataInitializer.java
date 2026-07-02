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
        updateTeacherData();
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

    private void ensureTestUsers() {
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
            if (user.getFirstName() == null || !"Vivek".equals(user.getFirstName())) {
                user.setFirstName("Vivek");
                updated = true;
            }
            if (user.getLastName() == null || !"Misra".equals(user.getLastName())) {
                user.setLastName("Misra");
                updated = true;
            }
            if (user.getStatus() == null) {
                user.setStatus("ACTIVE");
                updated = true;
            }
            if (updated) {
                appUserRepository.save(user);
                System.out.println("Student user updated → student@sdu.dk / password");
            }
        });

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
            if (user.getFirstName() == null || !"Thomas".equals(user.getFirstName())) {
                user.setFirstName("Thomas");
                updated = true;
            }
            if (user.getLastName() == null || !"Jensen".equals(user.getLastName())) {
                user.setLastName("Jensen");
                updated = true;
            }
            if (user.getStatus() == null) {
                user.setStatus("ACTIVE");
                updated = true;
            }
            if (updated) {
                appUserRepository.save(user);
                System.out.println("Teacher user updated → teacher@sdu.dk / password");
            }
        });

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

    private void updateStudentDocumentPreviewData() {
        Student student = studentRepository.findById(1L).orElse(null);

        if (student == null) {
            System.out.println("Student test data was not updated because student_id 1 was not found.");
            return;
        }

        boolean updated = false;

        if (!"ACTIVE".equals(student.getEnrollmentStatus())) {
            student.setEnrollmentStatus("ACTIVE");
            updated = true;
        }
        if (!Integer.valueOf(2).equals(student.getSemester())) {
            student.setSemester(2);
            updated = true;
        }
        if (student.getPhoneNumber() == null || !"12345678".equals(student.getPhoneNumber())) {
            student.setPhoneNumber("12345678");
            updated = true;
        }
        if (student.getStudentNumber() == null || !student.getStudentNumber().equals("SDU-1001")) {
            if (!studentRepository.existsByStudentNumber("SDU-1001")) {
                student.setStudentNumber("SDU-1001");
                updated = true;
            }
        }

        if (updated) {
            studentRepository.save(student);
            System.out.println("Student document preview test data updated.");
        }
    }

    private void updateTeacherData() {
        AppUser teacherUser = appUserRepository.findByEmail("teacher@sdu.dk").orElse(null);
        if (teacherUser == null) return;

        Teacher teacher = teacherRepository.findByAppUserUserId(teacherUser.getUserId()).orElse(null);
        if (teacher == null) return;

        boolean updated = false;

        if (!"TEA-1001".equals(teacher.getEmployeeNumber())) {
            if (!teacherRepository.existsByEmployeeNumber("TEA-1001")) {
                teacher.setEmployeeNumber("TEA-1001");
                updated = true;
            }
        }
        if (teacher.getDepartment() == null || !"Software Engineering".equals(teacher.getDepartment())) {
            teacher.setDepartment("Software Engineering");
            updated = true;
        }
        if (teacher.getTitle() == null || !"Lecturer".equals(teacher.getTitle())) {
            teacher.setTitle("Lecturer");
            updated = true;
        }
        if (teacher.getPhoneNumber() == null || !"87654321".equals(teacher.getPhoneNumber())) {
            teacher.setPhoneNumber("87654321");
            updated = true;
        }

        if (updated) {
            teacherRepository.save(teacher);
            System.out.println("Teacher data updated.");
        }
    }

    private void ensureAvailableCourses() {
        Education education = educationRepository.findById(1L).orElse(null);
        if (education == null) {
            System.out.println("Education id=1 not found. Skipping available courses setup.");
            return;
        }

        Object[][] courseDefs = {
                {"SE-EIS-03",  "Engineering of Innovative Software",  10,  3, false},
                {"SE-SM-03",   "Software Maintenance",                 5,  3, false},
                {"SE-CC-04",   "Cloud Computing Continuum",            5,  3, false},
                {"SE-CYB-04",  "Cybersecurity",                        5,  3, false},
                {"SE-DV-04",   "Data Visualization",                   5,  3, false},
                {"SE-HRI-04",  "Human-Robot Interaction",              5,  3, false},
                {"SE-EL-04",   "Embedded Linux",                       5,  3, false},
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

            if (course.getTeacher() == null || !course.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
                course.setTeacher(teacher);
                courseRepository.save(course);
                System.out.println("Teacher assigned to course: " + name);
            } else {
                courseRepository.save(course);
            }

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

    private void ensureTeacherTestData() {
        AppUser teacherUser = appUserRepository.findByEmail("teacher@sdu.dk").orElse(null);
        if (teacherUser == null) return;

        Teacher teacher = teacherRepository.findByAppUserUserId(teacherUser.getUserId()).orElse(null);
        if (teacher == null) return;

        Student student = studentRepository.findById(1L).orElse(null);
        if (student == null) return;

        ensureEnrollmentAndRegistration(student, "SE-ASA-03", false, teacher, null, null);
        ensureEnrollmentAndRegistration(student, "SE-BDS-03", true, teacher, "10", "B");
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

        if (!courseEnrollmentRepository.existsByStudentStudentIdAndCourseCourseId(
                student.getStudentId(), course.getCourseId())) {
            courseEnrollmentRepository.save(
                    new CourseEnrollment(student, course, "ENROLLED", LocalDate.now())
            );
            System.out.println("Enrollment created: student " + student.getStudentId() + " → " + courseCode);
        }

        Exam exam = examRepository.findFirstByCourseAndReexamFalse(course).orElse(null);
        if (exam == null) return;

        if (!examRegistrationRepository.existsByStudentStudentIdAndExamExamId(
                student.getStudentId(), exam.getExamId())) {
            ExamRegistration reg = new ExamRegistration(student, exam, "REGISTERED", LocalDate.now(), 1);
            examRegistrationRepository.save(reg);
            System.out.println("Exam registration created for " + courseCode);

            if (createGrade && gradeValue != null) {
                boolean passed = !"00".equals(gradeValue) && !"-3".equals(gradeValue);
                createGradeResult(reg, teacher, gradeValue, ectsGrade != null ? ectsGrade : "", passed,
                        "Automatisk oprettet testresultat for " + course.getName() + ".");
            }
        } else if (createGrade && gradeValue != null) {
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
