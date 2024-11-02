import IDatabase from '../Database/IDatabase'
import VehiculoModel from '../Parking/VehiculesModel'
import FechaModel, { FechaFormat } from '../Parking/FechaModel'
import ReservaModelResponse from './ReservaModelResponse'


class ReservaModel {
  static async updateReserva(db: IDatabase, updatedReserva: ReservaModel): Promise<{ affectedRows: number }> {
    const result = await db.run(
      'UPDATE reservations SET user_id = ?, parking_space_id = ?, vehicle_id = ?, start_time = ?, end_time = ?, updated_at = ? WHERE id = ?',
      [
        updatedReserva.user_id,
        updatedReserva.parking_space_id,
        typeof updatedReserva.vehiculo === 'string'
          ? updatedReserva.vehiculo
          : JSON.stringify(updatedReserva.vehiculo),
        updatedReserva.start_time.toPrimitives(),
        updatedReserva.end_time.toPrimitives(),
        new Date(), // Set current date as updated_at
        updatedReserva.id
      ]
    );

    return result; // This should contain the affected rows
  }

  static async getAvailableSpacesInFuture(db: IDatabase, primitiveStartTime: string, primitiveEndTime: string): Promise<ReservaModelResponse[]> {
    const [unreservedSpaces] = await db.all<ReservaModelResponse[]>('CALL GetAvailableSpacesInFuture(?, ?);', [primitiveStartTime, primitiveEndTime]);
    if (unreservedSpaces === null || unreservedSpaces.length === 0) {
      return []
    }

    return unreservedSpaces;
  }
  static async getReservaById(db: IDatabase, reservationId: string): Promise<ReservaModelResponse> {
    return await db.get<ReservaModelResponse>('SELECT id, user_id, parking_space_id, vehicle_id, start_time, end_time, created_at, updated_at FROM reservations WHERE id = ?;', [reservationId])
  }
  constructor(
    public id: string,
    public user_id: string,
    public parking_space_id: string,
    public vehiculo: VehiculoModel | string,
    public start_time: FechaModel,
    public end_time: FechaModel,
    public created_at: Date,
    public updated_at: Date
  ) { }

  toJSON(): {
    id: string
    user_id: string
    parking_space_id: string
    vehiculo: string | {
      make: string
      model: string
      plate: string
    }
    start_time: FechaFormat
    end_time: FechaFormat
    created_at: Date
    updated_at: Date
  } {
    return {
      id: this.id,
      user_id: this.user_id,
      parking_space_id: this.parking_space_id,
      vehiculo:
        typeof this.vehiculo === 'string'
          ? this.vehiculo
          : this.vehiculo.toJsonObject(),
      start_time: this.start_time.toPrimitives(),
      end_time: this.end_time.toPrimitives(),
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }

  static fromJSON(json: {
    id: string
    user_id: string
    parking_space_id: string
    vehicle_id: string | VehiculoModel,
    start_time: FechaModel
    end_time: FechaModel
    created_at: Date
    updated_at: Date
  }): ReservaModel {
    return new ReservaModel(
      json.id,
      json.user_id,
      json.parking_space_id,
      json.vehicle_id,
      json.start_time,
      json.end_time,
      new Date(json.created_at),
      new Date(json.updated_at)
    )
  }

  // Métodos relacionados a las reservas
  static async createReserva(db: IDatabase, reservation: ReservaModel): Promise<{ affectedRows: number }> {
    return await db.run('CALL AddReservation(?, ?, ?, ?, ?, ?)', [
      reservation.id,
      reservation.user_id,
      reservation.parking_space_id,
      typeof reservation.vehiculo === 'string'
        ? reservation.vehiculo
        : JSON.stringify(reservation.vehiculo),
      reservation.start_time.toPrimitives(),
      reservation.end_time.toPrimitives()
    ])
  }

  static async deleteReserva(
    db: IDatabase,
    reservationId: string,
  ): Promise<boolean> {
    const result = await db.run('CALL DeleteReservation(?)', [reservationId])
    return result.affectedRows > 0;
  }

  static async getAllReservas(db: IDatabase): Promise<ReservaModelResponse[]> {
    const rows: ReservaModelResponse[] = await db.all('SELECT id, user_id, parking_space_id, vehicle_id, start_time, end_time, created_at, updated_at FROM reservations;', [])
    return Array.isArray(rows) ? rows : []
  }
}

export default ReservaModel
