package com.vivek.sduselfcheck.result;

import com.vivek.sduselfcheck.examregistration.ExamRegistration;
import com.vivek.sduselfcheck.teacher.Teacher;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "grade_result")
public class GradeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @OneToOne
    @JoinColumn(name = "exam_registration_id", nullable = false, unique = true)
    private ExamRegistration examRegistration;

    @Column(name = "grade_value", nullable = false)
    private String gradeValue;

    @Column(name = "grading_scale", nullable = false)
    private String gradingScale;

    @Column(nullable = false)
    private Boolean passed;

    @Column(name = "published_at", nullable = false)
    private LocalDate publishedAt;

    private String feedback;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher gradedBy;

    public GradeResult() {
    }

    public GradeResult(ExamRegistration examRegistration, String gradeValue, String gradingScale, Boolean passed, LocalDate publishedAt, String feedback, Teacher gradedBy) {
        this.examRegistration = examRegistration;
        this.gradeValue = gradeValue;
        this.gradingScale = gradingScale;
        this.passed = passed;
        this.publishedAt = publishedAt;
        this.feedback = feedback;
        this.gradedBy = gradedBy;
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public ExamRegistration getExamRegistration() {
        return examRegistration;
    }

    public void setExamRegistration(ExamRegistration examRegistration) {
        this.examRegistration = examRegistration;
    }

    public String getGradeValue() {
        return gradeValue;
    }

    public void setGradeValue(String gradeValue) {
        this.gradeValue = gradeValue;
    }

    public String getGradingScale() {
        return gradingScale;
    }

    public void setGradingScale(String gradingScale) {
        this.gradingScale = gradingScale;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public LocalDate getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDate publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Teacher getGradedBy() {
        return gradedBy;
    }

    public void setGradedBy(Teacher gradedBy) {
        this.gradedBy = gradedBy;
    }
}