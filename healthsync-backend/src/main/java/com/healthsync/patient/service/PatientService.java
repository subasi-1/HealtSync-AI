package com.healthsync.patient.service;

import com.healthsync.auth.entity.User;
import com.healthsync.common.event.PatientAnalyticsEvent;
import com.healthsync.exception.ResourceNotFoundException;
import com.healthsync.district.entity.District;
import com.healthsync.district.entity.HealthCenter;
import com.healthsync.patient.dto.EmergencyContactDto;
import com.healthsync.patient.dto.PatientRequest;
import com.healthsync.patient.dto.PatientResponse;
import com.healthsync.patient.entity.Patient;
import com.healthsync.patient.entity.PatientEmergencyContact;
import com.healthsync.patient.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class handling business logic for Patient registry profiles.
 */
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ApplicationEventPublisher eventPublisher;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<PatientResponse> searchPatients(String query, String mobile, String patientId, String status) {
        StringBuilder jpql = new StringBuilder("SELECT p FROM Patient p WHERE 1=1");
        java.util.Map<String, Object> params = new java.util.HashMap<>();

        if (query != null && !query.isBlank()) {
            jpql.append(" AND LOWER(p.fullName) LIKE :query");
            params.put("query", "%" + query.trim().toLowerCase() + "%");
        }
        if (mobile != null && !mobile.isBlank()) {
            jpql.append(" AND p.mobileNumber = :mobile");
            params.put("mobile", mobile.trim());
        }
        if (patientId != null && !patientId.isBlank()) {
            jpql.append(" AND p.patientId = :patientId");
            params.put("patientId", patientId.trim());
        }
        if (status != null && !status.isBlank()) {
            jpql.append(" AND p.status = :status");
            params.put("status", status.trim());
        }

        jakarta.persistence.TypedQuery<Patient> typedQuery = entityManager.createQuery(jpql.toString(), Patient.class);
        params.forEach(typedQuery::setParameter);

        return typedQuery.getResultList().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        return mapToResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByCode(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with Patient ID: " + patientId));
        return mapToResponse(patient);
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        if (patientRepository.existsByMobileNumber(request.mobileNumber())) {
            throw new IllegalArgumentException("Mobile number is already registered: " + request.mobileNumber());
        }

        District district = entityManager.find(District.class, request.districtId());
        if (district == null) {
            throw new ResourceNotFoundException("District not found with ID: " + request.districtId());
        }

        HealthCenter healthCenter = entityManager.find(HealthCenter.class, request.healthCenterId());
        if (healthCenter == null) {
            throw new ResourceNotFoundException("Health Center not found with ID: " + request.healthCenterId());
        }

        User user = null;
        if (request.userId() != null) {
            user = entityManager.find(User.class, request.userId());
            if (user == null) {
                throw new ResourceNotFoundException("User not found with ID: " + request.userId());
            }
        }

        int calculatedAge = Period.between(request.dateOfBirth(), LocalDate.now()).getYears();

        PatientEmergencyContact emergencyContact = PatientEmergencyContact.builder()
                .contactName(request.emergencyContact().contactName())
                .relationship(request.emergencyContact().relationship())
                .phoneNumber(request.emergencyContact().phoneNumber())
                .build();

        String patientId = generatePatientId();

        Patient patient = Patient.builder()
                .user(user)
                .patientId(patientId)
                .medicalRecordNumber(request.medicalRecordNumber())
                .fullName(request.fullName())
                .age(calculatedAge)
                .gender(request.gender())
                .dateOfBirth(request.dateOfBirth())
                .bloodGroup(request.bloodGroup())
                .mobileNumber(request.mobileNumber())
                .address(request.address())
                .status(request.status())
                .district(district)
                .healthCenter(healthCenter)
                .emergencyContact(emergencyContact)
                .build();

        Patient saved = patientRepository.save(patient);

        eventPublisher.publishEvent(new PatientAnalyticsEvent(
                saved.getId(),
                saved.getPatientId(),
                saved.getFullName(),
                saved.getGender(),
                saved.getAge(),
                saved.getDistrict().getId(),
                saved.getHealthCenter().getId(),
                saved.getStatus()
        ));

        return mapToResponse(saved);
    }

    @Transactional
    public PatientResponse updatePatient(UUID id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        if (!patient.getMobileNumber().equals(request.mobileNumber()) && patientRepository.existsByMobileNumber(request.mobileNumber())) {
            throw new IllegalArgumentException("Mobile number is already registered: " + request.mobileNumber());
        }

        District district = entityManager.find(District.class, request.districtId());
        if (district == null) {
            throw new ResourceNotFoundException("District not found with ID: " + request.districtId());
        }

        HealthCenter healthCenter = entityManager.find(HealthCenter.class, request.healthCenterId());
        if (healthCenter == null) {
            throw new ResourceNotFoundException("Health Center not found with ID: " + request.healthCenterId());
        }

        User user = null;
        if (request.userId() != null) {
            user = entityManager.find(User.class, request.userId());
            if (user == null) {
                throw new ResourceNotFoundException("User not found with ID: " + request.userId());
            }
        }

        int calculatedAge = Period.between(request.dateOfBirth(), LocalDate.now()).getYears();

        patient.setUser(user);
        patient.setMedicalRecordNumber(request.medicalRecordNumber());
        patient.setFullName(request.fullName());
        patient.setAge(calculatedAge);
        patient.setGender(request.gender());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setBloodGroup(request.bloodGroup());
        patient.setMobileNumber(request.mobileNumber());
        patient.setAddress(request.address());
        patient.setStatus(request.status());
        patient.setDistrict(district);
        patient.setHealthCenter(healthCenter);

        if (patient.getEmergencyContact() != null) {
            patient.getEmergencyContact().setContactName(request.emergencyContact().contactName());
            patient.getEmergencyContact().setRelationship(request.emergencyContact().relationship());
            patient.getEmergencyContact().setPhoneNumber(request.emergencyContact().phoneNumber());
        } else {
            PatientEmergencyContact contact = PatientEmergencyContact.builder()
                    .contactName(request.emergencyContact().contactName())
                    .relationship(request.emergencyContact().relationship())
                    .phoneNumber(request.emergencyContact().phoneNumber())
                    .build();
            patient.setEmergencyContact(contact);
        }

        Patient updated = patientRepository.save(patient);

        eventPublisher.publishEvent(new PatientAnalyticsEvent(
                updated.getId(),
                updated.getPatientId(),
                updated.getFullName(),
                updated.getGender(),
                updated.getAge(),
                updated.getDistrict().getId(),
                updated.getHealthCenter().getId(),
                updated.getStatus()
        ));

        return mapToResponse(updated);
    }

    @Transactional
    public void deletePatient(UUID id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with ID: " + id);
        }
        patientRepository.deleteById(id);
    }

    private String generatePatientId() {
        int year = LocalDate.now().getYear();
        Number nextVal = (Number) entityManager.createNativeQuery("SELECT nextval('patient_id_seq')").getSingleResult();
        return String.format("PAT-%d-%05d", year, nextVal.longValue());
    }

    private PatientResponse mapToResponse(Patient patient) {
        EmergencyContactDto contactDto = null;
        if (patient.getEmergencyContact() != null) {
            contactDto = new EmergencyContactDto(
                    patient.getEmergencyContact().getContactName(),
                    patient.getEmergencyContact().getRelationship(),
                    patient.getEmergencyContact().getPhoneNumber()
            );
        }

        return new PatientResponse(
                patient.getId(),
                patient.getPatientId(),
                patient.getMedicalRecordNumber(),
                patient.getFullName(),
                patient.getAge(),
                patient.getGender(),
                patient.getDateOfBirth(),
                patient.getBloodGroup(),
                patient.getMobileNumber(),
                patient.getAddress(),
                patient.getStatus(),
                patient.getDistrict().getId(),
                patient.getDistrict().getName(),
                patient.getHealthCenter().getId(),
                patient.getHealthCenter().getName(),
                contactDto
        );
    }
}
