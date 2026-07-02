package com.vivek.sduselfcheck.examregistration;

import com.vivek.sduselfcheck.result.GradeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {

    @Query("SELECT er FROM ExamRegistration er WHERE er NOT IN (SELECT gr.examRegistration FROM GradeResult gr)")
    List<ExamRegistration> findAllWithoutGradeResult();

    boolean existsByStudentStudentIdAndExamExamIdAndAttemptNumber(Long studentId, Long examId, Integer attemptNumber);

    boolean existsByStudentStudentIdAndExamExamId(Long studentId, Long examId);

    Optional<ExamRegistration> findByStudentStudentIdAndExamExamId(Long studentId, Long examId);

    Optional<ExamRegistration> findByStudentStudentIdAndExamCourseCourseIdAndExamReexamFalse(Long studentId, Long courseId);

    List<ExamRegistration> findByStudentStudentId(Long studentId);

    List<ExamRegistration> findByExamExamId(Long examId);
}