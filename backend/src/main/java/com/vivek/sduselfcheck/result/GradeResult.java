package com.vivek.sduselfcheck.result;

import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.teacher.Teacher;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "grade_result")
public class GradeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_result_id")
    private Long gradeResultId;

    @OneToOne
    @JoinColumn(name = "exam_registration_id", nullable = false, unique = true)
    private ExamRegistration examRegistration;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "grade_value", nullable = false)
    private String gradeValue;

    @Column(name = "ects_grade")
    private String ectsGrade;

    @Column(name = "passed", nullable = false)
    private boolean passed;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    public GradeResult() {
    }

    public GradeResult(
            ExamRegistration examRegistration,
            Teacher teacher,
            String gradeValue,
            String ectsGrade,
            boolean passed,
            String feedback,
            LocalDateTime gradedAt
    ) {
        this.examRegistration = examRegistration;
        this.teacher = teacher;
        this.gradeValue = gradeValue;
        this.ectsGrade = ectsGrade;
        this.passed = passed;
        this.feedback = feedback;
        this.gradedAt = gradedAt;
    }

    public Long getGradeResultId() {
        return gradeResultId;
    }

    public void setGradeResultId(Long gradeResultId) {
        this.gradeResultId = gradeResultId;
    }

    public ExamRegistration getExamRegistration() {
        return examRegistration;
    }

    public void setExamRegistration(ExamRegistration examRegistration) {
        this.examRegistration = examRegistration;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public String getGradeValue() {
        return gradeValue;
    }

    public void setGradeValue(String gradeValue) {
        this.gradeValue = gradeValue;
    }

    public String getEctsGrade() {
        return ectsGrade;
    }

    public void setEctsGrade(String ectsGrade) {
        this.ectsGrade = ectsGrade;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}