package com.vivek.sduselfcheck.document;

import org.openpdf.text.Document;
import org.openpdf.text.Font;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.BaseFont;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class DocumentPdfService {

    private final DocumentService documentService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

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
            Font headingFont = new Font(baseFont, 13, Font.BOLD);
            Font normalFont = new Font(baseFont, 12, Font.NORMAL);
            Font smallFont = new Font(baseFont, 10, Font.NORMAL);

            boolean english = isEnglish(preview.getLanguage());

            Paragraph title = new Paragraph(preview.getDocumentTitle(), titleFont);
            title.setSpacingAfter(20);
            document.add(title);

            document.add(new Paragraph(
                    english ? "Student information" : "Studieoplysninger",
                    headingFont
            ));

            document.add(new Paragraph(
                    english ? "Student number: " + preview.getStudentNumber()
                            : "Studienummer: " + preview.getStudentNumber(),
                    normalFont
            ));

            document.add(new Paragraph(
                    english ? "Student name: " + preview.getStudentName()
                            : "Navn: " + preview.getStudentName(),
                    normalFont
            ));

            document.add(new Paragraph(
                    english ? "Education: " + preview.getEducationName()
                            : "Uddannelse: " + preview.getEducationName(),
                    normalFont
            ));

            document.add(new Paragraph(
                    english ? "Language: " + formatLanguage(preview.getLanguage())
                            : "Sprog: " + formatLanguage(preview.getLanguage()),
                    normalFont
            ));

            document.add(new Paragraph(
                    english ? "Status: " + formatStatus(preview.getStatus(), true)
                            : "Status: " + formatStatus(preview.getStatus(), false),
                    normalFont
            ));

            Paragraph space = new Paragraph(" ");
            space.setSpacingAfter(15);
            document.add(space);

            document.add(new Paragraph(
                    english ? "Document content" : "Dokumentindhold",
                    headingFont
            ));

            for (String line : preview.getContentLines()) {
                document.add(new Paragraph(line, normalFont));
            }

            Paragraph footerSpace = new Paragraph(" ");
            footerSpace.setSpacingBefore(25);
            document.add(footerSpace);

            document.add(new Paragraph(
                    english ? "Generated at: " + formatDateTime(preview.getGeneratedAt())
                            : "Genereret den: " + formatDateTime(preview.getGeneratedAt()),
                    smallFont
            ));

            document.add(new Paragraph(
                    english ? "Expires at: " + formatDateTime(preview.getExpiresAt())
                            : "Udløber den: " + formatDateTime(preview.getExpiresAt()),
                    smallFont
            ));

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

    private boolean isEnglish(String language) {
        return language != null && language.equalsIgnoreCase("EN");
    }

    private String formatLanguage(String language) {
        if (language == null) {
            return "Ukendt";
        }

        if (language.equalsIgnoreCase("DA")) {
            return "Dansk";
        }

        if (language.equalsIgnoreCase("EN")) {
            return "English";
        }

        return language;
    }

    private String formatStatus(DocumentStatus status, boolean english) {
        if (status == null) {
            return english ? "Unknown" : "Ukendt";
        }

        return switch (status) {
            case PENDING -> english ? "Pending" : "Afventer";
            case READY -> english ? "Ready" : "Færdig";
            case FAILED -> english ? "Failed" : "Fejlet";
            case EXPIRED -> english ? "Expired" : "Udløbet";
        };
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }

        return dateTime.format(DATE_TIME_FORMATTER);
    }
}