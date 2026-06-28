package com.vivek.sduselfcheck.document;

import com.vivek.sduselfcheck.student.Student;
import com.vivek.sduselfcheck.student.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRequestRepository documentRequestRepository;
    private final StudentRepository studentRepository;

    public DocumentService(
            DocumentRequestRepository documentRequestRepository,
            StudentRepository studentRepository
    ) {
        this.documentRequestRepository = documentRequestRepository;
        this.studentRepository = studentRepository;
    }

    public List<DocumentType> getDocumentTypes() {
        return Arrays.asList(DocumentType.values());
    }

    public DocumentRequestResponse createDocumentRequest(CreateDocumentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));

        if (request.getDocumentType() == null) {
            throw new RuntimeException("Document type is required.");
        }

        String language = request.getLanguage();

        if (language == null || language.isBlank()) {
            language = "DA";
        }

        DocumentRequest documentRequest = new DocumentRequest();
        documentRequest.setStudent(student);
        documentRequest.setDocumentType(request.getDocumentType());
        documentRequest.setLanguage(language.toUpperCase());
        documentRequest.setStatus(DocumentStatus.READY);
        documentRequest.setCreatedAt(LocalDateTime.now());
        documentRequest.setExpiresAt(LocalDateTime.now().plusDays(30));
        documentRequest.setFileName(generateFileName(student, request.getDocumentType(), language));

        DocumentRequest savedDocumentRequest = documentRequestRepository.save(documentRequest);

        return mapToResponse(savedDocumentRequest);
    }

    public List<DocumentRequestResponse> getDocumentsByStudentId(Long studentId) {
        return documentRequestRepository.findByStudentStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DocumentRequestResponse getDocumentById(Long documentRequestId) {
        DocumentRequest documentRequest = documentRequestRepository.findById(documentRequestId)
                .orElseThrow(() -> new RuntimeException("Document request not found with id: " + documentRequestId));

        return mapToResponse(documentRequest);
    }

    public DocumentPreviewResponse getDocumentPreview(Long documentRequestId) {
        DocumentRequest documentRequest = documentRequestRepository.findById(documentRequestId)
                .orElseThrow(() -> new RuntimeException("Document request not found with id: " + documentRequestId));

        Student student = documentRequest.getStudent();

        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();

        return new DocumentPreviewResponse(
                documentRequest.getDocumentRequestId(),
                documentRequest.getDocumentType(),
                getDocumentTypeLabel(documentRequest.getDocumentType(), documentRequest.getLanguage()),
                documentRequest.getLanguage(),
                documentRequest.getStatus(),
                documentRequest.getFileName(),

                student.getStudentId(),
                student.getStudentNumber(),
                studentName,

                student.getEducation().getEducationId(),
                student.getEducation().getCode(),
                student.getEducation().getName(),

                LocalDateTime.now(),
                documentRequest.getExpiresAt(),

                buildContentLines(documentRequest)
        );
    }

    private DocumentRequestResponse mapToResponse(DocumentRequest documentRequest) {
        Student student = documentRequest.getStudent();

        return new DocumentRequestResponse(
                documentRequest.getDocumentRequestId(),
                student.getStudentId(),
                student.getStudentNumber(),
                student.getUser().getFirstName(),
                student.getUser().getLastName(),
                documentRequest.getDocumentType(),
                getDocumentTypeLabel(documentRequest.getDocumentType(), documentRequest.getLanguage()),
                documentRequest.getLanguage(),
                documentRequest.getStatus(),
                documentRequest.getFileName(),
                documentRequest.getCreatedAt(),
                documentRequest.getExpiresAt()
        );
    }

    private List<String> buildContentLines(DocumentRequest documentRequest) {
        Student student = documentRequest.getStudent();

        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();
        String educationName = student.getEducation().getName();

        boolean english = documentRequest.getLanguage() != null
                && documentRequest.getLanguage().equalsIgnoreCase("EN");

        return switch (documentRequest.getDocumentType()) {
            case ENROLLMENT_CONFIRMATION -> english
                    ? List.of(
                    "This document confirms that the student is enrolled at the university.",
                    "Student name: " + studentName,
                    "Student number: " + student.getStudentNumber(),
                    "Education: " + educationName,
                    "Enrollment status: " + student.getEnrollmentStatus(),
                    "Semester: " + student.getSemester()
            )
                    : List.of(
                    "Dette dokument bekræfter, at den studerende er indskrevet på universitetet.",
                    "Navn: " + studentName,
                    "Studienummer: " + student.getStudentNumber(),
                    "Uddannelse: " + educationName,
                    "Indskrivningsstatus: " + student.getEnrollmentStatus(),
                    "Semester: " + student.getSemester()
            );

            case EXAM_TRANSCRIPT_ALL_ATTEMPTS -> english
                    ? List.of(
                    "This document is a preview of the exam transcript including all attempts.",
                    "Student name: " + studentName,
                    "Student number: " + student.getStudentNumber(),
                    "Detailed exam attempts will be added in the next version."
            )
                    : List.of(
                    "Dette dokument er en forhåndsvisning af eksamensudskrift inkl. alle forsøg.",
                    "Navn: " + studentName,
                    "Studienummer: " + student.getStudentNumber(),
                    "Detaljerede eksamensforsøg tilføjes i næste version."
            );

            case PASSED_RESULTS_TRANSCRIPT -> english
                    ? List.of(
                    "This document is a preview of passed results.",
                    "Student name: " + studentName,
                    "Student number: " + student.getStudentNumber(),
                    "Passed results will be added in the next version."
            )
                    : List.of(
                    "Dette dokument er en forhåndsvisning af beståede resultater.",
                    "Navn: " + studentName,
                    "Studienummer: " + student.getStudentNumber(),
                    "Beståede resultater tilføjes i næste version."
            );

            case SINGLE_COURSE_RESULT_CONFIRMATION -> english
                    ? List.of(
                    "This document is a preview of a single course result confirmation.",
                    "Student name: " + studentName,
                    "Student number: " + student.getStudentNumber(),
                    "Single course result details will be added in the next version."
            )
                    : List.of(
                    "Dette dokument er en forhåndsvisning af bekræftelse på resultat for enkeltfag.",
                    "Navn: " + studentName,
                    "Studienummer: " + student.getStudentNumber(),
                    "Detaljer for enkeltfagsresultat tilføjes i næste version."
            );
        };
    }

    private String generateFileName(
            Student student,
            DocumentType documentType,
            String language
    ) {
        String normalizedType = documentType.name().toLowerCase();
        String normalizedLanguage = language.toLowerCase();

        return student.getStudentNumber() + "_" + normalizedType + "_" + normalizedLanguage + ".pdf";
    }

    private String getDocumentTypeLabel(DocumentType documentType, String language) {
        boolean english = language != null && language.equalsIgnoreCase("EN");

        return switch (documentType) {
            case ENROLLMENT_CONFIRMATION -> english
                    ? "Enrollment confirmation - Student card"
                    : "Indskrivningsbekræftelse - Studiekort";

            case EXAM_TRANSCRIPT_ALL_ATTEMPTS -> english
                    ? "Exam transcript, including all attempts"
                    : "Eksamensudskrift, inkl. alle forsøg";

            case PASSED_RESULTS_TRANSCRIPT -> english
                    ? "Transcript, passed results"
                    : "Udskrift, beståede resultater";

            case SINGLE_COURSE_RESULT_CONFIRMATION -> english
                    ? "Confirmation of single course result"
                    : "Bekræftelse på resultat for enkeltfag";
        };
    }
}