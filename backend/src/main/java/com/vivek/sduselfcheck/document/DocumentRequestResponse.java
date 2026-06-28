package com.vivek.sduselfcheck.document;

import java.time.LocalDateTime;

public class DocumentRequestResponse {

    private Long documentRequestId;

    private Long studentId;
    private String studentNumber;
    private String studentFirstName;
    private String studentLastName;

    private DocumentType documentType;
    private String documentTypeLabel;

    private String language;
    private DocumentStatus status;
    private String fileName;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public DocumentRequestResponse(
            Long documentRequestId,
            Long studentId,
            String studentNumber,
            String studentFirstName,
            String studentLastName,
            DocumentType documentType,
            String documentTypeLabel,
            String language,
            DocumentStatus status,
            String fileName,
            LocalDateTime createdAt,
            LocalDateTime expiresAt
    ) {
        this.documentRequestId = documentRequestId;
        this.studentId = studentId;
        this.studentNumber = studentNumber;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.documentType = documentType;
        this.documentTypeLabel = documentTypeLabel;
        this.language = language;
        this.status = status;
        this.fileName = fileName;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public Long getDocumentRequestId() {
        return documentRequestId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public String getStudentFirstName() {
        return studentFirstName;
    }

    public String getStudentLastName() {
        return studentLastName;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public String getDocumentTypeLabel() {
        return documentTypeLabel;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}