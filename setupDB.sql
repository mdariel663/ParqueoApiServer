DROP DATABASE IF EXISTS apiParqueo;

CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON apiParqueo.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS apiParqueo;
USE apiParqueo;

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(12) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'empleado', 'cliente') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plate VARCHAR(20)  PRIMARY KEY NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE parking_spaces (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    vehicle_id VARCHAR(64), 
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(plate) ON DELETE SET NULL
);

CREATE TABLE reservations (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    parking_space_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(64) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(plate) ON DELETE CASCADE
);

DELIMITER $$
CREATE PROCEDURE apiParqueo.CheckAvailableSpaces(
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
BEGIN
    SELECT ps.id
    FROM parking_spaces ps
    WHERE ps.is_available = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.parking_space_id = ps.id
        AND (r.start_time < end_time AND r.end_time > start_time)
    )
    LIMIT 1;
END $$

DELIMITER $$
CREATE PROCEDURE apiParqueo.AddReservation(
    IN reservation_id VARCHAR(64),
    IN user_id VARCHAR(64),
    IN parking_space_id VARCHAR(64),
    IN vehicle_id VARCHAR(64),
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
BEGIN
    INSERT INTO reservations (id, user_id, parking_space_id, vehicle_id, start_time, end_time, created_at, updated_at)
    VALUES (reservation_id, user_id, parking_space_id, vehicle_id, start_time, end_time, NOW(), NOW());
    UPDATE parking_spaces
    SET is_available = FALSE, vehicle_id = vehicle_id, updated_at = NOW()
    WHERE id = parking_space_id;
END $$

DELIMITER $$

CREATE PROCEDURE apiParqueo.GetParkingOccupancy()
BEGIN
    SELECT 
        ps.id AS parking_space_id,
        ps.is_available,
        v.id AS vehicle_id,
        v.make,
        v.model,
        v.plate,
        COUNT(r.id) AS reservations_count
    FROM 
        parking_spaces ps
    LEFT JOIN 
        vehicles v ON ps.vehicle_id = v.id
    LEFT JOIN 
        reservations r ON ps.id = r.parking_space_id
        AND (r.start_time <= NOW() AND r.end_time >= NOW()) -- Reservas activas
    GROUP BY 
        ps.id, ps.is_available, v.id;
END $$

DELIMITER $$

CREATE PROCEDURE apiParqueo.DeleteReservation(
    IN reservation_id VARCHAR(64),
    IN user_id VARCHAR(64)
)
BEGIN
    DECLARE parking_space_id VARCHAR(64);
    DECLARE vehicle_id VARCHAR(64);

    SELECT parking_space_id, vehicle_id INTO parking_space_id, vehicle_id
    FROM reservations
    WHERE id = reservation_id;

    DELETE FROM reservations
    WHERE id = reservation_id AND user_id = user_id;

    IF NOT EXISTS (
        SELECT 1 FROM reservations
        WHERE parking_space_id = parking_space_id
        AND (start_time > NOW() OR end_time > NOW())
    ) THEN
        UPDATE parking_spaces
        SET is_available = TRUE, vehicle_id = NULL, updated_at = NOW()
        WHERE id = parking_space_id;
    END IF;

END $$