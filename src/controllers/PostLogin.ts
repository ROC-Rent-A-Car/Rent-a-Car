import { Status } from "std-node";
import { DB } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Password } from "../utils/Password";
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

    protected request(request: request, response: response): void {
        const username = new Username(request.body.username);
        const password = new Password(request.body.password);

        if (username.validate() && password.validate() && /\d+/.test(request.params.userId)) {
            // Find a user which has the provided credentials
            DB.connect(async (error, client, release) => {
                if (error) {
                    this.respond(response, Status.INTERNAL_SERVER_ERROR);

                    throw error;
                } else {
                    const user = (await client.query<User>("SELECT * FROM users WHERE uuid = $1 AND username = $2 AND password_hash = $3", [
                        request.params.userId,
                        username.transform(),
                        password.transform()
                    ])).rows[0];

                    if (user) {
                        this.respond(response, Status.OK, {
                            username: user.username,
                            email: user.email,
                            phone: user.phone,
                            postalCode: user.postal_code,
                            permLevel: user.perm_level,
                            renting: user.renting,
                            token: user.token,
                            tokenExpiration: user.token_expiration.getTime()
                        });
                    } else {
                        this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_LOGIN);
                    }
                }

                release();
            });
        } else {
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}