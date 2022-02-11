import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { PermLevel } from "../enums/PermLevel";
import { RequestMethod } from "../enums/RequestMethod";
import { Car } from "../interfaces/tables/Car";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A car update API controller which updates the specified fields in the car entry
 * 
 * **URL:** `api/v{version}/car/:carId`  
 * **Request method:** `Patch`  
 * **Returns:** `void`  
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
 * - `authorization`: The authorization query
 */
export class PatchCar extends Controller {

    constructor() {
        super("/car/:carId", RequestMethod.PATCH);
    }

    protected async request(request: request, response: response): Promise<void> {
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        if (userId && token && Authorize.isAuthorized(userId, token, PermLevel.MANAGER)) {
            Query.update<Car>({
                license: request.body.license,
                brand: request.body.brand,
                model: request.body.model,
                price: request.body.price,
                image: request.body.image,
                description: request.body.description,
            }, "cars", request.params.carId).then(
                () => this.respond(response, Status.ACCEPTED)
            ).catch(
                () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
            );
        } else {
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}