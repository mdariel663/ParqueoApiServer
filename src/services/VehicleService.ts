import IDatabase from "../models/Database/IDatabase";

export default class VehicleService {
    static async checkIfVehicleExists(database: IDatabase, plate: string): Promise<boolean> {
        const result = await database.get<{ count: number }>(`SELECT COUNT(*) AS count FROM vehicles WHERE plate = ?;`, [plate]);
        return result.count > 0;
    }
    static async createVehicle(database: IDatabase, vehicleJson: { make: string, model: string, plate: string }): Promise<void> {
        await database.run(`INSERT INTO vehicles (make, model, plate, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [
            vehicleJson.make,
            vehicleJson.model,
            vehicleJson.plate
        ]);
    }
}
