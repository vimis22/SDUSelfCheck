package com.vivek.sduselfcheck.document;

import com.vivek.sduselfcheck.result.GradeResult;
import com.vivek.sduselfcheck.result.GradeResultRepository;
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
    private final GradeResultRepository gradeResultRepository;

    public DocumentService(
            DocumentRequestRepository documentRequestRepository,
            StudentRepository studentRepository,
            GradeResultRepository gradeResultRepository
    ) {
        this.documentRequestRepository = documentRequestRepository;
        this.studentRepository = studentRepository;
        this.gradeResultRepository = gradeResultRepository;
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
                    "Indskrivningsstatus: " + formatEnrollmentStatus(student.getEnrollmentStatus(), false),
                    "Semester: " + student.getSemester()
            );

            case EXAM_TRANSCRIPT_ALL_ATTEMPTS -> buildExamTranscriptLines(student, english, false);

            case PASSED_RESULTS_TRANSCRIPT -> buildExamTranscriptLines(student, english, true);

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

    private List<String> buildExamTranscriptLines(
            Student student,
            boolean english,
            boolean onlyPassedResults
    ) {
        List<GradeResult> gradeResults =
                gradeResultRepository.findByExamRegistrationStudentStudentIdOrderByExamRegistrationExamRegistrationIdAsc(
                        student.getStudentId()
                );

        if (onlyPassedResults) {
            gradeResults = gradeResults.stream()
                    .filter(GradeResult::isPassed)
                    .toList();
        }

        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();

        List<String> lines = new java.util.ArrayList<>();

        if (english) {
            lines.add(onlyPassedResults
                    ? "This document contains the student's passed results."
                    : "This document contains the student's exam transcript including all attempts.");
            lines.add("Student name: " + studentName);
            lines.add("Student number: " + student.getStudentNumber());
            lines.add("Education: " + student.getEducation().getName());
            lines.add("");
            lines.add("Results:");

            if (gradeResults.isEmpty()) {
                lines.add("No grade results found.");
                return lines;
            }

            for (GradeResult gradeResult : gradeResults) {
                lines.add(formatGradeResultLine(gradeResult, true));
            }

            return lines;
        }

        lines.add(onlyPassedResults
                ? "Dette dokument indeholder den studerendes beståede resultater."
                : "Dette dokument indeholder den studerendes eksamensudskrift inkl. alle forsøg.");
        lines.add("Navn: " + studentName);
        lines.add("Studienummer: " + student.getStudentNumber());
        lines.add("Uddannelse: " + student.getEducation().getName());
        lines.add("");
        lines.add("Resultater:");

        if (gradeResults.isEmpty()) {
            lines.add("Ingen karakterresultater fundet.");
            return lines;
        }

        for (GradeResult gradeResult : gradeResults) {
            lines.add(formatGradeResultLine(gradeResult, false));
        }

        return lines;
    }

    private String formatGradeResultLine(GradeResult gradeResult, boolean english) {
        String courseName = gradeResult.getExamRegistration()
                .getExam()
                .getCourse()
                .getName();

        String examTitle = gradeResult.getExamRegistration()
                .getExam()
                .getTitle();

        String passedText = gradeResult.isPassed()
                ? english ? "Passed" : "Bestået"
                : english ? "Not passed" : "Ikke bestået";

        return courseName
                + " | "
                + examTitle
                + " | Grade: "
                + gradeResult.getGradeValue()
                + " | ECTS: "
                + gradeResult.getEctsGrade()
                + " | "
                + passedText;
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

    private String formatEnrollmentStatus(String enrollmentStatus, boolean english) {
        if (enrollmentStatus == null) {
            return english ? "Unknown" : "Ukendt";
        }

        if (enrollmentStatus.equalsIgnoreCase("ACTIVE")) {
            return english ? "Active" : "Aktiv";
        }

        if (enrollmentStatus.equalsIgnoreCase("INACTIVE")) {
            return english ? "Inactive" : "Inaktiv";
        }

        return enrollmentStatus;
    }
}