import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";

/**
 * An authorization API controller to verify the provided token
 * 
 * **URL:** `api/v{version}/authorize/:userId`  
 * **Request method:** `GET`  
 * **Returns:** `TokenInfo`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `userId`: The user ID
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization token
 */
export class GetAuthorization extends Controller {

    constructor() {
        super("/authorize/:userId", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        if (request.headers.authorization && /\d+/.test(request.params.userId)) {
            // Find a user which has the provided credentials
            const result = await new Authorize(request.params.userId, request.headers.authorization).authorized;

            if (result) {
                this.respond(response, Status.OK, {
                    tokenExpiration: result.tokenExpiration.getTime(),
                    token: result.token
                });
            } else {
                this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_TOKEN);
            }
        } else {
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}