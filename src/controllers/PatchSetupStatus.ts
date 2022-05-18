import { Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
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
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields and has the correct permission level
        if (userId && token && this.isAuthorized(request.ip, userId, token, SETTINGS.get("api").car_edit_permission)) {
            // Validate the fields
            if (request.body.status) {
                Query.create("UPDATE rent_items SET setup = $1 WHERE uuid = $2", [
                    // Parsing the status bool string
                    request.body.status == "1" || request.body.status.toLowerCase() == "true",
                    request.params.itemId
                ]).then(
                    () => this.respond(response, Status.ACCEPTED)
                ).catch(
                    () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
                );
            } else {
                // Missing the status field                
                this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
            }
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.CONFLICT, Conflict.INVALID_AUTHORIZATION);
        }
    }
}