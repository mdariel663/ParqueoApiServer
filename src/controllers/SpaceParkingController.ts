
import { Request, Response } from 'express'
import ParkingModelError from '../models/Errors/ParkingModelError'
import ParkingSpaceRow from '../models/Parking/ParkingSpaceRow'
import controllers from './controllers'
import ErrorHandler from './HandleErrors'
import LoggerController, { defaultEntryLog } from './LoggerController'
import SpaceModel from '../models/Parking/SpaceParkingModel'
import { generateUniqueId, validateFields } from './Utils'
import ParkingService from '../services/ParkingService'

export class SpaceParkingController {
    static async getReservaSpaceById(res: Response, req: Request): Promise<Response | void> {
        try {
            const { parkingSpaceId } = req.params as { parkingSpaceId: string }
            const { currentUserId } = req.body as { currentUserId: string }

            const parkingService = new ParkingService(currentUserId, controllers.databaseRepository);
            const detailsParkingSpace = await parkingService.getParkingSpaceById(parkingSpaceId);
            console.log('detailsParkingSpace', detailsParkingSpace)

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
            const { currentUserId } = req.body as { currentUserId: string }

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
            let { userId, currentUserId } = req.body as { userId: string, currentUserId: string }

            if (userId === undefined) {
                userId = currentUserId;
            }

            try {
                if (spaceId === undefined) {
                    throw new ParkingModelError('No se pudo eliminar la plaza')
                }
                const parkingService = new ParkingService(
                    userId,
                    controllers.databaseRepository
                )

                const result = await parkingService.deleteparkingSpace(spaceId)

                if (result !== null) {
                    throw new ParkingModelError('No se pudo eliminar la plaza')
                }

                LoggerController.sendLog({
                    ...defaultEntryLog,
                    message: "Plaza de aparcamiento eliminada exitosamente",
                    action: "Eliminar Plaza",
                    resource: "parking",
                    details: {
                        userId: userId,
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
                        userId: userId,
                        action: "Eliminar Plaza",
                        description: "No se pudo eliminar la plaza"
                    }
                })
                return ErrorHandler.handleError(res, error, 'Error interno del servidor')
            }
        }
    }
    static getAllSpaces = async (req: Request, res: Response): Promise<Response | void> => {
        const { currentUserId } = req.body as { currentUserId: string }
        try {
            const parkingSpaces: ParkingSpaceRow[] = await SpaceModel.getAllSpaces(controllers.databaseRepository)

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
                        is_avaliable: Boolean(space.is_available),
                        reservations_count: space.reservations_count
                    }
                }
                ),
                message: 'Plazas de aparcamiento obtenidas exitosamente'
            })
        } catch (error: unknown) {
            console.log('el error mas pendejo', error)
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

    static createSpace = async (req: Request, res: Response): Promise<Response | void> => {
        let { spaceId } = req.body as { spaceId: string }

        if (spaceId !== undefined) {
            spaceId = `space-${generateUniqueId()}`
        }

        const { currentUserId } = req.body as { currentUserId: string }

        try {
            const existingSpace = await SpaceModel.getSpaceById(controllers.databaseRepository, spaceId)

            if (existingSpace !== null) {
                throw new ParkingModelError('El número de plaza ya existe')
            }

            const errMessage = validateFields({ spaceId })
            if (errMessage !== null) {
                throw new ParkingModelError(errMessage)
            }

            const newSpace = await SpaceModel.createSpace(controllers.databaseRepository, spaceId)

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
        const { spaceDetails } = req.body as { spaceDetails: SpaceModel }
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
                controllers.databaseRepository
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


}