import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { UserResponse } from "../interfaces/responses/UserResponse";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Password } from "../utils/Password";
import { Username } from "../utils/Username";

/**
 * A login API controller which returns the user entry
 * 
 * **URL:** `api/v{version}/login`  
 * **Request method:** `POST`  
 * **Returns:** `User`  
 * **Authorized:** `false`  
 * 
 * **Form body:**
 * 
 * - `username`: The user username
 * - `password`: The user plain password
 */
export class PostLogin extends Controller {

    constructor() {
        super("/login", RequestMethod.POST);
    }

    protected async request(request: request, response: response): Promise<void> {
        const username = new Username(request.body.username);
        const password = new Password(request.body.password);

        // Validate the fields
        if (username.validate() && password.validate()) {
            // Find a user which has the provided credentials
            this.login(request.ip, username.transform(), password.transform()).then(async (user) => {
                if (user) {
                    this.respond<UserResponse>(response, Status.OK, {
                        uuid: user.uuid,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        postalCode: user.postal_code,
                        permLevel: user.perm_level,
                        token: user.token,
                        tokenExpiration: new Date(user.token_expiration).getTime(),
                        houseNumber: user.house_number,
                    });
                } else {
                    this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_LOGIN);
                }
            }).catch(() => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS));
        } else {
            // Some fields were missing or weren't formatted correctly
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}