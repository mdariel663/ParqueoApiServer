import IDatabase from '../models/Database/IDatabase'
import ReservaService from './ReservaService'
import VehiculoModel from '../models/Parking/VehiculesModel'
import FechaModel from '../models/Parking/FechaModel'
import { validateFields } from '../controllers/Utils'
import ParkingError from '../models/Errors/ParkingModelError'
import ReservaModelError from '../models/Errors/ReservaModelError'
import ReservaModelResponse from '../models/Reservas/ReservaModelResponse'
import ReservaParkingSpaceCreate from '../models/Reservas/ReservaParkingSpaceCreate'
import { ParkingSpaceRequestUpdate, ParkingSpaceRow } from '../models/Parking/ParkingSpace'
import ParkingModel from '../models/ParkingModel'
import ParkingModelError from '../models/Errors/ParkingModelError'
ReservaModelResponse
class ParkingService {
  private readonly reservaService: ReservaService


  constructor(
    private readonly userId: string | null,
    private readonly db: IDatabase
  ) {
    this.reservaService = new ReservaService(db)
  }


  async getAllSpaces(): Promise<Array<ParkingSpaceRow>> {

    const [rows] = await this.db.all<Array<ParkingSpaceRow>>('CALL GetParkingSpaces();', [])

    if (rows !== null && rows.length === 0) {
      return []
    }
    return rows
  }


  async getParkingSpaceById(parkingSpaceId: String): Promise<Array<ParkingSpaceRow>> {
    try {
      const result = await this.db.get<Array<ParkingSpaceRow>>('CALL GetParkingSpaceById(?);', [parkingSpaceId])
      return result
    } catch (error) {
      console.error(error)
      throw new ParkingError('Error al obtener el espacio de aparcamiento')
    }
  }
  async eliminarReserva(reservationId: string): Promise<{ success: boolean, message: string }> {
    return await this.reservaService.eliminarReserva(reservationId)
  }



  reservarPlaza = async (
    vehiculo: VehiculoModel,
    startTime: FechaModel,
    endTime: FechaModel,
    parkingSpaceId?: string
  ): Promise<ReservaParkingSpaceCreate> => {
    try {
      if (parkingSpaceId !== null && parkingSpaceId !== undefined) {
        const parkingSpace = await ParkingModel.getSpaceById(
          this.db,
          parkingSpaceId as string
        )
        if (parkingSpace == null) {
          throw new ParkingError(
            'No se puede reservar una plaza de aparcamiento que no existe'
          )
        }
        return await this.reservaService.reservarPlaza(
          this.userId as string,
          parkingSpaceId as string,
          vehiculo,
          startTime,
          endTime
        )
      }

      const errMessage = validateFields({ vehiculo, startTime, endTime })
      if (errMessage !== null) {
        throw new ParkingError(errMessage)
      }

      const parkingSpace: { parking_space_id?: string | null } | null = await this.checkAvailableSpace(startTime, endTime);

      if (parkingSpace === null || parkingSpace === undefined) {
        throw new ParkingError('No hay plazas disponibles en el horario solicitado');
      }

      if (parkingSpace.parking_space_id !== null || parkingSpace.parking_space_id !== undefined) {
        return await this.reservaService.reservarPlaza(
          this.userId as string,
          parkingSpaceId as unknown as string,
          vehiculo,
          startTime,
          endTime
        )
      }
      throw new ParkingError('No hay plazas disponibles en el horario solicitado');

    } catch (error: unknown) {
      if (error instanceof ParkingError) {
        throw error
      }
      const err = error as { sqlMessage: string, code: string };
      if (err.sqlMessage && err.code === 'ER_SIGNAL_EXCEPTION') {
        throw new ReservaModelError(err.sqlMessage)
      } else {
        throw new ReservaModelError('Error al procesar la reserva')
      }
    }
  }

  async checkAvailableSpace(startTime: FechaModel, endTime: FechaModel): Promise<ParkingSpaceRow | null> {
    const primitiveStartTime = startTime.toPrimitives()
    const primitiveEndTime = endTime.toPrimitives()
    const rows = await this.db.all<ParkingSpaceRow>('CALL CheckAvailableSpaces(?, ?);', [primitiveStartTime, primitiveEndTime])
    return rows[0]
  }

  async updateparkingSpace(spaceId: string, spaceDetails: ParkingSpaceRequestUpdate): Promise<boolean> {
    const currentSpace = await ParkingModel.getSpaceById(this.db, spaceId)
    if (currentSpace === null) {
      throw new ParkingError('No se puede actualizar el espacio de aparcamiento')
    }

    return await ParkingModel.updateSpaceAvailability(
      this.db,
      spaceId,
      spaceDetails
    ).catch((error: unknown) => {
      if (error instanceof ParkingModelError) {
        throw new ParkingError((error as { message: string }).message)
      }
      throw new ParkingError('Error al actualizar el espacio de aparcamiento')
    })
  }

  async deleteparkingSpace(spaceId: string): Promise<boolean> {
    return await ParkingModel.deleteSpace(this.db, spaceId)
  }

}

export default ParkingService
