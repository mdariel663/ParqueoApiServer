import IDatabase from "./Database/IDatabase";
import ParkingModelError, { ValidationError } from "./Errors/ParkingModelError";
import { ParkingSpaceRow, ParkingCreateResponse, ParkingSpaceRequestUpdate } from "./Parking/ParkingSpace";
import ReservaModel from "./Reservas/ReservaModel";
import ReservaModelResponse from "./Reservas/ReservaModelResponse";


export default class ParkingModel {
    static async getSpaceById(databaseRepository: IDatabase, spaceName: string): Promise<ParkingSpaceRow[]> {
        const dbData = await databaseRepository.get<ParkingSpaceRow[]>("CALL GetParkingSpaceById(?);", [spaceName]);
        return dbData
    }

    static async deleteSpace(db: IDatabase, spaceId: string): Promise<boolean> {
        try {
            // Verificar si hay reservas antes de eliminar
            const reservations: { count: number } = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM reservations WHERE parking_space_id = ?;`, [spaceId])


            if (reservations["count"] > 0) {
                const reservas = await ReservaModel.getAllReservas(db).then((reservas: ReservaModelResponse[]) => reservas);

                reservas.forEach(async (reserva: ReservaModelResponse) => {
                    if (reserva.parking_space_id === spaceId) {
                        await ReservaModel.deleteReserva(db, reserva.id);
                    }
                });
            }

            const affectedRows = await db.run("DELETE FROM parking_spaces WHERE id = ?;", [spaceId])

            if (affectedRows.affectedRows === 0) {
                throw new ParkingModelError('El espacio de aparcamiento no existe')
            }
            return true
        } catch (error) {
            if (error instanceof ParkingModelError) {
                throw error
            }
            new ParkingModelError('Error al eliminar espacio de aparcamiento')
            return false
        }

    }
    static async createSpace(connection: IDatabase, spaceId: string): Promise<ParkingCreateResponse | null> {
        try {
            const result = await connection.run("INSERT INTO parking_spaces (id, is_available, created_at, updated_at) VALUES (?, ?, NOW(), NOW());", [spaceId, true])

            if (result.affectedRows === 0) {
                throw new ValidationError("Ya existe un espacio de aparcamiento con el mismo nombre")
            }

            const response = {
                "parking_space_id": spaceId,
                is_available: true,
                "updated_at": new Date(),
                "created_at": new Date()
            } as ParkingCreateResponse

            return response
        } catch (error: unknown) {

            if (error instanceof ValidationError) {
                const err = error as ValidationError;
                throw new ParkingModelError(err.message)
            }
            throw new ParkingModelError('Error al crear espacio de aparcamiento')
        }
    }

    /*static async updateSpaceAvailability(
        connection: IDatabase,
        parking_current_space_id: string,
        spaceDetails: { parking_space_id?: string d, is_available: boolean | undefined }
    ): Promise<boolean> {
        const { parking_space_id, is_available } = spaceDetails;

        const result = await connection.run("UPDATE parking_spaces SET is_available = ?, updated_at = NOW() WHERE id = ?;", [is_available, id])
        return result.affectedRows > 0 // Retornar true si la actualización fue exitosa
    }*/

    static async updateNewSpaceCheck(connection: IDatabase, new_parking_space_id: string) {
        let checkNewSpace: { count: number };

        let data = await connection.runPlusPlus<{ count: number }[]>(
            "SELECT COUNT(*) AS count FROM parking_spaces WHERE id = ?;",
            [new_parking_space_id]
        )
        checkNewSpace = data[0];
        return checkNewSpace;
    }
    static async updateSpaceAvailability(
        connection: IDatabase,
        parking_current_space_id: string,
        spaceDetails: ParkingSpaceRequestUpdate
    ): Promise<boolean> {
        const { new_parking_space_id, is_available } = spaceDetails;
        try {
            const result = await connection.run("CALL UpdateParkingSpaceInfo(?, ?, ?);",
                [
                    parking_current_space_id,
                    new_parking_space_id,
                    is_available ?? true
                ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}