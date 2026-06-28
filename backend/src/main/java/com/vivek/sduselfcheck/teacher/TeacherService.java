package com.vivek.sduselfcheck.teacher;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

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
}