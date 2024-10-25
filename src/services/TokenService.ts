import ITokenModel from "../models/ITokenModel";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UUID } from "crypto";
import dotenv from "dotenv";
import { exit } from "process";
import TokenModelError from "../models/Errors/TokenModelError";

dotenv.config();

class TokenService implements ITokenModel {
  constructor(
    protected readonly secretKey: string | null = process.env.TOKEN_KEY !==
    undefined
      ? process.env.TOKEN_KEY
      : null
  ) {
    if (!secretKey) {
      console.error("No se ha definido el secretKey del TokenService");
      exit(-1);
    }
  }

  async getIdFromHeader(req: Request): Promise<UUID> {
    const tokenRequest = req.header("authorization")?.replace("Bearer ", "");
    return new Promise<UUID>((resolve, reject) => {
      this.verifyToken(tokenRequest)
        .then((tokenData) => resolve(tokenData?.id))
        .catch((err) => {throw new TokenModelError(err.message)});
    });
  }

  generateToken(id: UUID): string {
    const payload = { id };
    const secretKey = this.secretKey;

    const threeYearsInSeconds = 1 * 365 * 24 * 60 * 60; // Expira en 1 years
    const token = jwt.sign(payload, secretKey!, {
      expiresIn: threeYearsInSeconds,
    });

    return token;
  }

  verifyToken = async (token: string | undefined): Promise<JwtPayload> =>
    new Promise((resolve) => {
      if (!token) {
        throw new TokenModelError("Usuario no autenticado")
      }

      jwt.verify(token, this.secretKey!, (err, decoded) => {
        if (err) {
          throw new TokenModelError("Usuario no autenticado")
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
}

export default TokenService;
