
import IDatabase from '../Database/IDatabase'
import ParkingSpaceRow from './ParkingSpaceRow'
import ParkingModelError, { ValidationError } from '../Errors/ParkingModelError'

class VehicleModel {
  constructor(
    private readonly id: string,
    private readonly make: string,
    private readonly model: string,
    private readonly plate: string
  ) { }

  toJSON(): {} {
    return {
      id: this.id,
      make: this.make,
      model: this.model,
      plate: this.plate
    }
  }
}

class SpaceParkingModel {
  constructor(
    readonly parking_space_id: string | null,
    private is_available: boolean | null,
    private createdAt: Date | null,
    private updatedAt: Date | null,
    private readonly vehicle?: VehicleModel | null,
    private readonly reservations_count = 0
  ) { }

  getReservationsCount(): number {
    return this.reservations_count
  }

  getId(): string | null {
    return this.parking_space_id
  }

  getCreatedAt(): Date | null {
    return this.createdAt
  }

  getUpdatedAt(): Date | null {
    return this.updatedAt
  }

  setIsAvailable(isAvailable: boolean): void {
    this.is_available = isAvailable
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt
  }

  getIsAvailable(): boolean {
    return Boolean(this.is_available)
  }

  toJSON(): {} {
    return {
      id: this.parking_space_id,
      isAvailable: Boolean(this.is_available),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      vehicle: this.vehicle != null ? this.vehicle.toJSON() : null
    }
  }

  static fromJSON(json: {
    id: string
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
    vehicle?: VehicleModel | null
  }): SpaceParkingModel {
    return new SpaceParkingModel(
      json.id,
      json.isAvailable,
      json.createdAt,
      json.updatedAt,
      json.vehicle
    )
  }

  static async deleteSpace(db: IDatabase, spaceId: string): Promise<boolean> {
    try {
      // Verificar si hay reservas antes de eliminar
      const reservations: number[] = await db.get<number[]>(`SELECT COUNT(*) AS count FROM reservations WHERE parking_space_id = ?;`, [spaceId])


      console.log("reservations", reservations)
      return false;
      // if (reservations[0].count > 0) {
      // throw new ParkingModelError('No se puede eliminar espacio con reservas')
      //}
      /*
            const [result] = await db.run(
              `
                      DELETE FROM parking_spaces WHERE id = ?;
                  `,
              [spaceId]
            )
            return result.affectedRows > 0 // Retornar true si se eliminó el espacio
            */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      new ParkingModelError('Error al eliminar espacio de aparcamiento')
      return false
    }

  }
  static async createSpace(connection: IDatabase, spaceId: string): Promise<SpaceParkingModel | null> {

    try {
      const result = await connection.run(
        `
            INSERT INTO parking_spaces (id, is_available, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW());
        `,
        [spaceId, true]
      )

      if (result.affectedRows === 0) {
        throw new ValidationError("El número de plaza ya existe")
      }

      return new SpaceParkingModel(spaceId, true, new Date(), new Date())
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw new ParkingModelError(error.message)
      }
      throw new ParkingModelError('Error al crear espacio de aparcamiento')
    }
  }

  static async updateSpaceAvailability(
    connection: IDatabase,
    id: string,
    isAvailable: boolean
  ): Promise<boolean> {
    const result = await connection.run("UPDATE parking_spaces SET is_available = ?, updated_at = NOW() WHERE id = ?;", [isAvailable, id])
    return result.affectedRows > 0 // Retornar true si la actualización fue exitosa
  }

  static async getSpaceById(connection: IDatabase, id: string): Promise<SpaceParkingModel | null> {
    if (id === undefined) {
      throw new ParkingModelError('No existe el espacio de aparcamiento')
    }
    const row = await connection.get<{ "id": string, "is_available": boolean, "created_at": Date, "updated_at": Date }>("SELECT id, is_available, created_at, updated_at FROM parking_spaces WHERE id = ?;", [id])

    console.log("row", row)

    /*if (!rows || rows.length === 0) {
      return null
    }

    if (rows.length > 0) {
      const { id, is_available, created_at, updated_at } = rows[0]
      return new SpaceParkingModel(id, is_available, created_at, updated_at)
    }*/
    return new SpaceParkingModel(row.id, row.is_available, row.created_at, row.updated_at)
    return null // Retornar null si no se encuentra el espacio
  }

  static async getAllSpaces(conn: IDatabase): Promise<ParkingSpaceRow[]> {
    const rows = await conn.all<ParkingSpaceRow[]>('CALL GetParkingSpaces();', [])
    if (rows !== null && rows.length === 0) {
      return []
    }
    /*
    return rows.map((row: ParkingSpaceRow) => ({
      parking_space_id: row.parking_space_id,
      is_available: row.is_available,
      vehicle: row.vehicle_id
        ? {
          id: row.vehicle_id,
          make: row.make,
          model: row.model,
          plate: row.vehicle_id
        }
        : null,
      reservations_count: row.reservations_count
    }))*/
    console.log("rows", rows)
    return []
  }
}

export default SpaceParkingModel
