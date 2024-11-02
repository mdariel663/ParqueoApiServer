import ParkingModelError from "./ParkingModelError";

export default class ReservaModelError extends ParkingModelError {
    constructor(message: string) {
        super(message);
    }
}
