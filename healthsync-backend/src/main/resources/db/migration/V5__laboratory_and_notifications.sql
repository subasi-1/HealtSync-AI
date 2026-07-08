-- Flyway Database Migration V5
-- Schema refinements for the Laboratory and Smart Notification Modules

-- 1. Refine laboratories table
ALTER TABLE laboratories ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE laboratories ADD COLUMN working_hours VARCHAR(50) NOT NULL DEFAULT '08:00 - 17:00';
ALTER TABLE laboratories ADD COLUMN equipment_count INT NOT NULL DEFAULT 5;

-- 2. Refine diagnostic_tests table
ALTER TABLE diagnostic_tests ADD COLUMN department VARCHAR(100) NOT NULL DEFAULT 'General';
ALTER TABLE diagnostic_tests ADD COLUMN duration INT NOT NULL DEFAULT 30;
ALTER TABLE diagnostic_tests ADD COLUMN is_available BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Create test_bookings table
CREATE TABLE test_bookings (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    diagnostic_test_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_test_bookings_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_test_bookings_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_test_bookings_test FOREIGN KEY (diagnostic_test_id) REFERENCES diagnostic_tests(id)
);

CREATE INDEX idx_test_bookings_patient ON test_bookings(patient_id);
CREATE INDEX idx_test_bookings_date ON test_bookings(booking_date);

-- 4. Create test_results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    result VARCHAR(255) NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
    remarks VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_test_results_booking FOREIGN KEY (booking_id) REFERENCES test_bookings(id) ON DELETE CASCADE
);

-- 6. Create notification_preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uc_user_pref UNIQUE (user_id, notification_type, channel),
    CONSTRAINT fk_notification_prefs_user FOREIGN KEY (user_id) REFERENCES users(id)
);
