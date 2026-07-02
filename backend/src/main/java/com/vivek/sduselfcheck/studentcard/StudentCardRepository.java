package com.vivek.sduselfcheck.studentcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentCardRepository extends JpaRepository<StudentCard, Long> {

    Optional<StudentCard> findByStudentStudentId(Long studentId);
}
