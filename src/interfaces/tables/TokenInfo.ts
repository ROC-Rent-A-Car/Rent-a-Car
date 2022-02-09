import { PermLevel } from "../../enums/PermLevel";

export interface TokenInfo {
    tokenExpiration: Date,
    token: string,
    permLevel: PermLevel
}