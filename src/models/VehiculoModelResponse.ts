import VehiculoModel from './Parking/VehiculesModel'
class VehiculoModelResponse {
  make: string | null
  model: string | null
  plate: string | null
  constructor (vehiculo: VehiculoModel) {
    this.make = vehiculo.make
    this.model = vehiculo.model
    this.plate = vehiculo.plate
  }
}
export default VehiculoModelResponse
