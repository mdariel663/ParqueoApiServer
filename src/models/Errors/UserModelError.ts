

export default class UserModelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelError'
  }
}



export class UserModelErrorBadRequest extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelErrorBadRequest'
  }
}
export class UserModelErrorAuth extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserModelErrorAuth'
  }
}