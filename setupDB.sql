DROP DATABASE IF EXISTS apiParqueo;

CREATE USER IF NOT EXISTS 'api_user'@'localhost' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON apiParqueo.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS apiParqueo;
USE apiParqueo;

CREATE TABLE IF NOT EXISTS users (
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
CREATE PROCEDURE IF NOT EXISTS apiParqueo.CheckAvailableSpaces(
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


CREATE PROCEDURE IF NOT EXISTS apiParqueo.GetFutureReservationsForParkingSpace(
    IN parking_space_id VARCHAR(64)
)
BEGIN
    SELECT 
        r.id AS reservation_id,
        r.user_id,
        r.vehicle_id,
        r.start_time,
        r.end_time,
        r.created_at,
        r.updated_at
    FROM 
        reservations r
    WHERE 
        r.parking_space_id = parking_space_id
        AND r.start_time >= NOW() -- Solo reservas futuras o activas
    ORDER BY 
        r.start_time; -- Opcional: ordenar por tiempo de inicio
END $$


CREATE PROCEDURE IF NOT EXISTS apiParqueo.GetAvailableSpacesInFuture(
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
BEGIN
    SELECT 
        ps.id AS parking_space_id,
        v.plate AS vehicle_id,
        v.make,
        v.model
    FROM 
        parking_spaces ps
    LEFT JOIN 
        vehicles v ON ps.vehicle_id = v.plate
    WHERE 
        NOT EXISTS (
            SELECT 1 
            FROM reservations r
            WHERE r.parking_space_id = ps.id
            AND (
                r.start_time < end_time AND r.end_time > start_time
            )
        );
END $$


CREATE PROCEDURE apiParqueo.GetParkingSpaces()
BEGIN
    SELECT  
        ps.id AS parking_space_id,
        ps.is_available,
        v.plate AS vehicle_id,
        v.make,
        v.model,
        COUNT(r.id) AS reservations_count
    FROM 
        parking_spaces ps
    LEFT JOIN 
        vehicles v ON ps.vehicle_id = v.plate
    LEFT JOIN 
        reservations r ON ps.id = r.parking_space_id
    GROUP BY 
        ps.id, ps.is_available, v.plate;
END $$


CREATE PROCEDURE apiParqueo.GetParkingSpaceById(IN parking_space_id INT)
BEGIN
    SELECT  
        ps.id AS parking_space_id,
        ps.is_available,
        v.plate AS vehicle_id,
        v.make,
        v.model,
        COUNT(r.id) AS reservations_count
    FROM 
        parking_spaces ps
    LEFT JOIN 
        vehicles v ON ps.vehicle_id = v.plate
    LEFT JOIN 
        reservations r ON ps.id = r.parking_space_id
    WHERE 
        ps.id = parking_space_id
    GROUP BY 
        ps.id, ps.is_available, v.plate;
END $$


CREATE PROCEDURE IF NOT EXISTS apiParqueo.AddReservation(
    IN reservation_id VARCHAR(64),
    IN user_id VARCHAR(64),
    IN parking_space_id VARCHAR(64),
    IN vehicle_json JSON,
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
BEGIN
    DECLARE available_space_count INT DEFAULT 0;
    DECLARE existing_vehicle_id VARCHAR(20);
    DECLARE vehicle_make VARCHAR(100);
    DECLARE vehicle_model VARCHAR(100);
    DECLARE vehicle_plate VARCHAR(20);
    DECLARE has_prior_reservations BOOLEAN DEFAULT FALSE;

    -- Extraer datos del JSON
    SET vehicle_make = JSON_UNQUOTE(JSON_EXTRACT(vehicle_json, '$.make'));
    SET vehicle_model = JSON_UNQUOTE(JSON_EXTRACT(vehicle_json, '$.model'));
    SET vehicle_plate = JSON_UNQUOTE(JSON_EXTRACT(vehicle_json, '$.plate'));

    -- Verifica si el vehículo ya existe
    SELECT plate INTO existing_vehicle_id
    FROM vehicles
    WHERE plate = vehicle_plate;

    -- Si no existe, se inserta el nuevo vehículo
    IF existing_vehicle_id IS NULL THEN
        INSERT INTO vehicles (make, model, plate, created_at, updated_at)
        VALUES (vehicle_make, vehicle_model, vehicle_plate, NOW(), NOW());
    END IF;

    -- Verifica que la hora de inicio no esté en el pasado
    IF start_time < NOW() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pueden hacer reservas en el pasado.';
    END IF;

    -- Verifica si el espacio de estacionamiento está disponible para el período solicitado, sin afectar el estado actual
    SELECT COUNT(*) INTO available_space_count
    FROM parking_spaces ps
    WHERE ps.id = parking_space_id
    AND NOT EXISTS (
        SELECT 1 
        FROM reservations r
        WHERE r.parking_space_id = ps.id
        AND (r.start_time < end_time AND r.end_time > start_time)
    );

    -- Verifica si existen reservas anteriores en el mismo espacio
    SELECT EXISTS (
        SELECT 1 FROM reservations
        WHERE parking_space_id = parking_space_id
        AND end_time < start_time
    ) INTO has_prior_reservations;

    -- Si hay un espacio disponible para el futuro, realiza la reserva
    IF available_space_count > 0 THEN
        INSERT INTO reservations (id, user_id, parking_space_id, vehicle_id, start_time, end_time, created_at, updated_at)
        VALUES (reservation_id, user_id, parking_space_id, vehicle_plate, start_time, end_time, NOW(), NOW());

        -- Si no hay reservas anteriores, marca el espacio como no disponible actualmente
        IF has_prior_reservations = FALSE THEN
            UPDATE parking_spaces
            SET is_available = FALSE, vehicle_id = vehicle_plate, updated_at = NOW()
            WHERE id = parking_space_id;
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay espacios disponibles para la reserva solicitada en el período indicado.';
    END IF;
END $$

CREATE PROCEDURE IF NOT EXISTS apiParqueo.GetParkingOccupancy()
BEGIN
    SELECT 
        ps.id AS parking_space_id,
        ps.is_available,
        v.plate AS vehicle_id,
        v.make,
        v.model,
        COUNT(r.id) AS reservations_count
    FROM 
        parking_spaces ps
    LEFT JOIN 
        vehicles v ON ps.vehicle_id = v.plate
    LEFT JOIN 
        reservations r ON ps.id = r.parking_space_id
    GROUP BY 
        ps.id, ps.is_available, v.plate;
END $$


CREATE PROCEDURE IF NOT EXISTS apiParqueo.DeleteReservation(
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

DELIMITER ;
