package com.vivek.sduselfcheck.teacher;

import java.time.LocalDate;

public record TeacherExamResponse(
        Long examId,
        String title,
        String examType,
        LocalDate examDate,
        String startTime,
        String endTime,
        String location,
        Boolean reexam,
        Long courseId,
        String courseCode,
        String courseName,
        int registrationCount
) {}
