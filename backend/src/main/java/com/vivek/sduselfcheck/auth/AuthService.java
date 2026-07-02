package com.vivek.sduselfcheck.auth;

import com.vivek.sduselfcheck.student.StudentRepository;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import com.vivek.sduselfcheck.user.AppUser;
import com.vivek.sduselfcheck.user.AppUserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public AuthService(
            AppUserRepository appUserRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Ugyldigt brugernavn eller adgangskode."));

        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Ugyldigt brugernavn eller adgangskode.");
        }

        Long studentId = null;
        Long teacherId = null;

        if ("STUDENT".equals(user.getRole())) {
            studentId = studentRepository.findByUserUserId(user.getUserId())
                    .map(s -> s.getStudentId())
                    .orElse(null);
        }

        if ("TEACHER".equals(user.getRole())) {
            teacherId = teacherRepository.findByAppUserUserId(user.getUserId())
                    .map(t -> t.getTeacherId())
                    .orElse(null);
        }

        return new LoginResponse(user.getUserId(), user.getEmail(), user.getRole(), studentId, teacherId);
    }
}
