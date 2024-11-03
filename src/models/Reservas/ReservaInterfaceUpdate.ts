import FechaModel from "../Parking/FechaModel";
import VehiculoModel from "../Parking/VehiculesModel";

export default interface ReservaInterfaceUpdate {
    id: string,
    user_id: string,
    parking_space_id: string,
    vehiculo: VehiculoModel | string,
    start_time: FechaModel,
    end_time: FechaModel,
    created_at: Date,
    updated_at: Date
}