package com.vivek.sduselfcheck.config;

import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.examregistration.ExamRegistrationRepository;
import com.vivek.sduselfcheck.result.GradeResult;
import com.vivek.sduselfcheck.result.GradeResultRepository;
import com.vivek.sduselfcheck.teacher.Teacher;
import com.vivek.sduselfcheck.teacher.TeacherRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExamRegistrationRepository examRegistrationRepository;
    private final TeacherRepository teacherRepository;
    private final GradeResultRepository gradeResultRepository;

    public DataInitializer(
            ExamRegistrationRepository examRegistrationRepository,
            TeacherRepository teacherRepository,
            GradeResultRepository gradeResultRepository
    ) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.teacherRepository = teacherRepository;
        this.gradeResultRepository = gradeResultRepository;
    }

    @Override
    public void run(String... args) {
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