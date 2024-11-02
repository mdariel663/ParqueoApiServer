import { UUID } from "crypto";
import { Request, Response } from "express";
import FechaModel from "../models/Parking/FechaModel";
import VehiculoModel, { VehiculoPrimitives } from "../models/Parking/VehiculesModel";
import UserLogged from "../models/User/UserInterface";
import UserModel from "../models/User/UserModel";
import ParkingService from "../services/ParkingService";
import ReservaService from "../services/ReservaService";
import ErrorHandler from "./HandleErrors";
import LoggerController, { defaultEntryLog } from "./LoggerController";
import { validateFields } from "./Utils";
import ParkingModelError from "../models/Errors/ParkingModelError";
import UserModelErrorAuth from "../models/Errors/UserModelError";
import { databaseRepository } from "./controllers";

export default class ReservaController {

    static async updateReserva(req: Request, res: Response): Promise<Response> {
        const { reservationId } = req.params as { reservationId: string };
        const { currentUserId, vehicleDetails, startTime, endTime } = req.body as unknown as {
            currentUserId: UUID;
            vehicleDetails: VehiculoPrimitives;
            startTime: string;
            endTime: string;
        };

        try {
            const errMessage = validateFields({ vehicleDetails, startTime, endTime });
            if (errMessage !== null) {
                throw new ParkingModelError(errMessage);
            }

            const userModel = new UserModel(databaseRepository);
            const currentUser = await userModel.getCurrentUser(currentUserId);

            if (!currentUser) {
                throw new UserModelErrorAuth('Usuario no autenticado');
            }

            const vehiculo = new VehiculoModel(vehicleDetails);
            const startDate = new FechaModel(startTime);
            const endDate = new FechaModel(endTime);

            if (!vehiculo.isValid) {
                throw new ParkingModelError('Datos del vehiculo no válidos');
            } else if (!startDate.isValid || !endDate.isValid) {
                throw new ParkingModelError('Datos de fecha no válidos');
            } else if (startDate.fecha >= endDate.fecha) {
                throw new ParkingModelError('La fecha de inicio debe ser anterior a la de terminación');
            }

            const reservasService = new ReservaService(databaseRepository);
            const result = await reservasService.updateReserva(reservationId, vehiculo, startDate, endDate); // Assuming this method exists

            if (result === null || result.success === false) {
                throw new ParkingModelError(result?.message ?? 'No se pudo actualizar la reserva');
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Reserva actualizada exitosamente",
                action: "Actualizar Reserva",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    reservationId: reservationId,
                    action: "Actualizar Reserva",
                    description: "Se actualizó una reserva"
                }
            });

            return res.status(200).send({
                success: true,
                message: 'Reserva actualizada exitosamente',
                details: result
            });
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo actualizar la reserva",
                action: "Actualizar Reserva",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    reservationId: reservationId,
                    action: "Actualizar Reserva",
                    description: "No se pudo actualizar la reserva"
                }
            });
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500);
        }
    }

    static async createReserva(req: Request, res: Response): Promise<Response> {
        try {
            const { parkingSpaceId, userId, currentUserId, vehicleDetails, startTime, endTime } = req.body as unknown as {
                parkingSpaceId: string | undefined;
                userId: UUID | undefined;
                currentUserId: UUID;
                vehicleDetails: VehiculoPrimitives;
                startTime: string;
                endTime: string;
            }

            const errMessage = validateFields({ vehicleDetails, startTime, endTime });
            if (errMessage !== null) {
                throw new ParkingModelError(errMessage);
            }

            const user = new UserModel(databaseRepository);
            const currentUser = await user.getCurrentUser(currentUserId);


            if (!currentUser) {
                throw new UserModelErrorAuth('Usuario no autenticado');
            }

            const isAdmin = currentUser.role === 'admin';
            const isUserIdBlank = userId === undefined || userId === null;

            if (!isAdmin && !isUserIdBlank && currentUserId !== userId) {
                throw new ParkingModelError('No se puede reservar una plaza de aparcamiento para otro usuario');
            }

            const vehiculo = new VehiculoModel(vehicleDetails);
            const startDate = new FechaModel(startTime);
            const endDate = new FechaModel(endTime);

            if (!vehiculo.isValid) {
                throw new ParkingModelError('Datos del vehiculo no válidos');
            } else if (!startDate.isValid || !endDate.isValid) {
                throw new ParkingModelError('Datos de fecha no válidos');
            } else if (startDate.fecha >= endDate.fecha) {
                throw new ParkingModelError('La fecha de inicio debe ser anterior a la de terminación');
            }

            const parkingService = new ParkingService(currentUserId, databaseRepository);
            const result = await parkingService.reservarPlaza(vehiculo, startDate, endDate, parkingSpaceId);

            if (result === null) {
                throw new ParkingModelError('No se pudo procesar la reserva');
            }
            if (result.success) {
                const dataReserva = {
                    parking_space_id: result.detalles.parking_space_id,
                    vehicleData: result.detalles.vehiculo ?? null
                }
                LoggerController.sendReserva(userId as string, dataReserva, true)
            }

            return res.status(200).send(result);
        } catch (error: unknown) {
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500);
        }
    }
    static async getReservas(req: Request, res: Response): Promise<Response> {

        const { currentUserId } = req.body as { currentUserId: UUID }
        try {
            const userModel: UserModel = new UserModel(databaseRepository)
            const currentUser: UserLogged | null = await userModel.getCurrentUser(currentUserId)

            if (currentUser === null) {
                throw new UserModelErrorAuth('Usuario actual no encontrado');
            }

            if (currentUser.role !== 'empleado' && currentUser.role !== 'admin') {
                throw new UserModelErrorAuth('No tienes permisos para acceder a esta información')
            }

            const reservasService = new ReservaService(databaseRepository);
            const reservas = await reservasService.getAllReservas();


            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Reservas obtenidas exitosamente",
                action: "Obtener Reservas",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reservas",
                    description: "Reservas obtenidas exitosamente"
                }
            })

            return res.status(200).send({
                success: true,
                message: 'Reservas obtenidas exitosamente',
                details: reservas
            });
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo obtener las reservas",
                action: "Obtener Reservas",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reservas",
                    description: "No se pudo obtener las reservas"
                }
            })
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500);
        }
    }
    static async deleteReserva(req: Request, res: Response): Promise<Response | undefined> {
        const { reservationId } = req.params as { reservationId: string }
        const { currentUserId } = req.body as { currentUserId: string }

        try {
            if (reservationId === undefined) {
                throw new ParkingModelError('Datos de reserva no proporcionados')
            }

            const reservasService = new ReservaService(databaseRepository)
            const result = await reservasService.eliminarReserva(reservationId)


            if (result === null || result?.success === false) {
                throw new ParkingModelError(result?.message ?? 'No se pudo eliminar la reserva');
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Reserva eliminada exitosamente",
                action: "Eliminar Reserva",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    reservationId: reservationId,
                    action: "Eliminar Reserva",
                    description: "Se intento eliminar una reserva"
                }
            })

            return res.status(200).send({
                success: true,
                message: 'Reserva eliminada exitosamente'
            })
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo eliminar la reserva",
                action: "Eliminar Reserva",
                resource: "reserva",
                details: {
                    userId: currentUserId,
                    action: "Eliminar Reserva",
                    description: "No se pudo eliminar la reserva"
                }
            })
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500)
        }
    }
}