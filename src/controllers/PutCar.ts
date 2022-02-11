import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A register API controller which puts an user entry and returns the new user entry
 * 
 * **URL:** `api/v{version}/car`  
 * **Request method:** `PUT`  
 * **Returns:** `Car`  
 * **Authorized:** `true`  
 * 
 * **Form body:**
 * 
 * - `license`: The license string
 * - `brand`: The car brand string
 * - `model`: The car model string
 * - `price`: The price double
 * - `image`: The preview image url
 * - `description`: The description text
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class PutCar extends Controller {

    constructor() {
        super("/car", RequestMethod.PUT);
    }

    protected async request(_: request, response: response): Promise<void> {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}