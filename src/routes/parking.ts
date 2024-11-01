import express from 'express'
import controllers from '../controllers/controllers'
import ParkingService from '../services/ParkingService'
import ErrorHandler from '../controllers/HandleErrors'
import UserModel from '../models/User/UserModel'
import { UserModelErrorAuth } from '../models/Errors/UserModelError'
import OcupancyParkingSpace from '../models/OcupancyParkingSpace'
import { UUID } from 'crypto'
import LoggerController, { defaultEntryLog } from '../controllers/LoggerController'
import ReservaRouter from './reserva'
const router = express.Router()

router.get('/ocupped', controllers.middleware.onlyAuthenticated, async (req, res) => {
  const { currentUserId } = req.body as { currentUserId: UUID }

  try {
    const userModel = new UserModel(controllers.databaseRepository);
    const currentUser = await userModel.getCurrentUser(currentUserId);

    // Verifica si el usuario actual existe
    if (!currentUser) {
      throw new UserModelErrorAuth('Usuario no encontrado');
    }

    if (currentUser.role !== 'empleado' && currentUser.role !== 'admin') {
      throw new UserModelErrorAuth('No tienes permisos para acceder a esta información');
    }

    // Usar el servicio para manejar la lógica de ocupación
    const parkingService = new ParkingService(null, controllers.databaseRepository);

    // Obtener la ocupación actual del parking
    const occupancyData: { occupiedPlazas: OcupancyParkingSpace[] } = await parkingService.getParkingOccupancy();

    LoggerController.sendLog({
      ...defaultEntryLog,
      message: "Ocupación del parking obtenida exitosamente",
      action: "Obtener Ocupación",
      resource: "parking",
      details: {
        userId: currentUserId,
        action: "Obtener Ocupación",
        description: "Ocupación del parking obtenida exitosamente"
      }
    })

    return res.status(200).send({
      ...occupancyData,
      message: 'Ocupación del parking obtenida exitosamente'
    });
  } catch (error: unknown) {

    LoggerController.sendLog({
      ...defaultEntryLog,
      level: "error",
      message: "Ocupación del parking fallida",
      action: "Obtener Ocupación",
      resource: "parking",
      details: {
        userId: currentUserId,
        action: "Obtener Ocupación",
        description: "Ocupación del parking fallida"
      }
    })
    return ErrorHandler.handleError(res, error, 'Error interno del servidor', 500);
  }
});
router.use('/reservas', ReservaRouter)

export default router
