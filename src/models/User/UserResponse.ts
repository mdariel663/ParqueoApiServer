import { UUID } from "crypto";

export default interface UserResponse {
    "id": UUID;
    "token": string
}
export interface UserLoginResponse extends UserResponse {
    success: boolean;
    message: string;
}
