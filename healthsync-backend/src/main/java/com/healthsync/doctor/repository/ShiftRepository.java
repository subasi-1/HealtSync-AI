package com.healthsync.doctor.repository;

import com.healthsync.doctor.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing Shift configurations.
 */
@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {
    Optional<Shift> findByNameIgnoreCase(String name);
}
