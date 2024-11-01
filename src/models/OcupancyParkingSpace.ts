export default interface ParkingSpace {
    parking_space_id: string
    is_available: boolean
    vehicleDetails: {
        vehicle_id: string | null
        make: string | null
        model: string | null
    } | null
    reservations_count: number
}

export default interface OcupancyParkingSpace {
    occupiedPlazas: Array<ParkingSpace>
}