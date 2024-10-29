import { UUID } from "crypto";

export default interface User {
    id: UUID;
    name: string;
    email: string;
    phone: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}
