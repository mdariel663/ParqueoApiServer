import IDatabase from '../models/Database/IDatabase'
import FechaModel from '../models/Parking/FechaModel'
import ReservaModel from '../models/Reservas/ReservaModel'
import VehiculoModel from '../models/Parking/VehiculesModel'
import { randomUUID } from 'crypto'
import ReservaModelResponse from '../models/Reservas/ReservaModelResponse'
import LoggerController, { defaultEntryLog } from '../controllers/LoggerController'
import ParkingModelError from '../models/Errors/ParkingModelError'
import ReservaParkingSpaceCreate from '../models/Reservas/ReservaParkingSpaceCreate'

class ReservaService {
  constructor(private readonly db: IDatabase) { }

  async reservarPlaza(
    userId: string,
    parkingSpaceId: string,
    vehiculo: VehiculoModel,
    startTime: FechaModel,
    endTime: FechaModel
  ): Promise<ReservaParkingSpaceCreate> {
    const reservationId = randomUUID()

    console.log("reservationId", reservationId)
    console.log("startTime", startTime)
    console.log("endTime", endTime)
    console.log("vehiculo", vehiculo)
    console.log("parkingSpaceId", parkingSpaceId)
    console.log("userId", userId)

    if (!parkingSpaceId) {
      const primitiveStartTime = startTime.toPrimitives()
      const primitiveEndTime = endTime.toPrimitives()
      const unreservedSpaces: ReservaModelResponse[] = await ReservaModel.getAvailableSpacesInFuture(this.db, primitiveStartTime, primitiveEndTime)


      if (unreservedSpaces === null || unreservedSpaces.length === 0) {
        throw new ParkingModelError(
          'No hay plazas disponibles en el horario solicitado'
        )
      }

      const idx = Math.floor(Math.random() * unreservedSpaces.length)
      parkingSpaceId = unreservedSpaces[idx].parking_space_id
    }
    const reserva = new ReservaModel(
      reservationId,
      userId,
      parkingSpaceId,
      vehiculo,
      startTime,
      endTime,
      new Date(),
      new Date()
    )

    const result = await ReservaModel.createReserva(this.db, reserva)
    if (result.affectedRows === 0) {
      LoggerController.sendLog({
        ...defaultEntryLog,
        message: "No se pudo procesar la reserva",
        action: "Reserva",
        resource: "reserva",
        details: {
          userId: userId,
          action: "Reserva",
          description: "No se pudo procesar la reserva"
        }
      })
      throw new ParkingModelError('No se pudo procesar la reserva')
    }

    LoggerController.sendReserva(userId, {
      parking_space_id: reserva.parking_space_id,
      vehicleData: reserva.vehiculo ?? null
    }, true)

    return {
      success: true,
      message: 'Reserva realizada con éxito',
      detalles: reserva.toJSON()
    }
  }

  async eliminarReserva(reservationId: string): Promise<{ success: boolean, message: string }> {
    const reserva = await ReservaModel.getReservaById(this.db, reservationId);
    if (reserva === null) {
      return {
        success: false,
        message: 'No se encontró la reserva'
      }
    }

    const result: boolean = await ReservaModel.deleteReserva(
      this.db,
      reservationId,
    )
    return {
      success: result,
      message: result ? 'Reserva eliminada con éxito' : 'No se encontró la reserva'
    }
  }

  getAllReservas = async (): Promise<ReservaModelResponse[]> => {
    return await ReservaModel.getAllReservas(this.db)
  }
}

export default ReservaService
