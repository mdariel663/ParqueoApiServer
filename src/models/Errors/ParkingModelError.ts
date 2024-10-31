export default class ParkingModelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParkingModelError'
  }
}
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}