import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { TokenInfoResponse } from "../interfaces/responses/TokenInfoResponse";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { QueryParser } from "../utils/QueryParser";

/**
 * An authorization API controller to verify the provided token
 * 
 * **URL:** `api/v{version}/authorize`  
 * **Request method:** `GET`  
 * **Returns:** `TokenInfo`  
 * **Authorized:** `true`  
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class GetAuthorization extends Controller {

    constructor() {
        super("/authorize", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields
        if (userId && token) {
            // Get info about the current user token
            const tokenInfo = await Authorize.getTokenInfo(userId, token);

            // Check if there was a token match
            if (tokenInfo) {
                this.respond<TokenInfoResponse>(response, Status.OK, {
                    tokenExpiration: tokenInfo.token_expiration.getTime(),
                    token: tokenInfo.token,
                    permLevel: tokenInfo.perm_level
                });
            } else {
                // The authorization wasn't valid
                this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
            }
        } else {
            // The authorization header was incorrect
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}