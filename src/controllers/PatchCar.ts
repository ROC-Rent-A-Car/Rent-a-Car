import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A car update API controller which updates the specified fields in the car entry
 * 
 * **URL:** `api/v{version}/car/:carId`  
 * **Request method:** `Patch`  
 * **Returns:** `Car`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `carId`: The ID of the car entry which should be updated
 * 
 *  **Form body:**
 * 
 * All the following fields can be undefined
 * 
 * - `license`: The license string
 * - `brand`: The car brand string
 * - `model`: The car model string
 * - `price`: The price double
 * - `image`: The preview image url
 * - `description` The description text 
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization token
 */
export class PatchCar extends Controller {

    constructor() {
        super("/car/:carId", RequestMethod.PATCH);
    }

    protected request(_: request, response: response): void {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}