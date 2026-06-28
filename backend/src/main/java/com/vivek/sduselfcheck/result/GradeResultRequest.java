package com.vivek.sduselfcheck.result;

public class GradeResultRequest {

    private Long examRegistrationId;
    private Long teacherId;
    private String gradeValue;
    private String ectsGrade;
    private boolean passed;
    private String feedback;

    public Long getExamRegistrationId() {
        return examRegistrationId;
    }

    public void setExamRegistrationId(Long examRegistrationId) {
        this.examRegistrationId = examRegistrationId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
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
}
