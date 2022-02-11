import { Token } from "std-node";
import { SETTINGS } from "..";
import { PermLevel } from "../enums/PermLevel";
import { TokenInfo } from "../interfaces/tables/TokenInfo";
import { Query } from "./Query";

export class Authorize {
    
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
                    uuid::text = $2 AND 
                    token_expiration > now()
            `, [
                token,
                uuid
            ]).then((tokenInfos) => {
                const date = new Date();
                const apiSettings = SETTINGS.get("api");

                // If the token is valid, check if it should be refreshed according to the API settings
                if (
                    tokenInfos.rowCount && 
                    new Date(tokenInfos.rows[0].token_expiration).setDate(
                        tokenInfos.rows[0].token_expiration.getDate() - apiSettings.token_refresh_margin
                    ) <= date.getTime()
                ) {
                    date.setDate(date.getDate() + apiSettings.token_days_valid);

                    tokenInfos.rows[0].token_expiration = date;
                    tokenInfos.rows[0].token = new Token(4).toString();

                    Query.create<TokenInfo>(`
                        UPDATE users 
                        SET 
                            token = $1, 
                            token_expiration = $2 
                        WHERE uuid = $3
                    `, [
                        tokenInfos.rows[0].token,
                        tokenInfos.rows[0].token_expiration,
                        uuid
                    ]).then((newTokenInfo) => resolve(newTokenInfo.rows[0] ?? null)).catch(() => resolve(null));
                } else {
                    resolve(tokenInfos.rows[0] ?? null);
                }
            }).catch(() => resolve(null));
        });
    }

    public static async isAuthorized(uuid: string, token: string, level: PermLevel): Promise<boolean> {
        return ((await this.getTokenInfo(uuid, token))?.perm_level || -1) >= level;
    }
}