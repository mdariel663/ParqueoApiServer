import ITokenModel from '../models/ITokenModel'
import { Request } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UUID } from 'crypto'
import dotenv from 'dotenv'
import { exit } from 'process'
import TokenModelError from '../models/Errors/TokenModelError'

dotenv.config()

class TokenService implements ITokenModel {
  constructor(
    protected readonly secretKey: string | undefined = process.env.TOKEN_KEY ?? process.env.TOKEN_KEY
  ) {
    if (secretKey === undefined) {
      console.error('No se ha definido el secretKey del TokenService')
      exit(-1)
    }
  }

  async getIdFromHeader(req: Request): Promise<UUID> {
    const tokenRequest = req.header('authorization')?.replace('Bearer ', '')
    return await new Promise<UUID>((resolve) => {
      this.verifyToken(tokenRequest)
        .then((tokenData) => resolve(tokenData?.id))
        .catch((err: unknown) => {
          const error = err as { "message": string }
          if (error instanceof TokenModelError) {
            throw new TokenModelError(error.message)
          }
          throw new TokenModelError("Error desconocido con respecto al token")
        })
    })
  }

  generateToken(id: UUID): string {
    const payload = { id }

    const threeOneInSeconds = 1 * 365 * 24 * 60 * 60 // Expira en 1 years
    const token = jwt.sign(payload, this.secretKey as string, {
      expiresIn: threeOneInSeconds
    })

    return token
  }

  verifyToken = async (token: string | undefined): Promise<JwtPayload> =>
    await new Promise((resolve) => {
      if (token === undefined) {
        throw new TokenModelError('Usuario no autenticado')
      }

      jwt.verify(token, this.secretKey as string, (err, decoded) => {
        if (err != null) {
          throw new TokenModelError('Usuario no autenticado')
        } else {
          resolve(decoded as JwtPayload)
        }
      })
    })
}

export default TokenService
