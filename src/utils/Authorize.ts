import { Token } from "std-node";
import { DB, SETTINGS } from "..";
import { TokenInfo } from "../interfaces/tables/TokenInfo";

export class Authorize {

    /**
     * The authorization promise which will be null if it's invalid/there was an error or have the token info
     */
    public readonly authorized: Promise<TokenInfo | null>;
    
    /**
     * Tries to select the token info of the provided user, this will return null if the provided info isn't valid
     * @param uuid The user UUID
     * @param token The user authorization token
     */
    constructor(uuid: string, token: string) {
        this.authorized = new Promise((resolve) => DB.connect(async (error, client, release) => {
            if (error) {
                resolve(null);

                throw error;
            } else {
                const tokenInfo = (await client.query<TokenInfo>(`
                    SELECT 
                        token_expiration as "tokenExpiration",
                        token
                    FROM users 
                    WHERE 
                        token = $1 AND 
                        uuid::text = $2 AND 
                        token_expiration > now()
                `, [
                    token,
                    uuid
                ])).rows[0] ?? null;
                const date = new Date();
                
                // If the token was valid, check if it should be refreshed according to the API settings
                if (tokenInfo && new Date(tokenInfo.tokenExpiration).setDate(
                    tokenInfo.tokenExpiration.getDate() - SETTINGS.get("api").token_refresh_margin
                ) <= date.getTime()) {
                    date.setDate(date.getDate() + SETTINGS.get("api").token_days_valid);

                    tokenInfo.tokenExpiration = date;
                    tokenInfo.token = new Token(4).toString();

                    await client.query("UPDATE users SET token = $1, token_expiration = $2 WHERE uuid = $3", [
                        tokenInfo.token,
                        tokenInfo.tokenExpiration,
                        uuid
                    ]);
                }

                resolve(tokenInfo);
            }

            release();
        }));
    }
}