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
  async updateReserva(reservaId: string, vehiculo: VehiculoModel, startDate: FechaModel, endDate: FechaModel): Promise<ReservaParkingSpaceCreate> {


    const existingReserva = await ReservaModel.getReservaById(this.db, reservaId);
    if (existingReserva === null) {
      throw new ParkingModelError('No se puede editar una reserva que no existe');
    }

    if (!vehiculo.isValid) {
      throw new ParkingModelError('Datos del vehículo no válidos');
    } else if (!startDate.isValid || !endDate.isValid) {
      throw new ParkingModelError('Datos de fecha no válidos');
    } else if (startDate.fecha >= endDate.fecha) {
      throw new ParkingModelError('La fecha de inicio debe ser anterior a la de terminación');
    }

    const updatedReserva = new ReservaModel(
      reservaId,
      existingReserva.user_id,
      existingReserva.parking_space_id,
      vehiculo,
      startDate,
      endDate,
      existingReserva.created_at,
      new Date()
    );

    const result = await ReservaModel.updateReserva(this.db, updatedReserva);

    if (result.affectedRows === 0) {
      throw new ParkingModelError('No se pudo actualizar la reserva');
    }

    LoggerController.sendLog({
      ...defaultEntryLog,
      message: "Reserva actualizada exitosamente",
      action: "Actualizar Reserva",
      resource: "reserva",
      details: {
        userId: existingReserva.user_id,
        reservationId: reservaId,
        action: "Actualizar Reserva",
        description: "Se actualizó la reserva con éxito"
      }
    });

    return {
      success: true,
      message: 'Reserva actualizada con éxito',
      detalles: updatedReserva.toJSON()
    };
  }

  constructor(private readonly db: IDatabase) { }

  async reservarPlaza(
    userId: string,
    parkingSpaceId: string,
    vehiculo: VehiculoModel,
    startTime: FechaModel,
    endTime: FechaModel
  ): Promise<ReservaParkingSpaceCreate> {
    const reservationId = randomUUID()
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
