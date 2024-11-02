

export default class UserModelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelError'
  }
}



export class UserModelErrorBadRequest extends UserModelError {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelErrorBadRequest'
  }
}
export class UserModelErrorAuth extends UserModelError {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelErrorAuth'
  }
}