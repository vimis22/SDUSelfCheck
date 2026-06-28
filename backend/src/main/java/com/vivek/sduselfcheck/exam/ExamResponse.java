package com.vivek.sduselfcheck.exam;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExamResponse(
        Long examId,
        String title,
        String examType,
        LocalDate examDate,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        Boolean reexam,
        Long courseId,
        String courseCode,
        String courseName
) {
}