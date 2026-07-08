package com.healthsync.doctor.controller;

import com.healthsync.common.ApiResponse;
import com.healthsync.doctor.entity.Attendance;
import com.healthsync.doctor.entity.AttendanceStatus;
import com.healthsync.doctor.entity.Doctor;
import com.healthsync.doctor.entity.Shift;
import com.healthsync.doctor.repository.AttendanceRepository;
import com.healthsync.doctor.repository.DoctorRepository;
import com.healthsync.doctor.repository.ShiftRepository;
import com.healthsync.doctor.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Endpoints for managing doctors profiles, shifts, and attendance")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;
    private final ShiftRepository shiftRepository;
    private final AttendanceRepository attendanceRepository;

    @GetMapping
    @Operation(summary = "Get all doctors, optionally filtered by health center")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctors(@RequestParam(required = false) UUID hospitalId) {
        List<Doctor> list = hospitalId != null 
                ? doctorRepository.findByHealthCenterId(hospitalId) 
                : doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success(list, "Doctors fetched successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update daily status of a doctor")
    public ResponseEntity<ApiResponse<Doctor>> updateStatus(@PathVariable UUID id, @RequestBody StatusUpdateRequest request) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        AttendanceStatus attStatus = AttendanceStatus.PRESENT;
        if ("Off-Duty".equalsIgnoreCase(request.getStatus())) {
            attStatus = AttendanceStatus.ABSENT;
        }
        
        updateAttendanceToday(doc, attStatus);
        
        return ResponseEntity.ok(ApiResponse.success(doc, "Status updated successfully"));
    }

    @PutMapping("/{id}/shift")
    @Operation(summary = "Assign a shift and department to a doctor")
    public ResponseEntity<ApiResponse<Doctor>> assignShift(@PathVariable UUID id, @RequestBody ShiftUpdateRequest request) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        Shift shift = shiftRepository.findByNameIgnoreCase(request.getShift())
                .orElseGet(() -> {
                    Shift newShift = Shift.builder()
                            .name(request.getShift())
                            .startTime(LocalTime.of(9, 0))
                            .endTime(LocalTime.of(17, 0))
                            .build();
                    return shiftRepository.save(newShift);
                });
        
        doc.setDefaultShift(shift);
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            doc.setSpecialization(request.getDepartment());
        }
        Doctor updated = doctorRepository.save(doc);
        return ResponseEntity.ok(ApiResponse.success(updated, "Shift assigned successfully"));
    }

    @PutMapping("/{id}/leave")
    @Operation(summary = "Request leave for a doctor")
    public ResponseEntity<ApiResponse<Doctor>> requestLeave(@PathVariable UUID id, @RequestBody LeaveRequest request) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        AttendanceStatus attStatus = request.getIsLeave() ? AttendanceStatus.ON_LEAVE : AttendanceStatus.PRESENT;
        updateAttendanceToday(doc, attStatus);
        
        return ResponseEntity.ok(ApiResponse.success(doc, "Leave status updated successfully"));
    }

    private void updateAttendanceToday(Doctor doctor, AttendanceStatus status) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByDate(today).stream()
                .filter(att -> att.getDoctor().getId().equals(doctor.getId()))
                .findFirst()
                .orElse(Attendance.builder()
                        .doctor(doctor)
                        .date(today)
                        .checkInTime(LocalTime.of(9, 0))
                        .build());
        attendance.setStatus(status);
        attendanceRepository.save(attendance);
    }

    @Data
    public static class StatusUpdateRequest {
        private String status;
    }

    @Data
    public static class ShiftUpdateRequest {
        private String shift;
        private String department;
    }

    @Data
    public static class LeaveRequest {
        private Boolean isLeave;
    }
}
