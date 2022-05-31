import { BetterObject, Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { APIObject } from "../interfaces/settings/APIObject";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { QueryParser } from "../utils/QueryParser";

/**
 * A permission getter API controller which fetches all the permissions accessible by the user
 * 
 * **URL:** `api/v{version}/permissions`  
 * **Request method:** `GET`  
 * **Returns:** `(keyof APIObject)[]`  
 * **Authorized:** `true`  
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class GetPermissions extends Controller {

    constructor() {
        super("/permissions", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields
        if (userId && token) {
            // Get info about the current user token
            const tokenInfo = await this.getTokenInfo(request.ip, userId, token);

            // Check if there was a token match
            if (tokenInfo) {
                // Get all permission settings and filter out the keys which have an equal or lower permission level than the user
                this.respond<(keyof APIObject)[]>(response, Status.OK, BetterObject.entries(SETTINGS.get("api"))
                    .filter(([ key, value ]) => key.endsWith("permission") && value <= tokenInfo.perm_level)
                    .map(([ key ]) => key));
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