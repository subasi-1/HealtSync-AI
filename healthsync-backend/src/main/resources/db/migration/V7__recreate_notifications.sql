-- Flyway Database Migration V7
-- Drop and recreate notifications table to match Notification.java entity fields

DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    health_center_id UUID,
    user_id UUID,
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_notifications_center FOREIGN KEY (health_center_id) REFERENCES health_centers(id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
