import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { PermLevel } from "../enums/PermLevel";
import { RequestMethod } from "../enums/RequestMethod";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { Email } from "../utils/Email";
import { Password } from "../utils/Password";
import { PhoneNumber } from "../utils/PhoneNumber";
import { PostalCode } from "../utils/PostalCode";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A car update API controller which updates the specified fields in the car entry
 * 
 * **URL:** `api/v{version}/user/:overwriteId?`  
 * **Request method:** `Patch`  
 * **Returns:** `User`  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `overwriteId`: The ID of the user entry which should be updated
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
 * - `authorization`: The authorization query
 */
export class PatchUser extends Controller {

    constructor() {
        super("/user/:overwriteId?", RequestMethod.PATCH);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields
        if (userId && token) {
            // Get info about the current user token
            const tokenInfo = await Authorize.getTokenInfo(userId, token);

            if (!tokenInfo) {
                // The authorization wasn't valid
                this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
            } else if (tokenInfo.perm_level == PermLevel.MANAGER && request.params.overwriteId) {
                // If there's an ID overwrite it's only used to overwrite the permission level
                Query.update<User>({
                    perm_level: request.body.permLevel
                }, "users", request.params.overwriteId)
            } else {
                const password = request.body.password ? new Password(request.body.password) : undefined;
                const email = request.body.password ? new Email(request.body.email) : undefined;
                const phone = request.body.password ? new PhoneNumber(request.body.phone) : undefined;
                const postal = request.body.password ? new PostalCode(request.body.postal) : undefined;

                // A XOR ish system which becomes automatically true if the variable is undefined but remails false if validate returns false
                if ((password?.validate() ?? true) && (email?.validate() ?? true) && (phone?.validate() ?? true) && (postal?.validate() ?? true)) {
                    Query.update<User>({
                        username: request.body.username,
                        password_hash: password?.transform(),
                        email: email?.transform(),
                        phone: phone?.transform(),
                        postal_code: postal?.transform()
                    }, "users", userId);
                } else {
                    // If one fails just assume the request is invalid
                    this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
                }
            }
        } else {
            // The authorization header was incorrect
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}