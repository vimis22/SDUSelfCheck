package com.vivek.sduselfcheck.studentcard;

import com.vivek.sduselfcheck.student.Student;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_card")
public class StudentCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "card_number", nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(nullable = false)
    private String status; // VALID, EXPIRED, BLOCKED

    @Column(name = "qr_code_value")
    private String qrCodeValue;

    public StudentCard() {
    }

    public StudentCard(Student student, String cardNumber, LocalDate validUntil, String status, String qrCodeValue) {
        this.student = student;
        this.cardNumber = cardNumber;
        this.validUntil = validUntil;
        this.status = status;
        this.qrCodeValue = qrCodeValue;
    }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getQrCodeValue() { return qrCodeValue; }
    public void setQrCodeValue(String qrCodeValue) { this.qrCodeValue = qrCodeValue; }
}
