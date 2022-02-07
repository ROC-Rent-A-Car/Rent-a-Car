import { PermLevel } from "../../enums/PermLevel";
import { TableBase } from "./TableBase";

export interface User extends TableBase {
    username: string,
    password_hash: string,
    email: string,
    phone: string,
    postal_code: string,
    perm_level: PermLevel,
    renting: boolean,
    token: string,
    token_expiration: Date
}