package com.vivek.sduselfcheck.result;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeResultRepository extends JpaRepository<GradeResult, Long> {

    Optional<GradeResult> findByExamRegistrationExamRegistrationId(Long examRegistrationId);

    List<GradeResult> findByExamRegistrationStudentStudentId(Long studentId);

    List<GradeResult> findByTeacherTeacherId(Long teacherId);

    boolean existsByExamRegistrationExamRegistrationId(Long examRegistrationId);
}