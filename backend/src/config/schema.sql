CREATE DATABASE IF NOT EXISTS hack_horizon;
USE hack_horizon;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    date_of_birth DATETIME,
    
    age INT,
    sex VARCHAR(50),
    blood_group VARCHAR(10),
    height FLOAT,
    weight FLOAT,
    hr INT,
    bp VARCHAR(50),
    resp_rate INT,
    spo2 INT,
    steps_goal INT,
    sleep_goal FLOAT,
    activity_level VARCHAR(50),
    water_intake_goal FLOAT,
    primary_concerns TEXT,
    family_history TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hospital VARCHAR(255) NOT NULL,
    license_number VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    doctor_name VARCHAR(255),
    hospital_name VARCHAR(255),
    examine_area VARCHAR(255),
    location VARCHAR(255),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prescription (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL,
    instructions TEXT,
    FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medication (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT,
    patient_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_url VARCHAR(1024),
    document_type VARCHAR(255) NOT NULL,
    extracted_data JSON,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qrtoken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    access_type VARCHAR(255) NOT NULL,
    allowed_sections VARCHAR(255) NOT NULL,
    selected_report_ids VARCHAR(255),
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES user(id) ON DELETE CASCADE
);
