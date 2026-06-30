package com.vivek.sduselfcheck.document;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentPdfService documentPdfService;

    public DocumentController(
            DocumentService documentService,
            DocumentPdfService documentPdfService
    ) {
        this.documentService = documentService;
        this.documentPdfService = documentPdfService;
    }

    @GetMapping("/types")
    public List<DocumentType> getDocumentTypes() {
        return documentService.getDocumentTypes();
    }

    @PostMapping
    public DocumentRequestResponse createDocumentRequest(@RequestBody CreateDocumentRequest request) {
        return documentService.createDocumentRequest(request);
    }

    @GetMapping("/student/{studentId}")
    public List<DocumentRequestResponse> getDocumentsByStudentId(@PathVariable Long studentId) {
        return documentService.getDocumentsByStudentId(studentId);
    }

    @GetMapping("/{documentRequestId}")
    public DocumentRequestResponse getDocumentById(@PathVariable Long documentRequestId) {
        return documentService.getDocumentById(documentRequestId);
    }

    @GetMapping("/{documentRequestId}/preview")
    public DocumentPreviewResponse getDocumentPreview(@PathVariable Long documentRequestId) {
        return documentService.getDocumentPreview(documentRequestId);
    }

    @DeleteMapping("/{documentRequestId}")
    public ResponseEntity<Void> deleteDocumentRequest(@PathVariable Long documentRequestId) {
        documentService.deleteDocumentRequest(documentRequestId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{documentRequestId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentRequestId) {
        byte[] pdfBytes = documentPdfService.generateDocumentPdf(documentRequestId);
        String fileName = documentPdfService.getFileName(documentRequestId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}