import { Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { UserResponse } from "../interfaces/responses/UserResponse";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A user getter API controller which fetches all the users
 * 
 * **URL:** `api/v{version}/users`  
 * **Request method:** `GET`  
 * **Returns:** `User[]`  
 * **Authorized:** `true`  
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class GetUsers extends Controller {

    constructor() {
        super("/users", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields and is authorized
        if (userId && token && Authorize.isAuthorized(userId, token, SETTINGS.get("api").user_view_permission)) {
            Query.create<User>("SELECT users.* FROM users").then(
                (users) => this.respond<UserResponse[]>(response, Status.OK, users.rows.map((user) => ({
                    uuid: user.uuid,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    postalCode: user.postal_code,
                    permLevel: user.perm_level
                })))
            ).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.CONFLICT, Conflict.INVALID_AUTHORIZATION);
        }
    }
}