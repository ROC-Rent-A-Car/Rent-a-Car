import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { PermLevel } from "../enums/PermLevel";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A setup status update API controller which toggles the setup status of the specified rent item
 * 
 * **URL:** `api/v{version}/setup/:itemId`  
 * **Request method:** `Patch`  
 * **Returns:** `void`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `itemId`: The ID of the rent item entry which should be updated
 * 
 *  **Form body:**
 * 
 * - `status`: The new status boolean
 * 
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class PatchSetupStatus extends Controller {

    constructor() {
        super("/setup/:itemId", RequestMethod.PATCH);
    }

    protected async request(request: request, response: response): Promise<void> {
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        if (userId && token && Authorize.isAuthorized(userId, token, PermLevel.EMPLOYEE)) {
            if (request.body.status) {
                const bool = request.body.status == "1" || request.body.status.toLowerCase() == "true";

                Query.create("UPDATE rent_items SET setup = $1 WHERE uuid = $2", [
                    bool,
                    request.params.itemId
                ]).then(() => this.respond(response, Status.ACCEPTED)).catch(() => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS));
            } else {                
                this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
            }
        } else {
            this.respond(response, Status.CONFLICT, Conflict.INVALID_AUTHORIZATION);
        }
    }
}