export default class PhoneRequest {
  public messageError: string = ''
  public isValid: boolean = true

  constructor(public phone: string | null) {
    if (phone === null) {
      this.isValid = false
      this.messageError = 'El campo phone es obligatorio'
      return
    }

    const isValidFormat = /^(?:\+53\d{8}|53\d{8}|5\d{8}|2\d{7})$/.test(phone)

    if (!isValidFormat) {
      this.messageError = 'El campo phone no es válido'
      this.isValid = false
    }
  }
}
