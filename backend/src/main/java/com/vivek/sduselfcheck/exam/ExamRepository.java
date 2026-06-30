package com.vivek.sduselfcheck.exam;

import com.vivek.sduselfcheck.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourse(Course course);
}