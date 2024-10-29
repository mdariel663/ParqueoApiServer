class TokenModelError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'TokenModelError'
  }
}

export default TokenModelError
