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
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        if (userId && token) {
            // Find a user which has the provided credentials
            const result = await Authorize.getTokenInfo(userId, token);

            if (result) {
                this.respond<TokenInfoResponse>(response, Status.OK, {
                    tokenExpiration: result.token_expiration.getTime(),
                    token: result.token,
                    permLevel: result.perm_level
                });
            } else {
                this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
            }
        } else {
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}