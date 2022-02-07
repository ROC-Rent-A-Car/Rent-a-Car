import { Status } from "std-node";
import { Extension } from "../decorators/Extension";
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
 * **Request method:** `POST`  
 * **Returns:** `PermLevel`  
 * 
 * **URL fields:**
 * 
 * - `userId`: The user ID
 * 
 * **Post fields:**
 * 
 * - `token`: The authorization token
 */
@Extension
export class PostAuthorization extends Controller {

    constructor() {
        super("/authorize/:userId", RequestMethod.POST);
    }

    protected async request(request: request, response: response): Promise<void> {
        if (request.body.token && /\d+/.test(request.params.userId)) {
            // Find a user which has the provided credentials
            const result = await new Authorize(request.params.userId, request.body.token).authorized;

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