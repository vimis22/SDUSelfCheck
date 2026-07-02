package com.vivek.sduselfcheck.exam;

import com.vivek.sduselfcheck.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourse(Course course);

    List<Exam> findByCourseIn(List<Course> courses);

    Optional<Exam> findFirstByCourseAndReexamFalse(Course course);

    Optional<Exam> findFirstByCourseAndReexamTrue(Course course);
}