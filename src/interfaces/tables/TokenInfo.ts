import { PermLevel } from "../../enums/PermLevel";

export interface TokenInfo {
    token_expiration: Date,
    token: string,
    perm_level: PermLevel
}