package com.healthsync.bed.repository;

import com.healthsync.bed.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing Bed persistence operations.
 */
@Repository
public interface BedRepository extends JpaRepository<Bed, UUID> {

    Optional<Bed> findByWardIdAndBedNumber(UUID wardId, String bedNumber);

    boolean existsByWardIdAndBedNumber(UUID wardId, String bedNumber);

    List<Bed> findByWardId(UUID wardId);

    long countByAvailabilityStatusIgnoreCase(String status);
}
