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

export interface ParkingSpaceRow {
    parking_space_id: string
    is_available: boolean
    vehicle_id: string | null
    make: string | null
    model: string | null
    reservations_count: number
}


export interface ParkingSpaceRequestUpdate {
    new_parking_space_id?: string
    is_available?: boolean | undefined
}


export interface ParkingCreateResponse {
    parking_space_id: string,
    is_available: boolean,
    updated_at: Date,
    created_at: Date
}

