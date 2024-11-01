export type FechaFormat = `${number}-${string}-${string} ${string}:${string}:${string}`;
export default class FechaModel {
  isValid: boolean = false
  fecha!: Date

  constructor(fecha: string | undefined) {
    if (fecha === undefined) {
      this.isValid = false
      return
    }

    const parsedDate = new Date(fecha)
    if (!isNaN(parsedDate.getTime())) {
      this.fecha = parsedDate
      this.isValid = true
    }
  }



  toPrimitives = (): FechaFormat => {
    const year = this.fecha.getFullYear()
    const month = String(this.fecha.getMonth() + 1).padStart(2, '0')
    const day = String(this.fecha.getDate()).padStart(2, '0')
    const hours = String(this.fecha.getHours()).padStart(2, '0')
    const minutes = String(this.fecha.getMinutes()).padStart(2, '0')
    const seconds = String(this.fecha.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}
