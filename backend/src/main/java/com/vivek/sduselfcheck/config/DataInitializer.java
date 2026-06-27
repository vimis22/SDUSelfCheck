package com.vivek.sduselfcheck.config;

import com.vivek.sduselfcheck.course.Course;
import com.vivek.sduselfcheck.course.CourseRepository;
import com.vivek.sduselfcheck.education.Education;
import com.vivek.sduselfcheck.education.EducationRepository;
import com.vivek.sduselfcheck.faculty.Faculty;
import com.vivek.sduselfcheck.faculty.FacultyRepository;
import com.vivek.sduselfcheck.school.School;
import com.vivek.sduselfcheck.school.SchoolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            FacultyRepository facultyRepository,
            SchoolRepository schoolRepository,
            EducationRepository educationRepository,
            CourseRepository courseRepository
    ) {
        return args -> {

            if (facultyRepository.count() > 0) {
                System.out.println("Test data already exists. Skipping DataInitializer.");
                return;
            }

            Faculty technicalFaculty = new Faculty(
                    "Technical Faculty",
                    "TEK"
            );
            facultyRepository.save(technicalFaculty);

            School softwareSchool = new School(
                    "Institute for Software Engineering",
                    "ISE",
                    technicalFaculty
            );
            schoolRepository.save(softwareSchool);

            Education softwareEngineering = new Education(
                    "Software Engineering MSc",
                    "SE-MSC",
                    "Master",
                    120,
                    softwareSchool
            );
            educationRepository.save(softwareEngineering);

            Course advancedSoftwareArchitecture = new Course(
                    "Advanced Software Architecture",
                    "SE-ASA-01",
                    10,
                    1,
                    true,
                    softwareEngineering
            );

            Course bigDataAndScienceTechnologies = new Course(
                    "Big Data and Science Technologies",
                    "SE-BDST-01",
                    10,
                    1,
                    true,
                    softwareEngineering
            );

            Course advancedInteractionDesign = new Course(
                    "Advanced Interaction Design",
                    "SE-AID-02",
                    10,
                    2,
                    true,
                    softwareEngineering
            );

            Course modelBasedSoftwareDevelopment = new Course(
                    "Model-Based Software Development",
                    "SE-MBSD-02",
                    10,
                    2,
                    true,
                    softwareEngineering
            );

            courseRepository.save(advancedSoftwareArchitecture);
            courseRepository.save(bigDataAndScienceTechnologies);
            courseRepository.save(advancedInteractionDesign);
            courseRepository.save(modelBasedSoftwareDevelopment);

            System.out.println("Test data inserted successfully.");
        };
    }
}