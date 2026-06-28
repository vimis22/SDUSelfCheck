package com.vivek.sduselfcheck.document;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
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
}