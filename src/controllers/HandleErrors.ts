import { Response } from 'express';

enum ErrorCode {
    TOKEN_NOT_FOUND,
    TOKEN_INVALID,
    USER_NOT_ADMIN,
    PARKING_NOT_FOUND,
    PARKING_RESERVATION_NOT_FOUND,
    PARKING_RESERVATION_ALREADY_EXISTS,
    PARKING_RESERVATION_EXPIRED,
    PARKING_RESERVATION_CANCELLED,
    PARKING_RESERVATION_RESERVED,
    PARKING_SpaceParking_OCCUPIED,
    PARKING_SpaceParking_RESERVED,
    VEHICULE_DETAILS_NOT_FOUND,
    VEHICULE_DETAILS_INVALID,
    FECHA_INICIO_INVALID,
    FECHA_FINAL_INVALID,
    FECHA_INICIO_FINAL_INVALID,
    PARKING_SpaceParking_NOT_AVAILABLE,
    PARKING_SpaceParking_RESERVATION_NOT_FOUND,
    PARKING_SpaceParking_RESERVATION_EXPIRED,
    PARKING_SpaceParking_RESERVATION_CANCELLED,
    PARKING_SpaceParking_RESERVATION_NOT_CANCELLED,
    PARKING_SpaceParking_RESERVATION_NOT_RESERVED,
    PARKING_SpaceParking_RESERVATION_RESERVED,
    
}


const ErrorMessages: Record<ErrorCode, string> = {
    [ErrorCode.TOKEN_NOT_FOUND]: "Usuario no autenticado",
    [ErrorCode.TOKEN_INVALID]: "Token inválido o expirado",
    [ErrorCode.USER_NOT_ADMIN]: "Usuario no es administrador",
    [ErrorCode.PARKING_NOT_FOUND]: "Parking no encontrado", 
    [ErrorCode.PARKING_RESERVATION_ALREADY_EXISTS]: "La reserva ya existe",
    [ErrorCode.PARKING_RESERVATION_NOT_FOUND]: "Reserva no encontrada",     
    [ErrorCode.PARKING_RESERVATION_EXPIRED]: "La reserva ha expirado",
    [ErrorCode.PARKING_RESERVATION_CANCELLED]: "La reserva ha sido cancelada",
    [ErrorCode.PARKING_RESERVATION_RESERVED]: "La reserva ha sido reservada",
    [ErrorCode.PARKING_SpaceParking_OCCUPIED]: "Plaza ocupada",
    [ErrorCode.PARKING_SpaceParking_RESERVED]: "Plaza reservada",
    [ErrorCode.VEHICULE_DETAILS_NOT_FOUND]: "Datos de vehiculo no encontrados",
    [ErrorCode.VEHICULE_DETAILS_INVALID]: "Datos de vehiculo no validos",
    [ErrorCode.FECHA_INICIO_INVALID]: "Fecha de inicio no valido",
    [ErrorCode.FECHA_FINAL_INVALID]: "Fecha de final no valido",
    [ErrorCode.FECHA_INICIO_FINAL_INVALID]: "Fecha de inicio no valido",
    [ErrorCode.PARKING_SpaceParking_NOT_AVAILABLE]: "Plaza no disponible",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_NOT_FOUND]: "Reserva no encontrada",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_EXPIRED]: "Reserva expirada",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_CANCELLED]: "Reserva cancelada",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_NOT_CANCELLED]: "Reserva no cancelada",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_NOT_RESERVED]: "Reserva no reservada",
    [ErrorCode.PARKING_SpaceParking_RESERVATION_RESERVED]: "Reserva reservada",
};

class ErrorHandler {
    static handleError(res: Response, error: string, code = 500) {
        console.error("xyz", error);
        return res.status(code).send({ "message": error , "success": false});
    }
    
    static handleKnownError(res: Response, code: ErrorCode) {
        const message = ErrorMessages[code]; 
        const statusCode = this.getErrorStatusCode(code);
        this.handleError(res, message, statusCode);
    }

    private static getErrorStatusCode(code: ErrorCode): number {
        switch (code) {
            case ErrorCode.TOKEN_NOT_FOUND:
            case ErrorCode.TOKEN_INVALID:
                return 401;
            case ErrorCode.USER_NOT_ADMIN:
                return 403;
            default:
                return 500;
        }
    }
    
}

export { ErrorMessages, ErrorCode, ErrorHandler };
