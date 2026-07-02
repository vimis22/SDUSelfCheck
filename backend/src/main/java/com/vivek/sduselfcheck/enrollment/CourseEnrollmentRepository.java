package com.vivek.sduselfcheck.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    boolean existsByStudentStudentIdAndCourseCourseId(Long studentId, Long courseId);

    Optional<CourseEnrollment> findByStudentStudentIdAndCourseCourseId(Long studentId, Long courseId);

    List<CourseEnrollment> findByStudentStudentId(Long studentId);

    List<CourseEnrollment> findByCourseCourseId(Long courseId);
}