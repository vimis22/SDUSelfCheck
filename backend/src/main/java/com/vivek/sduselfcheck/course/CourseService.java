package com.vivek.sduselfcheck.course;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll(Sort.by(Sort.Direction.ASC, "courseId"))
                .stream()
                .map(course -> new CourseResponse(
                        course.getCourseId(),
                        course.getCode(),
                        course.getName(),
                        course.getEcts(),
                        course.getSemesterNumber(),
                        course.getMandatory(),
                        course.getEducation().getName()
                ))
                .toList();
    }
}