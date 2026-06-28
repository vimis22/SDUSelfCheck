package com.vivek.sduselfcheck.document;

import org.openpdf.text.Document;
import org.openpdf.text.Font;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.BaseFont;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class DocumentPdfService {

    private final DocumentService documentService;

    public DocumentPdfService(DocumentService documentService) {
        this.documentService = documentService;
    }

    public byte[] generateDocumentPdf(Long documentRequestId) {
        try {
            DocumentPreviewResponse preview = documentService.getDocumentPreview(documentRequestId);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);

            document.open();

            BaseFont baseFont = BaseFont.createFont(
                    BaseFont.HELVETICA,
                    BaseFont.CP1252,
                    BaseFont.NOT_EMBEDDED
            );

            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font normalFont = new Font(baseFont, 12, Font.NORMAL);
            Font smallFont = new Font(baseFont, 10, Font.NORMAL);

            Paragraph title = new Paragraph(preview.getDocumentTitle(), titleFont);
            title.setSpacingAfter(20);
            document.add(title);

            document.add(new Paragraph("Student information", normalFont));
            document.add(new Paragraph("Student number: " + preview.getStudentNumber(), normalFont));
            document.add(new Paragraph("Student name: " + preview.getStudentName(), normalFont));
            document.add(new Paragraph("Education: " + preview.getEducationName(), normalFont));
            document.add(new Paragraph("Language: " + preview.getLanguage(), normalFont));
            document.add(new Paragraph("Status: " + preview.getStatus(), normalFont));

            Paragraph space = new Paragraph(" ");
            space.setSpacingAfter(15);
            document.add(space);

            document.add(new Paragraph("Document content", normalFont));

            for (String line : preview.getContentLines()) {
                document.add(new Paragraph(line, normalFont));
            }

            Paragraph footerSpace = new Paragraph(" ");
            footerSpace.setSpacingBefore(25);
            document.add(footerSpace);

            document.add(new Paragraph("Generated at: " + preview.getGeneratedAt(), smallFont));
            document.add(new Paragraph("Expires at: " + preview.getExpiresAt(), smallFont));

            document.close();

            return outputStream.toByteArray();

        } catch (Exception exception) {
            throw new RuntimeException("Could not generate PDF document.", exception);
        }
    }

    public String getFileName(Long documentRequestId) {
        DocumentPreviewResponse preview = documentService.getDocumentPreview(documentRequestId);
        return preview.getFileName();
    }
}