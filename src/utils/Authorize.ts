import { DevConsole, Token } from "std-node";
import { SETTINGS } from "..";
import { PermLevel } from "../enums/PermLevel";
import { TokenInfo } from "../interfaces/tables/TokenInfo";
import { User } from "../interfaces/tables/User";
import { Query } from "./Query";

export class Authorize {
    
    /**
     * Authorizes the user login while refreshing the token if needed
     * @param ip The request IP for monitoring purposes
     * @param username The user's username
     * @param passwordHash The user's password hash
     * @returns 
     */
    public login(ip: string, username: string, passwordHash: string): Promise<User | null> {
        const date = new Date();

        date.setDate(date.getDate() + SETTINGS.get("api").token_days_valid);

        return new Promise((resolve, reject) => {
            Query.create<User>(`
                UPDATE users 
                SET 
                    token = $1, 
                    token_expiration = $2
                WHERE 
                    username = $3 AND 
                    password_hash = $4
                RETURNING *
            `, [
                new Token(4).toString(),
                date,
                username,
                passwordHash
            ]).then(({ rowCount, rows: [ userInfo ] }) => {
                if (rowCount) {
                    resolve(userInfo);
                } else {
                    DevConsole.warn("\x1b[34m%s\x1b[0m failed to log in on \x1b[34m%s\x1b[0m", ip, username);
                    resolve(null);
                }
            }).catch(reject);
        });
    }
    
    /**
     * Tries to select the token info of the provided user, this will return null if the provided info isn't valid
     * @param ip The request IP for monitoring purposes
     * @param uuid The user UUID
     * @param token The user authorization token
     * @returns The authorization promise which will be null if it's invalid/there was an error or have the token info
     */
    public getTokenInfo(ip: string, uuid: string, token: string): Promise<TokenInfo | null> {
        return new Promise((resolve) => {
            Query.create<TokenInfo>(`
                SELECT
                    uuid,
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

                // Check if the token is valid
                if (rowCount) {
                    tokenInfo.token_expiration = new Date(tokenInfo.token_expiration);
                    // If the token is valid, check if it should be refreshed according to the API settings
                    if (tokenInfo.token_expiration.setDate(
                        tokenInfo.token_expiration.getDate() - apiSettings.token_refresh_margin
                    ) <= date.getTime()) {
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
                        resolve(tokenInfo);
                    }
                } else {
                    DevConsole.warn("\x1b[34m%s\x1b[0m failed to log in on \x1b[34m%s\x1b[0m", ip, uuid);

                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }

    /**
     * Validates if the user entry is authorized according to the required permission level
     * @param ip The request IP for monitoring purposes
     * @param uuid The user UUID
     * @param token The user authorization token
     * @param requiredLevel The required permission level
     * @returns A promised boolean which says if the user has the correct permission level
     */
    public async isAuthorized(ip: string, uuid: string, token: string, requiredLevel: PermLevel): Promise<boolean>;
    /**
     * Validates if the provided level is authorized according to the required permission level
     * @param userLevel The user permission level
     * @param requiredLevel The required permission level
     * @returns A boolean which says if the user has the correct permission level
     */
    public isAuthorized(userLevel: PermLevel, requiredLevel: PermLevel): boolean 
    public isAuthorized(
        ipOrUserLevel: string | PermLevel,
        uuidOrRequiredLevel: string | PermLevel, 
        token?: string, 
        requiredLevel?: PermLevel
    ): Promise<boolean> | boolean {
        if (typeof ipOrUserLevel == "string" && typeof uuidOrRequiredLevel == "string" && token && requiredLevel) {
            return new Promise(async () => this.isAuthorized((await this.getTokenInfo(
                ipOrUserLevel,
                uuidOrRequiredLevel,
                token
            ))?.perm_level ?? PermLevel.DISABLED, requiredLevel));
        } else if (typeof ipOrUserLevel == "number" && typeof uuidOrRequiredLevel == "number") {
            return ipOrUserLevel != PermLevel.DISABLED && 
                uuidOrRequiredLevel != PermLevel.DISABLED &&
                ipOrUserLevel >= uuidOrRequiredLevel;
        } else {
            return false;
        }
    }
}