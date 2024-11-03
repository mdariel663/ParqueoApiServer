import { FechaFormat } from "../Parking/FechaModel"

export default interface ReservaParkingSpaceCreate {
    success: boolean, message: string, details: {
        id: string,
        user_id: string,
        parking_space_id: string,
        vehiculo: string | {
            make: string,
            model: string,
            plate: string
        },
        start_time: FechaFormat,
        end_time: FechaFormat,
        created_at: Date,
        updated_at: Date
    }
}