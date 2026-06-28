package com.vivek.sduselfcheck.document;

import java.time.LocalDateTime;
import java.util.List;

public class DocumentPreviewResponse {

    private Long documentRequestId;

    private DocumentType documentType;
    private String documentTitle;
    private String language;
    private DocumentStatus status;
    private String fileName;

    private Long studentId;
    private String studentNumber;
    private String studentName;

    private Long educationId;
    private String educationCode;
    private String educationName;

    private LocalDateTime generatedAt;
    private LocalDateTime expiresAt;

    private List<String> contentLines;

    public DocumentPreviewResponse(
            Long documentRequestId,
            DocumentType documentType,
            String documentTitle,
            String language,
            DocumentStatus status,
            String fileName,
            Long studentId,
            String studentNumber,
            String studentName,
            Long educationId,
            String educationCode,
            String educationName,
            LocalDateTime generatedAt,
            LocalDateTime expiresAt,
            List<String> contentLines
    ) {
        this.documentRequestId = documentRequestId;
        this.documentType = documentType;
        this.documentTitle = documentTitle;
        this.language = language;
        this.status = status;
        this.fileName = fileName;
        this.studentId = studentId;
        this.studentNumber = studentNumber;
        this.studentName = studentName;
        this.educationId = educationId;
        this.educationCode = educationCode;
        this.educationName = educationName;
        this.generatedAt = generatedAt;
        this.expiresAt = expiresAt;
        this.contentLines = contentLines;
    }

    public Long getDocumentRequestId() {
        return documentRequestId;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public String getDocumentTitle() {
        return documentTitle;
    }

    public String getLanguage() {
        return language;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public String getFileName() {
        return fileName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getEducationId() {
        return educationId;
    }

    public String getEducationCode() {
        return educationCode;
    }

    public String getEducationName() {
        return educationName;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public List<String> getContentLines() {
        return contentLines;
    }
}