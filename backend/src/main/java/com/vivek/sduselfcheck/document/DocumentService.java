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