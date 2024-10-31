export default interface UserResponse {
    "id": string,
    "token": string
}
export interface UserLoginResponse extends UserResponse {
    success: boolean;
    message: string;
}
