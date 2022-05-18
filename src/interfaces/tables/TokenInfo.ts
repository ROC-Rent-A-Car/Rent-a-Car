import { TableBase } from "./TableBase";
import { PermLevel } from "../../enums/PermLevel";

export interface TokenInfo extends TableBase {
    token_expiration: Date | string,
    token: string,
    perm_level: PermLevel
}