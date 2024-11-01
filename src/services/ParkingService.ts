import IDatabase from '../models/Database/IDatabase'
import SpaceParkingModel from '../models/Parking/SpaceParkingModel'
import ReservaService from './ReservaService'
import VehiculoModel from '../models/Parking/VehiculesModel'
import FechaModel from '../models/Parking/FechaModel'
import ParkingError from '../models/Errors/ParkingModelError'
import { validateFields } from '../controllers/Utils'
import OcupancyParkingSpace from '../models/OcupancyParkingSpace'
import ParkingSpace from '../models/OcupancyParkingSpace'
class ReservaError extends ParkingError { }
interface ReservaParkingSpace {
  success: boolean
  message: string
  detalles: {
    id: string
    user_id: string
    parking_space_id: string
    vehiculo: string | {
      make: string
      model: string
      plate: string
    }
    start_time: FechaModel
    end_time: FechaModel
    created_at: Date
    updated_at: Date
  }
}
class ParkingService {
  private readonly reservaService: ReservaService


  constructor(
    private readonly userId: string | null,
    private readonly db: IDatabase
  ) {
    this.reservaService = new ReservaService(db)
  }

  async getParkingSpaceById(parkingSpaceId: String): Promise<Array<SpaceParkingModel>> {
    try {
      const result = await this.db.get<Array<SpaceParkingModel>>('CALL GetParkingSpaceById(?);', [parkingSpaceId])
      console.log("Test PARKINGSPACEBYID")
      console.log("result", result)
      return result
    } catch (error) {
      console.error(error)
      throw new ParkingError('Error al obtener el espacio de aparcamiento')
    }
  }
  async getParkingOccupancy(): Promise<{ occupiedPlazas: OcupancyParkingSpace[] }> {
    try {
      // Consulta a la base de datos para obtener las plazas ocupadas y disponibles
      const plazas = await this.db.get<Array<OcupancyParkingSpace>>('CALL GetParkingOccupancy()', [])
      console.log("Test GetParkingOccupancy")
      console.log("plazas", plazas)
      console.log("      // Consulta a la base de datos para obtener las plazas ocupadas  disponibles")
      if (plazas !== null && plazas.length === 0) {
        return { occupiedPlazas: [] }
      }
      const result = {
        occupiedPlazas: Array<OcupancyParkingSpace>()
      }

      plazas.forEach(
        (currentPlaza: ParkingSpace) => {

          /*,
          parking_space_id,
          is_available: Boolean(is_available), // Convertir 0 o 1 a boolean
          vehicleDetails: is_available === 0
            ? {
              vehicle_id,
              make,
              model
            }
            : null, // Agrupar en vehicleDetails solo si el espacio no está disponible
          reservations_count
          */
          // Solo añadir si el espacio no está disponible

          // if (!spaceJSON.is_available) {
          //   result.occupiedPlazas.push(spaceJSON)
          //}

          if (!currentPlaza.is_available) {
            result.occupiedPlazas.push(currentPlaza)
          }
        }
      )

      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      throw new ParkingError('Error al consultar la ocupación del parking')
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
  ): Promise<ReservaParkingSpace> => {
    try {
      if (parkingSpaceId !== null && parkingSpaceId !== undefined) {
        const parkingSpace = await SpaceParkingModel.getSpaceById(
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

      console.log('soyt pros', parkingSpace)
      throw new ParkingError('No hay plazas disponibles en el horario solicitado');

    } catch (error: unknown) {
      if (error instanceof ParkingError) {
        throw error
      }
      const err = error as { sqlMessage: string, code: string };
      console.log("eee", err)
      if (err.sqlMessage && err.code === 'ER_SIGNAL_EXCEPTION') {
        throw new ReservaError(err.sqlMessage)
      } else {
        throw new ReservaError('Error al procesar la reserva')
      }
    }
  }

  async checkAvailableSpace(startTime: FechaModel, endTime: FechaModel): Promise<SpaceParkingModel | null> {
    const primitiveStartTime = startTime.toPrimitives()
    const primitiveEndTime = endTime.toPrimitives()
    const [rows] = await this.db.all<Array<SpaceParkingModel>>('CALL CheckAvailableSpaces(?, ?);', [primitiveStartTime, primitiveEndTime])
    return rows[0]
  }

  async updateparkingSpace(spaceId: string, spaceDetails: SpaceParkingModel): Promise<boolean> {
    return await SpaceParkingModel.updateSpaceAvailability(
      this.db,
      spaceId,
      spaceDetails.getIsAvailable()
    )
  }

  async deleteparkingSpace(spaceId: string): Promise<boolean> {
    return await SpaceParkingModel.deleteSpace(this.db, spaceId)
  }

}

export default ParkingService
