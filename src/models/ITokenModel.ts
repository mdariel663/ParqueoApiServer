import { UUID } from "crypto";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export default interface ITokenModel {
  getIdFromHeader(req: Request): Promise<UUID>;
  generateToken(id: UUID): string;
  verifyToken(token: string):  Promise<JwtPayload>;
}
