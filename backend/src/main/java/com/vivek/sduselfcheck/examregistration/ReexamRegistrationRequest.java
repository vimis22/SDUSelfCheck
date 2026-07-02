package com.vivek.sduselfcheck.examregistration;

public class ReexamRegistrationRequest {

    private Long studentId;
    private Long examId;

    public ReexamRegistrationRequest() {
    }

    public ReexamRegistrationRequest(Long studentId, Long examId) {
        this.studentId = studentId;
        this.examId = examId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }
}
