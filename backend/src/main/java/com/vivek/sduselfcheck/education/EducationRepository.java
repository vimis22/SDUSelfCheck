package com.vivek.sduselfcheck.education;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EducationRepository extends JpaRepository<Education, Long> {
    Optional<Education> findByCode(String code);
}
