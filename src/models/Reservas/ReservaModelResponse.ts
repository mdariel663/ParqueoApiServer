import { UUID } from 'crypto'
import IDatabase from '../Database/IDatabase'
import VehiculoModelResponse from '../VehiculoModelResponse'
import VehiculoModel from '../Parking/VehiculesModel'
export default class ReservaModelResponse {
    private vehicleResponse: VehiculoModelResponse | null = null


    constructor(private readonly db: IDatabase | null,
        readonly id: UUID,
        readonly user_id: UUID,
        readonly parking_space_id: string,
        readonly vehicle_id: string,
        readonly created_at: Date,
        readonly updated_at: Date) {
        (async (): Promise<void> => {
            await this.getVehicle()
        })().catch((error) => {
            if (process.env.NODE_ENV === 'production') {
                console.log('Error al obtener el vehiculo:', error)
            }
        })
    }

    private readonly getVehicle = async (): Promise<void> => {
        if (this.db != null) {
            this.vehicleResponse = await VehiculoModel.getVehiculoByPlate(this.db, this.vehicle_id)
        }
    }

    // Add a method to access vehicle response if needed
    public getVehicleResponse(): VehiculoModelResponse | null {
        return this.vehicleResponse
    }
}
