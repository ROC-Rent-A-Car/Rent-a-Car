import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

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
        super("/pending/:rentId", RequestMethod.PATCH);
    }

    protected async request(_: request, response: response): Promise<void> {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}