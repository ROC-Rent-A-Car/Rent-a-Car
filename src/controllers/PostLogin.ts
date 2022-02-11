import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { UserResponse } from "../interfaces/responses/UserResponse";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Password } from "../utils/Password";
import { Query } from "../utils/Query";
import { Username } from "../utils/Username";

/**
 * A login API controller which returns the user entry
 * 
 * **URL:** `api/v{version}/login/:userId`  
 * **Request method:** `POST`  
 * **Returns:** `User`  
 * **Authorized:** `false`  
 * 
 * **URL fields:**
 * 
 * - `userId`: The user ID
 * 
 * **Form body:**
 * 
 * - `username`: The user username
 * - `password`: The user plain password
 */
export class PostLogin extends Controller {

    constructor() {
        super("/login/:userId", RequestMethod.POST);
    }

    protected async request(request: request, response: response): Promise<void> {
        const username = new Username(request.body.username);
        const password = new Password(request.body.password);

        if (username.validate() && password.validate() && /\d+/.test(request.params.userId)) {
            // Find a user which has the provided credentials
            Query.create<User>(`
                SELECT * 
                FROM users 
                WHERE 
                    uuid = $1 AND 
                    username = $2 AND 
                    password_hash = $3
            `, [
                request.params.userId,
                username.transform(),
                password.transform()
            ]).then((users) => {
                if (users.rowCount) {
                    this.respond<UserResponse>(response, Status.OK, {
                        uuid: users.rows[0].uuid,
                        username: users.rows[0].username,
                        email: users.rows[0].email,
                        phone: users.rows[0].phone,
                        postalCode: users.rows[0].postal_code,
                        permLevel: users.rows[0].perm_level,
                        renting: users.rows[0].renting,
                        token: users.rows[0].token,
                        tokenExpiration: new Date(users.rows[0].token_expiration).getTime()
                    });
                } else {
                    this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_LOGIN);
                }
            }).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
        } else {
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}