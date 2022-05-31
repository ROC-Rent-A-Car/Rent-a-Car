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
 * A rent pending status update API controller which toggles the setup status of the specified rent item
 * 
 * **URL:** `api/v{version}/pending/:rentId`  
 * **Request method:** `Patch`  
 * **Returns:** `void`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `rentId`: The ID of the rent entry which should be updated
 * 
 *  **Form body:**
 * 
 * - `status`: The new status boolean
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class PatchRentStatus extends Controller {

    constructor() {
        // TODO: Once payment methods are implemented, it should be required by this endpoint to verify that the user payed for the rent
        super("/pending/:rentId", RequestMethod.PATCH);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields
        if (userId && token) {
            // Validate the fields
            if (request.body.status) {
                // Get info about the current user token
                const tokenInfo = await this.getTokenInfo(request.ip, userId, token);

                // Check if there was a token match
                if (tokenInfo) {
                    let query = "UPDATE rents SET pending = $1 WHERE uuid = $2";
                    const params = [
                        // Parsing the status bool string
                        request.body.status == "1" || request.body.status.toLowerCase() == "true",
                        request.params.itemId
                    ];

                    if (!this.isAuthorized(tokenInfo.perm_level, SETTINGS.get("api").rent_status_toggle_permission)) {
                        query += " AND user = $3";
                        
                        params.push(userId);
                    }

                    Query.create(query, params).then(
                        () => this.respond(response, Status.ACCEPTED)
                    ).catch(
                        () => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS)
                    );
                } else {
                    // The authorization wasn't valid
                    this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
                }
            } else {
                // Missing the status field                
                this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
            }
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}