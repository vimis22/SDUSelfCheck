package com.vivek.sduselfcheck.admin;

import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.education.Education;
import com.vivek.sduselfcheck.education.EducationRepository;
import com.vivek.sduselfcheck.enrollment.CourseEnrollment;
import com.vivek.sduselfcheck.enrollment.CourseEnrollmentRepository;
import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.student.StudentRepository;
import com.vivek.sduselfcheck.studentcard.StudentCard;
import com.vivek.sduselfcheck.studentcard.StudentCardRepository;
import com.vivek.sduselfcheck.teacher.Teacher;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import com.vivek.sduselfcheck.user.AppUser;
import com.vivek.sduselfcheck.user.AppUserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    private final EducationRepository educationRepository;
    private final StudentCardRepository studentCardRepository;

    public AdminService(
            AppUserRepository appUserRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            ExamRegistrationRepository examRegistrationRepository,
            GradeResultRepository gradeResultRepository,
            EducationRepository educationRepository,
            StudentCardRepository studentCardRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.gradeResultRepository = gradeResultRepository;
        this.educationRepository = educationRepository;
        this.studentCardRepository = studentCardRepository;
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

    private AdminStudentResponse mapStudentToResponse(Student s) {
        return new AdminStudentResponse(
                s.getStudentId(),
                s.getStudentNumber(),
                s.getUser().getFirstName(),
                s.getUser().getLastName(),
                s.getUser().getEmail(),
                s.getEducation() != null ? s.getEducation().getName() : null,
                s.getSemester(),
                s.getEnrollmentStatus(),
                s.getPhoneNumber(),
                s.getEducation() != null ? s.getEducation().getEducationId() : null
        );
    }

    public List<AdminStudentResponse> getAllStudents() {
        return studentRepository.findAll(Sort.by("studentId")).stream()
                .map(this::mapStudentToResponse)
                .toList();
    }

    public AdminStudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student ikke fundet: " + id));
        return mapStudentToResponse(student);
    }

    public AdminStudentResponse updateStudent(Long id, UpdateStudentRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student ikke fundet: " + id));
        AppUser user = student.getUser();

        if (req.firstName() == null || req.firstName().isBlank()) throw new RuntimeException("Fornavn er påkrævet.");
        if (req.lastName() == null || req.lastName().isBlank()) throw new RuntimeException("Efternavn er påkrævet.");
        if (req.email() == null || req.email().isBlank()) throw new RuntimeException("Email er påkrævet.");
        if (req.studentNumber() == null || req.studentNumber().isBlank()) throw new RuntimeException("Studienummer er påkrævet.");

        if (!req.email().equals(user.getEmail())) {
            Optional<AppUser> conflict = appUserRepository.findByEmail(req.email());
            if (conflict.isPresent()) {
                throw new RuntimeException("Email er allerede i brug: " + req.email());
            }
        }

        if (!req.studentNumber().equals(student.getStudentNumber())) {
            if (studentRepository.existsByStudentNumber(req.studentNumber())) {
                throw new RuntimeException("Studienummer er allerede i brug: " + req.studentNumber());
            }
        }

        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());

        String newStatus = req.enrollmentStatus();
        if (newStatus != null && !newStatus.isBlank()) {
            student.setEnrollmentStatus(newStatus);
            if ("DISABLED".equals(newStatus)) {
                user.setStatus("DISABLED");
            } else if ("ACTIVE".equals(newStatus)) {
                user.setStatus("ACTIVE");
            }
        }
        appUserRepository.save(user);

        student.setStudentNumber(req.studentNumber());
        student.setPhoneNumber(req.phoneNumber());
        student.setSemester(req.semester());

        if (req.educationId() != null) {
            Education education = educationRepository.findById(req.educationId())
                    .orElseThrow(() -> new RuntimeException("Uddannelse ikke fundet: " + req.educationId()));
            student.setEducation(education);
        }

        return mapStudentToResponse(studentRepository.save(student));
    }

    public void disableStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student ikke fundet: " + studentId));
        student.setEnrollmentStatus("DISABLED");
        studentRepository.save(student);
        AppUser user = student.getUser();
        user.setStatus("DISABLED");
        appUserRepository.save(user);
    }

    public void enableStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student ikke fundet: " + studentId));
        student.setEnrollmentStatus("ACTIVE");
        studentRepository.save(student);
        AppUser user = student.getUser();
        user.setStatus("ACTIVE");
        appUserRepository.save(user);
    }

    // ── Teachers (Admin) ──────────────────────────────────────────────────────

    private AdminTeacherResponse mapTeacherToAdminResponse(Teacher t) {
        return new AdminTeacherResponse(
                t.getTeacherId(),
                t.getEmployeeNumber(),
                t.getAppUser().getFirstName(),
                t.getAppUser().getLastName(),
                t.getAppUser().getEmail(),
                t.getPhoneNumber(),
                t.getDepartment(),
                t.getTitle(),
                t.getAppUser().getStatus()
        );
    }

    public List<AdminTeacherResponse> getAllTeachersAdmin() {
        return teacherRepository.findAll(Sort.by("teacherId")).stream()
                .map(this::mapTeacherToAdminResponse)
                .toList();
    }

    public AdminTeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Underviser ikke fundet: " + id));
        return mapTeacherToAdminResponse(teacher);
    }

    public AdminTeacherResponse updateTeacher(Long id, UpdateTeacherRequest req) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Underviser ikke fundet: " + id));
        AppUser user = teacher.getAppUser();

        if (req.firstName() == null || req.firstName().isBlank()) throw new RuntimeException("Fornavn er påkrævet.");
        if (req.lastName() == null || req.lastName().isBlank()) throw new RuntimeException("Efternavn er påkrævet.");
        if (req.email() == null || req.email().isBlank()) throw new RuntimeException("Email er påkrævet.");
        if (req.employeeNumber() == null || req.employeeNumber().isBlank()) throw new RuntimeException("Medarbejdernummer er påkrævet.");

        if (!req.email().equals(user.getEmail())) {
            Optional<AppUser> conflict = appUserRepository.findByEmail(req.email());
            if (conflict.isPresent()) {
                throw new RuntimeException("Email er allerede i brug: " + req.email());
            }
        }

        if (!req.employeeNumber().equals(teacher.getEmployeeNumber())) {
            if (teacherRepository.existsByEmployeeNumber(req.employeeNumber())) {
                throw new RuntimeException("Medarbejdernummer er allerede i brug: " + req.employeeNumber());
            }
        }

        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());
        if (req.status() != null && !req.status().isBlank()) {
            user.setStatus(req.status());
        }
        appUserRepository.save(user);

        teacher.setEmployeeNumber(req.employeeNumber());
        teacher.setPhoneNumber(req.phoneNumber());
        teacher.setDepartment(req.department());
        teacher.setTitle(req.title());
        return mapTeacherToAdminResponse(teacherRepository.save(teacher));
    }

    public void disableTeacher(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Underviser ikke fundet: " + teacherId));
        teacher.getAppUser().setStatus("DISABLED");
        appUserRepository.save(teacher.getAppUser());
    }

    public void enableTeacher(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Underviser ikke fundet: " + teacherId));
        teacher.getAppUser().setStatus("ACTIVE");
        appUserRepository.save(teacher.getAppUser());
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

    // ── Create Student ─────────────────────────────────────────────────────────

    public AdminStudentResponse createStudent(CreateStudentRequest req) {
        if (req.firstName() == null || req.firstName().isBlank()) throw new RuntimeException("Fornavn er påkrævet.");
        if (req.lastName() == null || req.lastName().isBlank()) throw new RuntimeException("Efternavn er påkrævet.");
        if (req.email() == null || req.email().isBlank()) throw new RuntimeException("Email er påkrævet.");
        if (req.password() == null || req.password().isBlank()) throw new RuntimeException("Adgangskode er påkrævet.");
        if (req.studentNumber() == null || req.studentNumber().isBlank()) throw new RuntimeException("Studienummer er påkrævet.");
        if (req.educationId() == null) throw new RuntimeException("Uddannelse er påkrævet.");

        if (appUserRepository.findByEmail(req.email()).isPresent()) {
            throw new RuntimeException("Email er allerede i brug: " + req.email());
        }
        if (studentRepository.existsByStudentNumber(req.studentNumber())) {
            throw new RuntimeException("Studienummer er allerede i brug: " + req.studentNumber());
        }

        Education education = educationRepository.findById(req.educationId())
                .orElseThrow(() -> new RuntimeException("Uddannelse ikke fundet: " + req.educationId()));

        AppUser user = new AppUser();
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());
        user.setPasswordHash(req.password());
        user.setRole("STUDENT");
        user.setStatus("ACTIVE");
        AppUser savedUser = appUserRepository.save(user);

        Student student = new Student(req.studentNumber(), savedUser, education);
        student.setSemester(req.semester());
        student.setEnrollmentStatus("ACTIVE");
        Student savedStudent = studentRepository.save(student);

        String cardNumber = String.format("SDU-%04d-%06d",
                savedStudent.getStudentId(),
                savedStudent.getStudentId() * 7919L % 1000000L);
        String qrCodeValue = "SDU-STUDENT-" + savedStudent.getStudentId() + "-" + System.currentTimeMillis();
        studentCardRepository.save(new StudentCard(savedStudent, cardNumber, LocalDate.now().plusYears(2), "VALID", qrCodeValue));

        return mapStudentToResponse(savedStudent);
    }

    // ── Create Teacher ─────────────────────────────────────────────────────────

    public AdminTeacherResponse createTeacher(CreateTeacherRequest req) {
        if (req.firstName() == null || req.firstName().isBlank()) throw new RuntimeException("Fornavn er påkrævet.");
        if (req.lastName() == null || req.lastName().isBlank()) throw new RuntimeException("Efternavn er påkrævet.");
        if (req.email() == null || req.email().isBlank()) throw new RuntimeException("Email er påkrævet.");
        if (req.password() == null || req.password().isBlank()) throw new RuntimeException("Adgangskode er påkrævet.");
        if (req.employeeNumber() == null || req.employeeNumber().isBlank()) throw new RuntimeException("Medarbejdernummer er påkrævet.");

        if (appUserRepository.findByEmail(req.email()).isPresent()) {
            throw new RuntimeException("Email er allerede i brug: " + req.email());
        }
        if (teacherRepository.existsByEmployeeNumber(req.employeeNumber())) {
            throw new RuntimeException("Medarbejdernummer er allerede i brug: " + req.employeeNumber());
        }

        AppUser user = new AppUser();
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());
        user.setPasswordHash(req.password());
        user.setRole("TEACHER");
        user.setStatus("ACTIVE");
        AppUser savedUser = appUserRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setAppUser(savedUser);
        teacher.setEmployeeNumber(req.employeeNumber());
        teacher.setDepartment(req.department());
        Teacher savedTeacher = teacherRepository.save(teacher);

        return mapTeacherToAdminResponse(savedTeacher);
    }
}
