import { TokenInfo } from "./TokenInfo";

export interface User extends TokenInfo {
    username: string,
    password_hash: string,
    email: string,
    phone: string,
    postal_code: string,
    house_number: string
}