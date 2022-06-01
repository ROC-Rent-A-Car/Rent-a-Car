import { Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { Car } from "../interfaces/tables/Car";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A car deletion API controller which disables a car entry by uuid
 * 
 * **URL:** `api/v{version}/car/:carId`  
 * **Request method:** `DELETE`  
 * **Returns:** `void`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `carId`: The ID of the car entry which should be updated
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class DeleteCar extends Controller {

    constructor() {
        super("/car/:carId", RequestMethod.DELETE);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields and has the correct permission level
        if (userId && token && await this.isAuthorized(request.ip, userId, token, SETTINGS.get("api").car_creation_permission)) {
            // Check if a uuid was provided
            if (request.params.carId) {
                // Attempt to delete the entry
                Query.update<Car>({
                    disabled: true
                }, "cars", request.params.carId).then(
                    () => this.respond(response, Status.NO_CONTENT, Conflict.INVALID_AUTHORIZATION)
                ).catch(
                    () => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS)
                );
            } else {
                // Missing the uuid
                this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
            }
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}