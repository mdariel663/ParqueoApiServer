
class UserNameRequest {
  public messageError: string = ''
  public isValid: boolean = true

  constructor (public name: string) {
    if (!name) {
      this.isValid = false
      this.messageError = 'El campo name es obligatorio'
    } else if (name.length < 3) {
      this.messageError = 'El nombre debe tener al menos 3 caracteres'
      this.isValid = false
    }
  }
}

export default UserNameRequest
