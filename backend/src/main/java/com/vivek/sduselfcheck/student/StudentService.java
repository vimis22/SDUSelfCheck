package com.vivek.sduselfcheck.student;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "studentId"))
                .stream()
                .map(student -> new StudentResponse(
                        student.getStudentId(),
                        student.getStudentNumber(),
                        student.getUser().getFirstName(),
                        student.getUser().getMiddleName(),
                        student.getUser().getLastName(),
                        student.getUser().getEmail(),
                        student.getUser().getRole(),
                        student.getUser().getStatus(),
                        student.getEnrollmentStatus(),
                        student.getGender(),
                        student.getSemester(),
                        student.getEducation().getCode(),
                        student.getEducation().getName()
                ))
                .toList();
    }
}