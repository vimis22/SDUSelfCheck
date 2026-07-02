package com.vivek.sduselfcheck.education;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    public List<EducationResponse> getAllEducations() {
        return educationRepository.findAll(Sort.by(Sort.Order.asc("degreeType"), Sort.Order.asc("name")))
                .stream()
                .map(education -> new EducationResponse(
                        education.getEducationId(),
                        education.getCode(),
                        education.getName(),
                        education.getDegreeType(),
                        education.getEcts(),
                        education.getSchool().getName(),
                        education.getSchool().getFaculty().getName()
                ))
                .toList();
    }
}