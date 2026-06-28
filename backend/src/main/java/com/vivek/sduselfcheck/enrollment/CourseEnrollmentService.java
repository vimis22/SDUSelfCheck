package com.vivek.sduselfcheck.enrollment;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;

    public CourseEnrollmentService(CourseEnrollmentRepository courseEnrollmentRepository) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    public List<CourseEnrollmentResponse> getAllEnrollments() {
        return courseEnrollmentRepository.findAll(Sort.by(Sort.Direction.ASC, "enrollmentId"))
                .stream()
                .map(enrollment -> new CourseEnrollmentResponse(
                        enrollment.getEnrollmentId(),
                        enrollment.getStudent().getStudentId(),
                        enrollment.getStudent().getStudentNumber(),
                        enrollment.getStudent().getUser().getFirstName(),
                        enrollment.getStudent().getUser().getLastName(),
                        enrollment.getCourse().getCourseId(),
                        enrollment.getCourse().getCode(),
                        enrollment.getCourse().getName(),
                        enrollment.getCourse().getEcts(),
                        enrollment.getCourse().getSemesterNumber(),
                        enrollment.getStatus(),
                        enrollment.getEnrolledAt()
                ))
                .toList();
    }
}