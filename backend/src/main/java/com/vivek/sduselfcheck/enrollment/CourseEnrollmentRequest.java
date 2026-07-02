package com.vivek.sduselfcheck.enrollment;

public class CourseEnrollmentRequest {

    private Long studentId;
    private Long courseId;

    public CourseEnrollmentRequest() {
    }

    public CourseEnrollmentRequest(Long studentId, Long courseId) {
        this.studentId = studentId;
        this.courseId = courseId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}
