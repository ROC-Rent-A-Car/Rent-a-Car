import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A setup status update API controller which toggles the setup status of the specified rent item
 * 
 * **URL:** `api/v{version}/setup/:itemId`  
 * **Request method:** `Patch`  
 * **Returns:** `RentItem` (populated)  
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
 * **Header fields:**
 * 
 * - `authorization`: The authorization token
 */
export class PatchSetupStatus extends Controller {

    constructor() {
        super("/setup/:itemId", RequestMethod.PATCH);
    }

    protected request(_: request, response: response): void {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}