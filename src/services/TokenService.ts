import ITokenModel from "../models/ITokenModel";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UUID } from "crypto";
import { ErrorCode } from "../controllers/HandleErrors";
import dotenv from "dotenv";
import { exit } from "process";

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
        .catch((err) => reject(err));
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
    new Promise((resolve, reject) => {
      if (!token) {
        reject(ErrorCode.TOKEN_NOT_FOUND);
        return;
      }

      jwt.verify(token, this.secretKey!, (err, decoded) => {
        if (err) {
          reject(ErrorCode.TOKEN_INVALID);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
}

export default TokenService;
