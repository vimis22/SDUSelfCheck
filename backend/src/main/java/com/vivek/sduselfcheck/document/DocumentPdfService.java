package com.vivek.sduselfcheck.document;

import org.openpdf.text.Document;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.BaseFont;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

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
            Font normalFont = new Font(baseFont, 11, Font.NORMAL);
            Font smallFont = new Font(baseFont, 9, Font.NORMAL);
            Font tableHeaderFont = new Font(baseFont, 9, Font.BOLD);
            Font tableFont = new Font(baseFont, 8, Font.NORMAL);

            boolean english = isEnglish(preview.getLanguage());

            addTitle(document, preview, titleFont);
            addStudentInformation(document, preview, headingFont, normalFont, english);
            addSpace(document, 15);

            document.add(new Paragraph(
                    english ? "Document content" : "Dokumentindhold",
                    headingFont
            ));

            if (isTranscriptDocument(preview.getDocumentType())) {
                addTranscriptContent(document, preview, normalFont, tableHeaderFont, tableFont, english);
            } else {
                addSimpleContent(document, preview, normalFont);
            }

            addSpace(document, 20);
            addFooter(document, preview, smallFont, english);

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

    private void addTitle(
            Document document,
            DocumentPreviewResponse preview,
            Font titleFont
    ) throws Exception {
        Paragraph title = new Paragraph(preview.getDocumentTitle(), titleFont);
        title.setSpacingAfter(20);
        document.add(title);
    }

    private void addStudentInformation(
            Document document,
            DocumentPreviewResponse preview,
            Font headingFont,
            Font normalFont,
            boolean english
    ) throws Exception {
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
    }

    private void addSimpleContent(
            Document document,
            DocumentPreviewResponse preview,
            Font normalFont
    ) throws Exception {
        for (String line : preview.getContentLines()) {
            document.add(new Paragraph(line, normalFont));
        }
    }

    private void addTranscriptContent(
            Document document,
            DocumentPreviewResponse preview,
            Font normalFont,
            Font tableHeaderFont,
            Font tableFont,
            boolean english
    ) throws Exception {
        List<String> contentLines = preview.getContentLines();

        for (String line : contentLines) {
            if (line == null || line.isBlank()) {
                continue;
            }

            if (line.contains(" | ")) {
                continue;
            }

            if (line.equalsIgnoreCase("Resultater:") || line.equalsIgnoreCase("Results:")) {
                continue;
            }

            document.add(new Paragraph(line, normalFont));
        }

        addSpace(document, 10);

        document.add(new Paragraph(
                english ? "Results" : "Resultater",
                normalFont
        ));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(8);
        table.setWidths(new float[]{3.0f, 3.0f, 1.0f, 1.0f, 1.4f});

        addTableHeader(table, english ? "Course" : "Kursus", tableHeaderFont);
        addTableHeader(table, english ? "Exam" : "Eksamen", tableHeaderFont);
        addTableHeader(table, english ? "Grade" : "Karakter", tableHeaderFont);
        addTableHeader(table, "ECTS", tableHeaderFont);
        addTableHeader(table, english ? "Status" : "Status", tableHeaderFont);

        boolean hasResults = false;

        for (String line : contentLines) {
            if (line == null || !line.contains(" | ")) {
                continue;
            }

            hasResults = true;

            String[] parts = line.split("\\|");

            String courseName = getPart(parts, 0);
            String examTitle = getPart(parts, 1);
            String grade = cleanLabel(getPart(parts, 2), "Grade:");
            String ects = cleanLabel(getPart(parts, 3), "ECTS:");
            String status = getPart(parts, 4);

            addTableCell(table, courseName, tableFont);
            addTableCell(table, examTitle, tableFont);
            addTableCell(table, grade, tableFont);
            addTableCell(table, ects, tableFont);
            addTableCell(table, status, tableFont);
        }

        if (hasResults) {
            document.add(table);
        } else {
            document.add(new Paragraph(
                    english ? "No grade results found." : "Ingen karakterresultater fundet.",
                    normalFont
            ));
        }
    }

    private void addTableHeader(
            PdfPTable table,
            String text,
            Font font
    ) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    private void addTableCell(
            PdfPTable table,
            String text,
            Font font
    ) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        table.addCell(cell);
    }

    private void addFooter(
            Document document,
            DocumentPreviewResponse preview,
            Font smallFont,
            boolean english
    ) throws Exception {
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
    }

    private void addSpace(
            Document document,
            int spacingAfter
    ) throws Exception {
        Paragraph space = new Paragraph(" ");
        space.setSpacingAfter(spacingAfter);
        document.add(space);
    }

    private boolean isTranscriptDocument(DocumentType documentType) {
        return documentType == DocumentType.EXAM_TRANSCRIPT_ALL_ATTEMPTS
                || documentType == DocumentType.PASSED_RESULTS_TRANSCRIPT;
    }

    private String getPart(String[] parts, int index) {
        if (parts.length <= index || parts[index] == null) {
            return "";
        }

        return parts[index].trim();
    }

    private String cleanLabel(String value, String label) {
        if (value == null) {
            return "";
        }

        return value.replace(label, "").trim();
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