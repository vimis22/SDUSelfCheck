package com.vivek.sduselfcheck.studentcard;

import org.springframework.stereotype.Service;

@Service
public class StudentCardService {

    private final StudentCardRepository studentCardRepository;

    public StudentCardService(StudentCardRepository studentCardRepository) {
        this.studentCardRepository = studentCardRepository;
    }

    public StudentCardResponse getByStudentId(Long studentId) {
        StudentCard card = studentCardRepository.findByStudentStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student card not found for student id: " + studentId));
        return mapToResponse(card);
    }

    private StudentCardResponse mapToResponse(StudentCard card) {
        var student = card.getStudent();
        var user = student.getUser();
        String educationName = student.getEducation() != null ? student.getEducation().getName() : null;

        return new StudentCardResponse(
                card.getCardId(),
                student.getStudentId(),
                student.getStudentNumber(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                educationName,
                card.getCardNumber(),
                card.getValidUntil(),
                card.getStatus(),
                card.getQrCodeValue()
        );
    }
}
