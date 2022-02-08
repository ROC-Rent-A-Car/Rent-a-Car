import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A car getter API controller which fetches all the cars which apply to a specified filter
 * 
 * **URL:** `api/v{version}/items/:infoType`  
 * **Request method:** `GET`  
 * **Returns:** `RentItem[]` (populated)  
 * **Authorized:** partially `true`  
 * 
 * **URL fields:**
 * 
 * - `infoType`: The type of info which should be returned, this can be:
 *   - `pending`: All the rent items which are currently pending
 *   - `setup`: All the rent items which should be setup during that day
 *   - `overdue`: All the rent items which aren't returned yet
 *   - as rent UUID: Gets all rent items which are a foreign reference to the specified rent UUID
 *   - as car UUID: Gets all rent items which are a foreign reference to the specified car UUID
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization token, not required on unauthorized info types
 */
export class GetRentItems extends Controller {

    constructor() {
        super("/items/:infoType", RequestMethod.GET);
    }

    protected request(_: request, response: response): void {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}