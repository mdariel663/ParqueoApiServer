import { UUID } from 'crypto'
import IDatabase from '../Database/IDatabase'
import VehiculoModelResponse from '../VehiculoModelResponse'
import VehiculoModel from '../Parking/VehiculesModel'
export default class ReservaModelResponse {
    private vehicleResponse: VehiculoModelResponse | null = null


    constructor(private readonly db: IDatabase | null,
        private readonly id: UUID,
        private readonly user_id: UUID,
        readonly parking_space_id: string,
        private readonly vehicle_id: string) {
        (async (): Promise<void> => {
            await this.getVehicle()
        })().catch((error) => {
            console.log('Error al obtener el vehiculo:', error)
        })
    }

    // Asynchronous method to initialize vehicle response
    // async initialize() {
    //    await
    //  }

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
