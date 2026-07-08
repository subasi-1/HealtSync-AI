package com.healthsync.patient.repository;

import com.healthsync.patient.entity.PatientVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing PatientVisit persistence operations.
 */
@Repository
public interface VisitRepository extends JpaRepository<PatientVisit, UUID> {

    @Query("SELECT v FROM PatientVisit v WHERE " +
           "(:patientId IS NULL OR v.patient.id = :patientId) AND " +
           "(:healthCenterId IS NULL OR v.healthCenter.id = :healthCenterId) AND " +
           "(:department IS NULL OR LOWER(v.department) = LOWER(:department)) AND " +
           "(cast(:startDate as timestamp) IS NULL OR v.visitDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR v.visitDate <= :endDate)")
    List<PatientVisit> searchVisits(
            @Param("patientId") UUID patientId,
            @Param("healthCenterId") UUID healthCenterId,
            @Param("department") String department,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    long countByVisitDateAfter(Instant startDate);

    long countByVisitDateBetween(Instant start, Instant end);

    long countByVisitTypeIgnoreCaseAndVisitDateBetween(String visitType, Instant start, Instant end);

    @Query("SELECT v.visitDate, COUNT(v) FROM PatientVisit v WHERE v.visitDate >= :startDate GROUP BY v.visitDate ORDER BY v.visitDate ASC")
    List<Object[]> getVisitCountsByDateAfter(@Param("startDate") Instant startDate);
}
