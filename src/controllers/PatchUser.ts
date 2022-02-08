import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A car update API controller which updates the specified fields in the car entry
 * 
 * **URL:** `api/v{version}/user/:userId`  
 * **Request method:** `Patch`  
 * **Returns:** `User`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `userId`: The ID of the user entry which should be updated
 * 
 *  **Form body:**
 * 
 * All the following fields can be undefined
 * 
 * - `username`: The username string
 * - `password`: The plain password string
 * - `email`: The email string
 * - `phone`: The phone number string
 * - `postal`: The postal code string
 * - `permLevel` The permission level number 
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization token
 */
export class PatchUser extends Controller {

    constructor() {
        super("/user/:userId", RequestMethod.PATCH);
    }

    protected request(_: request, response: response): void {
        this.respond(response, Status.NOT_IMPLEMENTED);
    }
}