import { PermLevel } from "../../enums/PermLevel";
import { TableBase } from "../tables/TableBase";

export interface UserResponse extends TableBase {
    username: string,
    email: string,
    phone: string,
    postalCode: string,
    permLevel: PermLevel,
    token?: string,
    tokenExpiration?: number
}