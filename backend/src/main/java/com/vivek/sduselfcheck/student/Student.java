package com.vivek.sduselfcheck.student;

import com.vivek.sduselfcheck.education.Education;
import com.vivek.sduselfcheck.user.AppUser;
import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "student_number", nullable = false, unique = true)
    private String studentNumber;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @ManyToOne
    @JoinColumn(name = "education_id", nullable = false)
    private Education education;

    public Student() {
    }

    public Student(String studentNumber, AppUser user, Education education) {
        this.studentNumber = studentNumber;
        this.user = user;
        this.education = education;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public void setStudentNumber(String studentNumber) {
        this.studentNumber = studentNumber;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public Education getEducation() {
        return education;
    }

    public void setEducation(Education education) {
        this.education = education;
    }
}