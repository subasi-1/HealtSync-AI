package com.healthsync.bed.service;

import com.healthsync.bed.dto.BedRequest;
import com.healthsync.bed.dto.BedResponse;
import com.healthsync.bed.entity.Bed;
import com.healthsync.bed.entity.Ward;
import com.healthsync.bed.repository.BedRepository;
import com.healthsync.bed.repository.WardRepository;
import com.healthsync.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class handling business logic for Beds.
 */
@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;
    private final WardRepository wardRepository;

    @Transactional(readOnly = true)
    public List<BedResponse> getAllBeds() {
        return bedRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BedResponse getBedById(UUID id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with ID: " + id));
        return mapToResponse(bed);
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getBedsByWardId(UUID wardId) {
        if (!wardRepository.existsById(wardId)) {
            throw new ResourceNotFoundException("Ward not found with ID: " + wardId);
        }
        return bedRepository.findByWardId(wardId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BedResponse createBed(BedRequest request) {
        Ward ward = wardRepository.findById(request.wardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with ID: " + request.wardId()));

        if (bedRepository.existsByWardIdAndBedNumber(request.wardId(), request.bedNumber())) {
            throw new IllegalArgumentException("Bed number " + request.bedNumber() + " already exists in ward " + ward.getName());
        }

        Bed bed = Bed.builder()
                .bedNumber(request.bedNumber())
                .bedType(request.bedType())
                .availabilityStatus(request.availabilityStatus())
                .cleaningStatus(request.cleaningStatus())
                .maintenanceStatus(request.maintenanceStatus())
                .ward(ward)
                .build();

        Bed saved = bedRepository.save(bed);
        return mapToResponse(saved);
    }

    @Transactional
    public BedResponse updateBed(UUID id, BedRequest request) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with ID: " + id));

        Ward ward = wardRepository.findById(request.wardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with ID: " + request.wardId()));

        if (!bed.getBedNumber().equalsIgnoreCase(request.bedNumber())
                && bedRepository.existsByWardIdAndBedNumber(request.wardId(), request.bedNumber())) {
            throw new IllegalArgumentException("Bed number " + request.bedNumber() + " already exists in ward " + ward.getName());
        }

        bed.setBedNumber(request.bedNumber());
        bed.setBedType(request.bedType());
        bed.setAvailabilityStatus(request.availabilityStatus());
        bed.setCleaningStatus(request.cleaningStatus());
        bed.setMaintenanceStatus(request.maintenanceStatus());
        bed.setWard(ward);

        Bed updated = bedRepository.save(bed);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteBed(UUID id) {
        if (!bedRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bed not found with ID: " + id);
        }
        bedRepository.deleteById(id);
    }

    private BedResponse mapToResponse(Bed bed) {
        return new BedResponse(
                bed.getId(),
                bed.getBedNumber(),
                bed.getBedType(),
                bed.getAvailabilityStatus(),
                bed.getCleaningStatus(),
                bed.getMaintenanceStatus(),
                bed.getWard().getId(),
                bed.getWard().getName(),
                bed.getWard().getCode(),
                bed.getWard().getHealthCenter().getId()
        );
    }
}
