package com.healthsync.common.util;

import com.healthsync.auth.entity.*;
import com.healthsync.auth.repository.UserRepository;
import com.healthsync.bed.entity.Bed;
import com.healthsync.bed.entity.Ward;
import com.healthsync.bed.repository.BedRepository;
import com.healthsync.bed.repository.WardRepository;
import com.healthsync.district.entity.District;
import com.healthsync.district.entity.HealthCenter;
import com.healthsync.district.entity.HealthCenterType;
import com.healthsync.district.repository.DistrictRepository;
import com.healthsync.district.repository.HealthCenterRepository;
import com.healthsync.doctor.entity.Attendance;
import com.healthsync.doctor.entity.AttendanceStatus;
import com.healthsync.doctor.entity.Doctor;
import com.healthsync.doctor.entity.Shift;
import com.healthsync.doctor.repository.AttendanceRepository;
import com.healthsync.doctor.repository.DoctorRepository;
import com.healthsync.doctor.repository.ShiftRepository;
import com.healthsync.inventory.entity.Inventory;
import com.healthsync.inventory.entity.Medicine;
import com.healthsync.inventory.entity.MedicineCategory;
import com.healthsync.inventory.repository.InventoryRepository;
import com.healthsync.inventory.repository.MedicineRepository;
import com.healthsync.laboratory.entity.DiagnosticTest;
import com.healthsync.laboratory.entity.Laboratory;
import com.healthsync.laboratory.repository.DiagnosticTestRepository;
import com.healthsync.laboratory.repository.LaboratoryRepository;
import com.healthsync.notification.entity.Notification;
import com.healthsync.notification.repository.NotificationRepository;
import com.healthsync.patient.entity.DiseaseCategory;
import com.healthsync.patient.entity.Patient;
import com.healthsync.patient.entity.PatientEmergencyContact;
import com.healthsync.patient.entity.PatientVisit;
import com.healthsync.patient.repository.DiseaseCategoryRepository;
import com.healthsync.patient.repository.PatientRepository;
import com.healthsync.patient.repository.VisitRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Startup database seeder initializing default clinical profiles, inventories, beds, and preloaded users.
 * Uses query checks to avoid duplicate insertion constraint violations.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@org.springframework.context.annotation.Profile("!test")
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DistrictRepository districtRepository;
    private final HealthCenterRepository healthCenterRepository;
    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final ShiftRepository shiftRepository;
    private final DoctorRepository doctorRepository;
    private final AttendanceRepository attendanceRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final PatientRepository patientRepository;
    private final DiseaseCategoryRepository diseaseCategoryRepository;
    private final VisitRepository visitRepository;
    private final DiagnosticTestRepository diagnosticTestRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database state for seeding...");

        // 1. Seed District
        District district;
        List<District> districts = entityManager.createQuery("SELECT d FROM District d WHERE d.name = :name", District.class)
                .setParameter("name", "District Central")
                .getResultList();
        if (districts.isEmpty()) {
            district = District.builder()
                    .name("District Central")
                    .region("Odisha Central")
                    .population(1500000L)
                    .build();
            setAudit(district);
            district = districtRepository.save(district);
        } else {
            district = districts.get(0);
        }

        // 2. Seed Health Centers
        HealthCenter hosp1 = getOrCreateHealthCenter("Metro General District Hospital", HealthCenterType.CHC, "Plot 12, Jayadev Vihar, Bhubaneswar", 150, district);
        HealthCenter hosp2 = getOrCreateHealthCenter("Valley CHC", HealthCenterType.CHC, "Main Road, Valley Square, Khurda", 60, district);
        HealthCenter hosp3 = getOrCreateHealthCenter("Sunset PHC", HealthCenterType.PHC, "Sunset Village, Cuttack Outskirts", 20, district);

        // 3. Seed Users
        String defaultPass = passwordEncoder.encode("demo1234");
        User uSuper = getOrCreateUser("director.admin", defaultPass, "director.admin@healthsync.org", "Chief Director Rajesh", Role.SUPER_ADMIN);
        User uDistrict = getOrCreateUser("priya.district", defaultPass, "priya.district@healthsync.org", "District Coordinator Priya", Role.DISTRICT_ADMIN);
        User uMetro = getOrCreateUser("admin.metro", defaultPass, "admin.metro@healthsync.org", "Metro General Admin", Role.HOSPITAL_ADMIN);

        // 4. Wards & Beds seeding
        Ward wardIcu = getOrCreateWard("ICU-01", "Intensive Care Unit", "ICU", 1, 10, hosp1);
        Ward wardGen = getOrCreateWard("GEN-01", "General Male Ward", "General", 2, 30, hosp1);
        Ward wardIcuValley = getOrCreateWard("ICU-VALLEY", "ICU Ward", "ICU", 1, 5, hosp2);

        // Beds
        for (int i = 1; i <= 5; i++) {
            getOrCreateBed("ICU-10" + i, "ICU", i <= 3 ? "OCCUPIED" : "AVAILABLE", "CLEAN", "OPERATIONAL", wardIcu);
        }
        for (int i = 1; i <= 10; i++) {
            getOrCreateBed("GEN-20" + i, "GENERAL", i <= 6 ? "OCCUPIED" : "AVAILABLE", "CLEAN", "OPERATIONAL", wardGen);
        }
        for (int i = 1; i <= 3; i++) {
            getOrCreateBed("VALLEY-ICU-10" + i, "ICU", "AVAILABLE", "CLEAN", "OPERATIONAL", wardIcuValley);
        }

        // 5. Seed Shifts & Doctors
        Shift shiftMorn = getOrCreateShift("Morning", LocalTime.of(8, 0), LocalTime.of(16, 0));
        Shift shiftNight = getOrCreateShift("Night", LocalTime.of(16, 0), LocalTime.of(8, 0));

        // Doctor User Account
        User docUser = getOrCreateUser("dr.alok", defaultPass, "alok.sharma@healthsync.org", "Dr. Alok Sharma", Role.HOSPITAL_ADMIN);
        Doctor doc = getOrCreateDoctor(docUser, "LIC-100234", "General Practice", hosp1, shiftMorn);

        // Daily Attendance log
        List<Attendance> attendances = entityManager.createQuery("SELECT a FROM Attendance a WHERE a.doctor.id = :docId AND a.date = :date", Attendance.class)
                .setParameter("docId", doc.getId())
                .setParameter("date", LocalDate.now())
                .getResultList();
        if (attendances.isEmpty()) {
            Attendance attendance = Attendance.builder()
                    .doctor(doc)
                    .date(LocalDate.now())
                    .status(AttendanceStatus.PRESENT)
                    .checkInTime(LocalTime.of(8, 5))
                    .build();
            setAudit(attendance);
            attendanceRepository.save(attendance);
        }

        // 6. Seed Medicine & Inventory
        MedicineCategory catAna = getOrCreateMedicineCategory("Analgesics", "Pain relief medication");
        MedicineCategory catAnt = getOrCreateMedicineCategory("Antibiotics", "Bacterial infection treatments");

        Medicine paracetamol = getOrCreateMedicine("Paracetamol 500mg", "Paracetamol", "MED-PARA500", catAna, "500mg", "Tablets");
        Medicine amoxicillin = getOrCreateMedicine("Amoxicillin 250mg", "Amoxicillin", "MED-AMOX250", catAnt, "250mg", "Capsules");
        Medicine oxygen = getOrCreateMedicine("Oxygen Cylinder", "Medical Oxygen", "MED-OXYCYL", catAna, "47L", "Cylinders");

        // Stocks seeding
        getOrCreateInventory(hosp1, paracetamol, 1200, "B-PARA101", 300);
        getOrCreateInventory(hosp3, paracetamol, 80, "B-PARA102", 200);
        getOrCreateInventory(hosp2, paracetamol, 4200, "B-PARA103", 500);
        getOrCreateInventory(hosp1, amoxicillin, 450, "B-AMOX201", 150);
        getOrCreateInventory(hosp3, oxygen, 2, "B-OXY301", 10);

        // 7. Seed Patients & Visits
        Patient patient = getOrCreatePatient("PAT-20034", "MRN-44210", "Ravi Verma", 42, "Male", LocalDate.of(1984, 6, 12), "B+", "+919999988888", "Gautam Nagar, Lane 3, Cuttack", district, hosp1);

        DiseaseCategory dcFlu = getOrCreateDiseaseCategory("ICD-J11", "Influenza / Respiratory Infections", "Infectious respiratory viruses", 2, true, true);

        // Patient Visit
        List<PatientVisit> visits = entityManager.createQuery("SELECT v FROM PatientVisit v WHERE v.patient.id = :patId", PatientVisit.class)
                .setParameter("patId", patient.getId())
                .getResultList();
        if (visits.isEmpty()) {
            PatientVisit visit = PatientVisit.builder()
                    .patient(patient)
                    .healthCenter(hosp1)
                    .doctor(doc)
                    .visitDate(Instant.now().minus(1, ChronoUnit.DAYS))
                    .visitTime(LocalTime.of(10, 30))
                    .department("General Medicine")
                    .visitType("OPD")
                    .symptoms("High fever, dry cough, severe head congestion")
                    .diagnosis("Influenza respiratory strain suspected")
                    .status("COMPLETED")
                    .visitDuration(15)
                    .waitingTime(20)
                    .ageGroup("ADULT")
                    .diseaseCategory(dcFlu)
                    .build();
            setAudit(visit);
            visitRepository.save(visit);
        }

        // 8. Seed Lab Diagnostic Tests
        DiagnosticTest testCbc = getOrCreateDiagnosticTest("Complete Blood Count (CBC)", "LAB-CBC", "Counts red, white cells and platelets count metrics", "WBC: 4.5-11.0 k/uL, RBC: 4.5-5.9 M/uL", BigDecimal.valueOf(150.0), "Hematology", 20);
        DiagnosticTest testMalaria = getOrCreateDiagnosticTest("Malaria Antigen Assay Kit", "LAB-MALARIA", "Rapid antigen detection kit assay test for Plasmodium", "Negative", BigDecimal.valueOf(250.0), "Parasitology", 15);

        getOrCreateLaboratory("Central Diagnostics Laboratory", hosp1, "ACTIVE", "08:00 - 18:00", 8);

        // 9. Seed System Notifications
        getOrCreateNotification("Low Stock alert for Paracetamol 500mg (80 tabs left) at Sunset PHC", "MEDICINE_SHORTAGE", hosp3);
        getOrCreateNotification("Critical inventory alert: Oxygen Cylinder is critically low (2 cylinders left) at Sunset PHC", "MEDICINE_SHORTAGE", hosp3);

        log.info("Clinical database seeding checks completed successfully!");
    }

    private HealthCenter getOrCreateHealthCenter(String name, HealthCenterType type, String address, int capacity, District district) {
        List<HealthCenter> list = entityManager.createQuery("SELECT h FROM HealthCenter h WHERE h.name = :name", HealthCenter.class)
                .setParameter("name", name)
                .getResultList();
        if (list.isEmpty()) {
            HealthCenter hc = HealthCenter.builder()
                    .name(name)
                    .type(type)
                    .address(address)
                    .capacity(capacity)
                    .district(district)
                    .build();
            setAudit(hc);
            return healthCenterRepository.save(hc);
        }
        return list.get(0);
    }

    private User getOrCreateUser(String username, String encodedPass, String email, String fullName, Role role) {
        List<User> list = entityManager.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username)
                .getResultList();
        if (list.isEmpty()) {
            User u = User.builder()
                    .username(username)
                    .password(encodedPass)
                    .email(email)
                    .fullName(fullName)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .build();
            setAudit(u);
            return userRepository.save(u);
        }
        return list.get(0);
    }

    private Ward getOrCreateWard(String code, String name, String department, int floor, int capacity, HealthCenter healthCenter) {
        List<Ward> list = entityManager.createQuery("SELECT w FROM Ward w WHERE w.code = :code", Ward.class)
                .setParameter("code", code)
                .getResultList();
        if (list.isEmpty()) {
            Ward w = Ward.builder()
                    .code(code)
                    .name(name)
                    .department(department)
                    .floor(floor)
                    .capacity(capacity)
                    .status("ACTIVE")
                    .healthCenter(healthCenter)
                    .build();
            setAudit(w);
            return wardRepository.save(w);
        }
        return list.get(0);
    }

    private void getOrCreateBed(String bedNumber, String bedType, String availStatus, String cleanStatus, String maintenanceStatus, Ward ward) {
        List<Bed> list = entityManager.createQuery("SELECT b FROM Bed b WHERE b.ward.id = :wardId AND b.bedNumber = :bedNumber", Bed.class)
                .setParameter("wardId", ward.getId())
                .setParameter("bedNumber", bedNumber)
                .getResultList();
        if (list.isEmpty()) {
            Bed b = Bed.builder()
                    .bedNumber(bedNumber)
                    .bedType(bedType)
                    .availabilityStatus(availStatus)
                    .cleaningStatus(cleanStatus)
                    .maintenanceStatus(maintenanceStatus)
                    .ward(ward)
                    .build();
            setAudit(b);
            bedRepository.save(b);
        }
    }

    private Shift getOrCreateShift(String name, LocalTime startTime, LocalTime endTime) {
        List<Shift> list = entityManager.createQuery("SELECT s FROM Shift s WHERE s.name = :name", Shift.class)
                .setParameter("name", name)
                .getResultList();
        if (list.isEmpty()) {
            Shift s = Shift.builder()
                    .name(name)
                    .startTime(startTime)
                    .endTime(endTime)
                    .build();
            setAudit(s);
            return shiftRepository.save(s);
        }
        return list.get(0);
    }

    private Doctor getOrCreateDoctor(User user, String license, String specialization, HealthCenter healthCenter, Shift shift) {
        List<Doctor> list = entityManager.createQuery("SELECT d FROM Doctor d WHERE d.user.id = :userId", Doctor.class)
                .setParameter("userId", user.getId())
                .getResultList();
        if (list.isEmpty()) {
            Doctor d = Doctor.builder()
                    .user(user)
                    .licenseNumber(license)
                    .specialization(specialization)
                    .healthCenter(healthCenter)
                    .defaultShift(shift)
                    .build();
            setAudit(d);
            return doctorRepository.save(d);
        }
        return list.get(0);
    }

    private MedicineCategory getOrCreateMedicineCategory(String name, String description) {
        List<MedicineCategory> list = entityManager.createQuery("SELECT mc FROM MedicineCategory mc WHERE mc.name = :name", MedicineCategory.class)
                .setParameter("name", name)
                .getResultList();
        if (list.isEmpty()) {
            MedicineCategory mc = MedicineCategory.builder()
                    .name(name)
                    .description(description)
                    .build();
            setAudit(mc);
            entityManager.persist(mc);
            return mc;
        }
        return list.get(0);
    }

    private Medicine getOrCreateMedicine(String name, String genericName, String code, MedicineCategory category, String strength, String unit) {
        List<Medicine> list = entityManager.createQuery("SELECT m FROM Medicine m WHERE m.code = :code", Medicine.class)
                .setParameter("code", code)
                .getResultList();
        if (list.isEmpty()) {
            Medicine m = Medicine.builder()
                    .name(name)
                    .genericName(genericName)
                    .code(code)
                    .category(category)
                    .strength(strength)
                    .unit(unit)
                    .build();
            setAudit(m);
            return medicineRepository.save(m);
        }
        return list.get(0);
    }

    private void getOrCreateInventory(HealthCenter healthCenter, Medicine medicine, int quantity, String batchNumber, int reorderLevel) {
        List<Inventory> list = entityManager.createQuery("SELECT i FROM Inventory i WHERE i.healthCenter.id = :hcId AND i.medicine.id = :medId AND i.batchNumber = :batchNumber", Inventory.class)
                .setParameter("hcId", healthCenter.getId())
                .setParameter("medId", medicine.getId())
                .setParameter("batchNumber", batchNumber)
                .getResultList();
        if (list.isEmpty()) {
            Inventory inv = Inventory.builder()
                    .healthCenter(healthCenter)
                    .medicine(medicine)
                    .quantity(quantity)
                    .batchNumber(batchNumber)
                    .expiryDate(Instant.now().plus(365, ChronoUnit.DAYS))
                    .reorderLevel(reorderLevel)
                    .build();
            setAudit(inv);
            inventoryRepository.save(inv);
        }
    }

    private Patient getOrCreatePatient(String patientId, String mrn, String fullName, int age, String gender, LocalDate dob, String bloodGroup, String mobile, String address, District district, HealthCenter healthCenter) {
        List<Patient> list = entityManager.createQuery("SELECT p FROM Patient p WHERE p.patientId = :patientId", Patient.class)
                .setParameter("patientId", patientId)
                .getResultList();
        if (list.isEmpty()) {
            PatientEmergencyContact contact = PatientEmergencyContact.builder()
                    .contactName("Sunita Verma")
                    .relationship("Spouse")
                    .phoneNumber("+919876543210")
                    .build();
            setAudit(contact);
            entityManager.persist(contact);

            Patient p = Patient.builder()
                    .patientId(patientId)
                    .medicalRecordNumber(mrn)
                    .fullName(fullName)
                    .age(age)
                    .gender(gender)
                    .dateOfBirth(dob)
                    .bloodGroup(bloodGroup)
                    .mobileNumber(mobile)
                    .address(address)
                    .status("ACTIVE")
                    .district(district)
                    .healthCenter(healthCenter)
                    .emergencyContact(contact)
                    .build();
            setAudit(p);
            return patientRepository.save(p);
        }
        return list.get(0);
    }

    private DiseaseCategory getOrCreateDiseaseCategory(String code, String name, String description, int priority, boolean communicable, boolean seasonal) {
        List<DiseaseCategory> list = entityManager.createQuery("SELECT dc FROM DiseaseCategory dc WHERE dc.code = :code", DiseaseCategory.class)
                .setParameter("code", code)
                .getResultList();
        if (list.isEmpty()) {
            DiseaseCategory dc = DiseaseCategory.builder()
                    .code(code)
                    .name(name)
                    .description(description)
                    .priority(priority)
                    .communicable(communicable)
                    .seasonal(seasonal)
                    .build();
            setAudit(dc);
            return diseaseCategoryRepository.save(dc);
        }
        return list.get(0);
    }

    private DiagnosticTest getOrCreateDiagnosticTest(String name, String code, String description, String normalRange, BigDecimal cost, String department, int duration) {
        List<DiagnosticTest> list = entityManager.createQuery("SELECT dt FROM DiagnosticTest dt WHERE dt.code = :code", DiagnosticTest.class)
                .setParameter("code", code)
                .getResultList();
        if (list.isEmpty()) {
            DiagnosticTest dt = DiagnosticTest.builder()
                    .testName(name)
                    .code(code)
                    .description(description)
                    .normalRange(normalRange)
                    .baseCost(cost)
                    .department(department)
                    .duration(duration)
                    .isAvailable(true)
                    .build();
            setAudit(dt);
            return diagnosticTestRepository.save(dt);
        }
        return list.get(0);
    }

    private void getOrCreateLaboratory(String name, HealthCenter healthCenter, String status, String workingHours, int equipmentCount) {
        List<Laboratory> list = entityManager.createQuery("SELECT l FROM Laboratory l WHERE l.name = :name AND l.healthCenter.id = :hcId", Laboratory.class)
                .setParameter("name", name)
                .setParameter("hcId", healthCenter.getId())
                .getResultList();
        if (list.isEmpty()) {
            Laboratory l = Laboratory.builder()
                    .name(name)
                    .healthCenter(healthCenter)
                    .status(status)
                    .workingHours(workingHours)
                    .equipmentCount(equipmentCount)
                    .build();
            setAudit(l);
            laboratoryRepository.save(l);
        }
    }

    private void getOrCreateNotification(String message, String type, HealthCenter healthCenter) {
        List<Notification> list = entityManager.createQuery("SELECT n FROM Notification n WHERE n.message = :message AND n.healthCenter.id = :hcId", Notification.class)
                .setParameter("message", message)
                .setParameter("hcId", healthCenter.getId())
                .getResultList();
        if (list.isEmpty()) {
            Notification n = Notification.builder()
                    .message(message)
                    .type(type)
                    .status("SENT")
                    .healthCenter(healthCenter)
                    .build();
            setAudit(n);
            notificationRepository.save(n);
        }
    }

    private void setAudit(com.healthsync.common.BaseAuditEntity entity) {
        entity.setCreatedBy("SYSTEM");
        entity.setCreatedDate(Instant.now());
        entity.setUpdatedBy("SYSTEM");
        entity.setUpdatedDate(Instant.now());
    }
}
