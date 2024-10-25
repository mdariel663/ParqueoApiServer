

-- Generando db
CREATE DATABASE IF NOT EXISTS apiParqueo;

-- creando usuario
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON apiParqueo.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;


USE apiParqueo;
-- creando usuarios
-- Generando la base de datos
CREATE DATABASE IF NOT EXISTS apiParqueo;

-- Creando el usuario
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON apiParqueo.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;

USE apiParqueo;

-- Creando la tabla de usuarios
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

-- Creando la tabla de vehículos
CREATE TABLE vehicles (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plate VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Creando la tabla de espacios de aparcamiento
CREATE TABLE parking_spaces (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    vehicle_id VARCHAR(64), -- Relación con la tabla vehicles
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Creando la tabla de reservaciones
CREATE TABLE reservations (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    parking_space_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(64) NOT NULL, -- Relación con la tabla vehicles
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

DELIMITER $$

-- Procedimiento para comprobar espacios disponibles
CREATE PROCEDURE CheckAvailableSpaces(
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
    LIMIT 1;  -- Solo devolver una plaza disponible
END $$

-- Procedimiento para agregar una reservación
CREATE PROCEDURE AddReservation(
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
    
    -- Actualizar la disponibilidad del espacio de aparcamiento
    UPDATE parking_spaces
    SET is_available = FALSE, vehicle_id = vehicle_id, updated_at = NOW()
    WHERE id = parking_space_id;
END $$

-- Procedimiento para obtener la ocupación del parqueo

DELIMITER $$

CREATE PROCEDURE GetParkingOccupancy()
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

DELIMITER ;

-- Procedimiento para eliminar una reservación
CREATE PROCEDURE DeleteReservation(
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
        AND (start_time > NOW() OR end_time > NOW()) -- Solo verificar futuras o actuales reservas
    ) THEN
        UPDATE parking_spaces
        SET is_available = TRUE, vehicle_id = NULL, updated_at = NOW()
        WHERE id = parking_space_id;
    END IF;

END $$

DELIMITER ;

-- Datos de prueba para la base de datos
INSERT INTO users (id, name, email, password, role, created_at, updated_at) 
VALUES 
    ('06fccc91-9353-40ae-a76f-c0b120e980f4', 'Mario', 'mario@gmail.com', '0123456789', 'admin', NOW(), NOW()),
    ('4a7d5f94-89d2-11ef-9f1a-c4e9840e5334', 'Ana', 'ana@gmail.com', 'password123', 'empleado', NOW(), NOW()),
    ('4a7d5f94-89d2-11ef-9f1a-c4e9840e5335', 'Luis', 'luis@gmail.com', 'secret123', 'cliente', NOW(), NOW());

INSERT INTO vehicles (id, make, model, plate, created_at, updated_at) 
VALUES 
    ('vehicle-1', 'Toyota', 'Corolla', 'XYZ123', NOW(), NOW()),
    ('vehicle-2', 'Honda', 'Civic', 'ABC456', NOW(), NOW());

INSERT INTO parking_spaces (id, vehicle_id, is_available, created_at, updated_at) 
VALUES 
    ('space-1', NULL, TRUE, NOW(), NOW()),
    ('space-2', NULL, TRUE, NOW(), NOW()),
    ('space-3', 'vehicle-1', FALSE, NOW(), NOW());  -- Este espacio está reservado


INSERT INTO reservations (id, user_id, parking_space_id, vehicle_id, start_time, end_time, created_at, updated_at)
VALUES 
    ('reservation-1', '4a7d5f94-89d2-11ef-9f1a-c4e9840e5335', 'space-3', 'vehicle-1', '2024-10-13 22:30:00', '2024-10-13 23:30:00', NOW(), NOW());
