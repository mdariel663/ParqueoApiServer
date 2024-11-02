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


CREATE PROCEDURE apiParqueo.GetParkingSpaceById(IN parking_space_id VARCHAR(64))
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

    -- Si ya existe, genera un error
    IF existing_vehicle_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La matrícula ya está registrada.';
    END IF;

    -- Si no existe, se inserta el nuevo vehículo
    INSERT INTO vehicles (make, model, plate, created_at, updated_at)
    VALUES (vehicle_make, vehicle_model, vehicle_plate, NOW(), NOW());


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

CREATE PROCEDURE IF NOT EXISTS apiParqueo.DeleteReservation(
    IN reservation_id VARCHAR(64)
)
BEGIN
    DECLARE parking_space_id VARCHAR(64);
    DECLARE vehicle_id VARCHAR(64);

    SELECT parking_space_id, vehicle_id INTO parking_space_id, vehicle_id
    FROM reservations
    WHERE id = reservation_id;

    DELETE FROM reservations
    WHERE id = reservation_id;

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

-- Crear la tabla de movimientos de vehículos
CREATE TABLE IF NOT EXISTS vehicle_movements (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    vehicle_id VARCHAR(20) NOT NULL,
    parking_space_id VARCHAR(64) NOT NULL,
    action ENUM('entrada', 'salida') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(plate) ON DELETE CASCADE,
    FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE
);

-- Crear procedimiento para registrar la entrada de un vehículo
CREATE PROCEDURE IF NOT EXISTS apiParqueo.RegisterVehicleEntry(
    IN movement_id VARCHAR(64),
    IN vehicle_plate VARCHAR(20),
    IN parking_space_id VARCHAR(64)
)
BEGIN
    DECLARE vehicle_exists BOOLEAN;

    -- Verificar si el vehículo existe
    SELECT COUNT(*) > 0 INTO vehicle_exists
    FROM vehicles
    WHERE plate = vehicle_plate;

    -- Si el vehículo no existe, se genera un error
    IF NOT vehicle_exists THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El vehículo no existe.';
    END IF;

    -- Insertar el movimiento de entrada
    INSERT INTO vehicle_movements (id, vehicle_id, parking_space_id, action)
    VALUES (movement_id, vehicle_plate, parking_space_id, 'entrada');

    -- Actualizar el estado del espacio de estacionamiento
    UPDATE parking_spaces
    SET is_available = FALSE, vehicle_id = vehicle_plate, updated_at = NOW()
    WHERE id = parking_space_id;
END $$

-- Crear procedimiento para registrar la salida de un vehículo
CREATE PROCEDURE IF NOT EXISTS apiParqueo.RegisterVehicleExit(
    IN movement_id VARCHAR(64),
    IN vehicle_plate VARCHAR(20),
    IN parking_space_id VARCHAR(64)
)
BEGIN
    DECLARE vehicle_exists BOOLEAN;
    DECLARE vehicle_in_space BOOLEAN;

    -- Verificar si el vehículo existe
    SELECT COUNT(*) > 0 INTO vehicle_exists
    FROM vehicles
    WHERE plate = vehicle_plate;

    -- Si el vehículo no existe, se genera un error
    IF NOT vehicle_exists THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El vehículo no existe.';
    END IF;

    -- Verificar si el vehículo está en el espacio de estacionamiento
    SELECT COUNT(*) > 0 INTO vehicle_in_space
    FROM vehicle_movements
    WHERE vehicle_id = vehicle_plate
    AND parking_space_id = parking_space_id
    AND action = 'entrada'
    ORDER BY timestamp DESC LIMIT 1;

    -- Si el vehículo no está en el espacio, se genera un error
    IF NOT vehicle_in_space THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El vehículo no está en el espacio indicado.';
    END IF;

    -- Insertar el movimiento de salida
    INSERT INTO vehicle_movements (id, vehicle_id, parking_space_id, action)
    VALUES (movement_id, vehicle_plate, parking_space_id, 'salida');

    -- Actualizar el estado del espacio de estacionamiento
    UPDATE parking_spaces
    SET is_available = TRUE, vehicle_id = NULL, updated_at = NOW()
    WHERE id = parking_space_id;
END $$

-- Crear procedimiento para obtener todos los movimientos de vehículos
CREATE PROCEDURE IF NOT EXISTS apiParqueo.GetVehicleMovements()
BEGIN
    SELECT 
        vm.id AS movement_id,
        vm.vehicle_id,
        vm.parking_space_id,
        vm.action,
        vm.timestamp,
        vm.created_at,
        vm.updated_at
    FROM 
        vehicle_movements vm
    ORDER BY 
        vm.timestamp DESC;
END $$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS apiParqueo.IsVehicleInParking(
    IN vehicle_plate VARCHAR(20),
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
BEGIN
    DECLARE vehicle_in_parking BOOLEAN;

    -- Verificar si el vehículo está en el parking dentro del rango de tiempo
    SELECT COUNT(*) > 0 INTO vehicle_in_parking
    FROM vehicle_movements vm
    WHERE vm.vehicle_id = vehicle_plate
    AND vm.action = 'entrada'
    AND EXISTS (
        SELECT 1 FROM vehicle_movements vm_exit
        WHERE vm_exit.vehicle_id = vm.vehicle_id
        AND vm_exit.parking_space_id = vm.parking_space_id
        AND vm_exit.action = 'salida'
        AND vm_exit.timestamp > vm.timestamp
        AND vm_exit.timestamp < end_time
    )
    AND vm.timestamp < end_time;

    -- Devolver el resultado
    IF vehicle_in_parking THEN
        SELECT 'El vehículo está en el parking durante el rango de tiempo especificado.' AS message;
    ELSE
        SELECT 'El vehículo NO está en el parking durante el rango de tiempo especificado.' AS message;
    END IF;

END $$



CREATE PROCEDURE IF NOT EXISTS apiParqueo.UpdateParkingSpaceInfo(
    IN old_parking_space_id VARCHAR(64),
    IN new_parking_space_id VARCHAR(64),
    IN is_available BOOLEAN
)
BEGIN
    DECLARE reservation_count INT;

    -- Contar las reservas asociadas al antiguo espacio de estacionamiento
    SELECT COUNT(*) INTO reservation_count
    FROM reservations
    WHERE parking_space_id = old_parking_space_id;

    -- Si hay reservas, puedes decidir cómo proceder
    IF reservation_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede actualizar el espacio de estacionamiento porque tiene reservas asociadas.';
    ELSE
        -- Actualizar el ID del espacio de estacionamiento y su disponibilidad
        UPDATE parking_spaces
        SET id = new_parking_space_id, 
            is_available = is_available, 
            updated_at = NOW()
        WHERE id = old_parking_space_id;
    END IF;
END $$


DELIMITER ;
