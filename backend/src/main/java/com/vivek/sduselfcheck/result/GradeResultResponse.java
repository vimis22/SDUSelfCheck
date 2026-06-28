package com.vivek.sduselfcheck.result;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class GradeResultResponse {

    private Long gradeResultId;

    private Long examRegistrationId;

    private Long studentId;
    private String studentNumber;
    private String studentFirstName;
    private String studentLastName;

    private Long examId;
    private String examTitle;
    private String examType;
    private LocalDate examDate;

    private Long courseId;
    private String courseCode;
    private String courseName;

    private Long teacherId;
    private String teacherEmployeeNumber;
    private String teacherFirstName;
    private String teacherLastName;

    private String gradeValue;
    private String ectsGrade;
    private boolean passed;
    private String feedback;
    private LocalDateTime gradedAt;

    public GradeResultResponse(
            Long gradeResultId,
            Long examRegistrationId,
            Long studentId,
            String studentNumber,
            String studentFirstName,
            String studentLastName,
            Long examId,
            String examTitle,
            String examType,
            LocalDate examDate,
            Long courseId,
            String courseCode,
            String courseName,
            Long teacherId,
            String teacherEmployeeNumber,
            String teacherFirstName,
            String teacherLastName,
            String gradeValue,
            String ectsGrade,
            boolean passed,
            String feedback,
            LocalDateTime gradedAt
    ) {
        this.gradeResultId = gradeResultId;
        this.examRegistrationId = examRegistrationId;
        this.studentId = studentId;
        this.studentNumber = studentNumber;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.examId = examId;
        this.examTitle = examTitle;
        this.examType = examType;
        this.examDate = examDate;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.teacherId = teacherId;
        this.teacherEmployeeNumber = teacherEmployeeNumber;
        this.teacherFirstName = teacherFirstName;
        this.teacherLastName = teacherLastName;
        this.gradeValue = gradeValue;
        this.ectsGrade = ectsGrade;
        this.passed = passed;
        this.feedback = feedback;
        this.gradedAt = gradedAt;
    }

    public Long getGradeResultId() {
        return gradeResultId;
    }

    public Long getExamRegistrationId() {
        return examRegistrationId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public String getStudentFirstName() {
        return studentFirstName;
    }

    public String getStudentLastName() {
        return studentLastName;
    }

    public Long getExamId() {
        return examId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public String getExamType() {
        return examType;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public String getTeacherEmployeeNumber() {
        return teacherEmployeeNumber;
    }

    public String getTeacherFirstName() {
        return teacherFirstName;
    }

    public String getTeacherLastName() {
        return teacherLastName;
    }

    public String getGradeValue() {
        return gradeValue;
    }

    public String getEctsGrade() {
        return ectsGrade;
    }

    public boolean isPassed() {
        return passed;
    }

    public String getFeedback() {
        return feedback;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }
}