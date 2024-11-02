import { Request, Response } from "express"
import { validateFields } from "./Utils"

import ParkingModelError from "../models/Errors/ParkingModelError"
import ErrorHandler from "./HandleErrors"
import LoggerController, { defaultEntryLog } from "./LoggerController"
import ParkingService from "../services/ParkingService"
import ParkingModel from "../models/ParkingModel"
import { ParkingSpaceRow } from "../models/Parking/ParkingSpace"
import { databaseRepository } from "./controllers"

export default class ParkingController {
    static getAllSpaces = async (req: Request, res: Response): Promise<Response | void> => {
        const { currentUserId } = req.body as { currentUserId: string }
        try {
            const parkingService = new ParkingService(currentUserId, databaseRepository);
            const parkingSpaces: ParkingSpaceRow[] = await parkingService.getAllSpaces()

            if (parkingSpaces !== null && parkingSpaces.length === 0) {
                throw new ParkingModelError('No hay plazas de aparcamiento')
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Plazas de aparcamiento obtenidas exitosamente",
                action: "Obtener Plazas",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Plazas",
                    description: "Plazas de aparcamiento obtenidas exitosamente"
                }
            })


            return res.status(200).json({
                success: true,
                parkingSpaces: parkingSpaces.map((space) => {
                    return {
                        parking_space_id: space.parking_space_id,
                        is_avaliable: Boolean(space.is_available), // fix a una problema al convertir a boolean
                        reservations_count: space.reservations_count
                    }
                }
                ),
                message: 'Plazas de aparcamiento obtenidas exitosamente'
            })
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo obtener las plazas de aparcamiento",
                action: "Obtener Plazas",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Plazas",
                    description: "No se pudo obtener las plazas de aparcamiento"
                }
            })
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500)
        }
    }

    static getSpaceById = async (req: Request, res: Response): Promise<Response | void> => {
        const { spaceId } = req.params as { spaceId: string }
        const { currentUserId } = req.body as { currentUserId: string }

        try {
            const parkingService = new ParkingService(currentUserId, databaseRepository);

            let detailsParkingSpace: Array<ParkingSpaceRow> | null = null;

            if (spaceId !== undefined) {
                detailsParkingSpace = await parkingService.getParkingSpaceById(spaceId);
                if (detailsParkingSpace === null) {
                    throw new ParkingModelError('No se puede obtener la reserva de la plaza');
                }
            } else {

                detailsParkingSpace = await parkingService.getAllSpaces();

                if (detailsParkingSpace === null) {
                    throw new ParkingModelError('No se puede obtener la reserva de la plaza');
                }
            }


            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Reserva obtenida exitosamente",
                action: "Obtener Reserva",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reserva",
                    description: "Reserva obtenida exitosamente"
                }
            })

            return res.status(200).send({
                success: true,
                message: "Reserva obtenida exitosamente",
                details: detailsParkingSpace,
            });
        } catch (error: unknown) {

            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "Reserva fallida",
                action: "Obtener Reserva",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reserva",
                    description: "Reserva fallida"
                }
            })
            return ErrorHandler.handleError(res, error, "Error interno del servidor", 500);
        }
    }

    static createSpace = async (req: Request, res: Response): Promise<Response | void> => {
        const { spaceId } = req.params as { spaceId: string }
        const { currentUserId } = req.body as { currentUserId: string }

        try {
            const existingSpace = await ParkingModel.getSpaceById(databaseRepository, spaceId)

            if (existingSpace.length > 0) {
                throw new ParkingModelError('Ya existe un parking con el mismo nombre')
            }

            const errMessage = validateFields({ spaceId })

            if (errMessage !== null) {
                throw new ParkingModelError(errMessage)
            }

            const newSpace = await ParkingModel.createSpace(databaseRepository, spaceId)

            if (newSpace === null) {
                throw new ParkingModelError("Hubo un error al crear el Espacio de Almacenamiento")
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Plaza de aparcamiento creada exitosamente",
                action: "Crear Plaza",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Crear Plaza",
                    description: "Plaza de aparcamiento creada exitosamente"
                }
            })

            return res.status(201).json({
                success: true,
                message: 'Plaza de aparcamiento creada exitosamente',
                details: newSpace
            })
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo crear la plaza",
                action: "Crear Plaza",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Crear Plaza",
                    description: "No se pudo crear la plaza"
                }
            })
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500)
        }
    }

    static updateSpace = async (req: Request, res: Response): Promise<Response | void> => {

        const { spaceId } = req.params as { spaceId: string }
        const { new_parking_space_id, is_available } = req.body as { new_parking_space_id: string, is_available: boolean | undefined }

        let spaceDetails = req.body as {
            new_parking_space_id: string, is_available: boolean | undefined
        }
        spaceDetails = { new_parking_space_id: new_parking_space_id, is_available: is_available }
        let { userId, currentUserId } = req.body as { userId: string, currentUserId: string }


        try {

            if (spaceId === undefined || spaceDetails === undefined) {
                throw new ParkingModelError('No se pudo modificar la plaza')
            }
            if (userId === undefined) {
                userId = currentUserId;
            }

            const parkingService = new ParkingService(
                userId,
                databaseRepository
            )

            const result = await parkingService.updateparkingSpace(spaceId, spaceDetails)

            if (!result) {
                throw new ParkingModelError('No se pudo modificar la plaza')
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Plaza de aparcamiento modificada exitosamente",
                action: "Modificar Plaza",
                resource: "parking",
                details: {
                    userId: userId,
                    action: "Modificar Plaza",
                    description: "Plaza de aparcamiento modificada exitosamente"
                }
            })

            return res.status(200).send({
                success: true,
                message: 'Plaza de aparcamiento modificada exitosamente',
                details: result
            })
        } catch (error: unknown) {
            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "No se pudo modificar la plaza",
                action: "Modificar Plaza",
                resource: "parking",
                details: {
                    userId: userId,
                    action: "Modificar Plaza",
                    description: "No se pudo modificar la plaza"
                }
            })
            return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500)
        }
    }
    static async getReservaSpaceById(res: Response, req: Request): Promise<Response | void> {
        const { currentUserId } = req.body as { currentUserId: string }

        try {
            const { parkingSpaceId } = req.params as { parkingSpaceId: string }

            const parkingService = new ParkingService(currentUserId, databaseRepository);
            const detailsParkingSpace = await parkingService.getParkingSpaceById(parkingSpaceId);

            if (detailsParkingSpace === null) {
                throw new ParkingModelError('No se puede obtener la reserva de la plaza');
            }

            LoggerController.sendLog({
                ...defaultEntryLog,
                message: "Reserva obtenida exitosamente",
                action: "Obtener Reserva",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reserva",
                    description: "Reserva obtenida exitosamente"
                }
            })

            return res.status(200).send({
                success: true,
                message: "Reserva obtenida exitosamente",
                details: detailsParkingSpace,
            });
        } catch (error: unknown) {

            LoggerController.sendLog({
                ...defaultEntryLog,
                level: "error",
                message: "Reserva fallida",
                action: "Obtener Reserva",
                resource: "parking",
                details: {
                    userId: currentUserId,
                    action: "Obtener Reserva",
                    description: "Reserva fallida"
                }
            })
            return ErrorHandler.handleError(res, error, "Error interno del servidor", 500);
        }
    }
    static async deleteSpace(req: Request, res: Response): Promise<Response | void> {
        {

            const { spaceId } = req.params
            let { currentUserId } = req.body as { userId: string, currentUserId: string }


            try {
                if (spaceId === undefined) {
                    throw new ParkingModelError('No se pudo eliminar la plaza')
                }
                const parkingService = new ParkingService(
                    currentUserId,
                    databaseRepository
                )
                const result = await parkingService.deleteparkingSpace(spaceId);

                if (result !== null && result === false) {
                    throw new ParkingModelError('No se pudo eliminar la plaza')
                }

                LoggerController.sendLog({
                    ...defaultEntryLog,
                    message: "Plaza de aparcamiento eliminada exitosamente",
                    action: "Eliminar Plaza",
                    resource: "parking",
                    details: {
                        userId: currentUserId,
                        action: "Eliminar Plaza",
                        description: "Plaza de aparcamiento eliminada exitosamente"
                    }
                })


                return res.status(200).send({
                    success: true,
                    message: 'Plaza de aparcamiento eliminada exitosamente'
                })
            } catch (error: unknown) {
                LoggerController.sendLog({
                    ...defaultEntryLog,
                    level: "error",
                    message: "No se pudo eliminar la plaza",
                    action: "Eliminar Plaza",
                    resource: "parking",
                    details: {
                        userId: currentUserId,
                        action: "Eliminar Plaza",
                        description: "No se pudo eliminar la plaza"
                    }
                })
                return ErrorHandler.handleError(res, error, 'Error interno del servidor')
            }
        }
    }
}