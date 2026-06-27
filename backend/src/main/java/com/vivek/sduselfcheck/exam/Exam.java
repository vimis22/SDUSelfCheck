package com.vivek.sduselfcheck.exam;

import com.vivek.sduselfcheck.course.Course;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exam")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long examId;

    @Column(nullable = false)
    private String title;

    @Column(name = "exam_type", nullable = false)
    private String examType;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    private String location;

    @Column(name = "is_reexam", nullable = false)
    private Boolean reexam;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Exam() {
    }

    public Exam(String title, String examType, LocalDate examDate, LocalTime startTime, LocalTime endTime, String location, Boolean reexam, Course course) {
        this.title = title;
        this.examType = examType;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.reexam = reexam;
        this.course = course;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getReexam() {
        return reexam;
    }

    public void setReexam(Boolean reexam) {
        this.reexam = reexam;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }
}