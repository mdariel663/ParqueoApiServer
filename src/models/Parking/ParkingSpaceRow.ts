export default interface ParkingSpaceRow {
  parking_space_id: string
  is_available: number
  vehicle_id: string | null
  make: string | null
  model: string | null
  reservations_count: number
}
