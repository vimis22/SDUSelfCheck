package com.vivek.sduselfcheck.examregistration;

import com.vivek.sduselfcheck.exam.Exam;
import com.vivek.sduselfcheck.student.Student;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "exam_registration",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "exam_id"})
        }
)
public class ExamRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_registration_id")
    private Long examRegistrationId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private String status;

    @Column(name = "registered_at", nullable = false)
    private LocalDate registeredAt;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    public ExamRegistration() {
    }

    public ExamRegistration(Student student, Exam exam, String status, LocalDate registeredAt, Integer attemptNumber) {
        this.student = student;
        this.exam = exam;
        this.status = status;
        this.registeredAt = registeredAt;
        this.attemptNumber = attemptNumber;
    }

    public Long getExamRegistrationId() {
        return examRegistrationId;
    }

    public void setExamRegistrationId(Long examRegistrationId) {
        this.examRegistrationId = examRegistrationId;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDate registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }
}