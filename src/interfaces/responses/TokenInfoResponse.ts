import { PermLevel } from "../../enums/PermLevel";

export interface TokenInfoResponse {
    tokenExpiration: number,
    token: string,
    permLevel: PermLevel
}