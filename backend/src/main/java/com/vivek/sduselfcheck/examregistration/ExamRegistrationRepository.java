package com.vivek.sduselfcheck.examregistration;

import com.vivek.sduselfcheck.result.GradeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {

    @Query("SELECT er FROM ExamRegistration er WHERE er NOT IN (SELECT gr.examRegistration FROM GradeResult gr)")
    List<ExamRegistration> findAllWithoutGradeResult();

    boolean existsByStudentStudentIdAndExamExamIdAndAttemptNumber(Long studentId, Long examId, Integer attemptNumber);
}