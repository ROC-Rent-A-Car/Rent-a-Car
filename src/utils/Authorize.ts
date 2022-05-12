import { Token } from "std-node";
import { SETTINGS } from "..";
import { PermLevel } from "../enums/PermLevel";
import { TokenInfo } from "../interfaces/tables/TokenInfo";
import { Query } from "./Query";

export class Authorize {
    
    public static refreshToken(uuid: string): Promise<TokenInfo | null> {
        const date = new Date();

        date.setDate(date.getDate() + SETTINGS.get("api").token_days_valid);

        return new Promise((resolve) => {
            Query.create<TokenInfo>(`
                UPDATE users 
                SET 
                    token = $1, 
                    token_expiration = $2
                WHERE uuid = $3
                RETURNING *
            `, [
                new Token(4).toString(),
                date,
                uuid
            ]).then((newTokenInfo) => resolve(newTokenInfo.rows[0] ?? null)).catch(() => resolve(null));
        });
    }
    
    /**
     * Tries to select the token info of the provided user, this will return null if the provided info isn't valid
     * @param uuid The user UUID
     * @param token The user authorization token
     * @returns The authorization promise which will be null if it's invalid/there was an error or have the token info
     */
    public static getTokenInfo(uuid: string, token: string): Promise<TokenInfo | null> {
        return new Promise((resolve) => {
            Query.create<TokenInfo>(`
                SELECT 
                    token_expiration,
                    token,
                    perm_level
                FROM users 
                WHERE 
                    token = $1 AND 
                    uuid = $2 AND 
                    token_expiration > now()
            `, [
                token,
                uuid
            ]).then(({ rowCount, rows: [ tokenInfo ] }) => {
                const date = new Date();
                const apiSettings = SETTINGS.get("api");

                // If the token is valid, check if it should be refreshed according to the API settings
                if (
                    rowCount && 
                    new Date(tokenInfo.token_expiration).setDate(
                        tokenInfo.token_expiration.getDate() - apiSettings.token_refresh_margin
                    ) <= date.getTime()
                ) {
                    // Update the date
                    date.setDate(date.getDate() + apiSettings.token_days_valid);

                    tokenInfo.token_expiration = date;
                    tokenInfo.token = new Token(4).toString();

                    Query.create<TokenInfo>(`
                        UPDATE users 
                        SET 
                            token = $1, 
                            token_expiration = $2 
                        WHERE uuid = $3
                    `, [
                        tokenInfo.token,
                        tokenInfo.token_expiration,
                        uuid
                    ]).then((newTokenInfo) => resolve(newTokenInfo.rows[0] ?? null)).catch(() => resolve(null));
                } else {
                    resolve(tokenInfo ?? null);
                }
            }).catch(() => resolve(null));
        });
    }

    /**
     * Validates if the user entry is authorized according to the required permission level
     * @param uuid The user UUID
     * @param token The user authorization token
     * @param requiredLevel The required permission level
     * @returns A promised boolean which says if the user has the correct permission level
     */
    public static async isAuthorized(uuid: string, token: string, requiredLevel: PermLevel): Promise<boolean>;
    /**
     * Validates if the provided level is authorized according to the required permission level
     * @param userLevel The user permission level
     * @param requiredLevel The required permission level
     * @returns A boolean which says if the user has the correct permission level
     */
    public static isAuthorized(userLevel: PermLevel, requiredLevel: PermLevel): boolean 
    public static isAuthorized(uuidOrUserLevel: string | PermLevel, tokenOrRequiredLevel: string | PermLevel, requiredLevel?: PermLevel): Promise<boolean> | boolean {
        if (typeof uuidOrUserLevel == "string" && typeof tokenOrRequiredLevel == "string" && requiredLevel != undefined) {
            return new Promise(async (resolve) => {
                const userLevel = (await this.getTokenInfo(uuidOrUserLevel, tokenOrRequiredLevel))?.perm_level ?? -1;

                resolve(userLevel != PermLevel.DISABLED && requiredLevel != PermLevel.DISABLED && userLevel >= requiredLevel);
            });
        } else if (typeof uuidOrUserLevel == "number" && typeof tokenOrRequiredLevel == "number" && requiredLevel == undefined) {
            return uuidOrUserLevel != PermLevel.DISABLED && tokenOrRequiredLevel != PermLevel.DISABLED && uuidOrUserLevel >= tokenOrRequiredLevel;
        } else {
            return false;
        }
    }
}