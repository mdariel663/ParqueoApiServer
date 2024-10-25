export default class ParkingModelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ParkingModelError";
    }
}