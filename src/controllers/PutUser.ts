import { Status, Token } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { UserResponse } from "../interfaces/responses/UserResponse";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Email } from "../utils/Email";
import { Password } from "../utils/Password";
import { PhoneNumber } from "../utils/PhoneNumber";
import { PostalCode } from "../utils/PostalCode";
import { Query } from "../utils/Query";
import { Username } from "../utils/Username";

/**
 * A register API controller which puts an user entry and returns the new user entry
 * 
 * **URL:** `api/v{version}/user`  
 * **Request method:** `PUT`  
 * **Returns:** `User`  
 * **Authorized:** `false`  
 * 
 * **Form body:**
 * 
 * - `username`: The username string
 * - `password`: The plain password string
 * - `email`: The email string
 * - `phone`: The phone number string
 * - `postal`: The postal code string
 */
export class PutUser extends Controller {

    constructor() {
        super("/user", RequestMethod.PUT);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Collecting all fields in a single object to use array tools for small and fast checks
        const fields = {
            username: new Username(request.body.username),
            password: new Password(request.body.password),
            email: new Email(request.body.email),
            phoneNumber: new PhoneNumber(request.body.phone),
            postalCode: new PostalCode(request.body.postal)
        };

        // Checking if every field is valid
        if (Object.values(fields).every((field) => field.validate())) {
            // Transforming all fields
            const processed = Object.fromEntries(Object.entries(fields).map(([ key, value ]) => [ key, value.transform() ]));
            
            // First making sure the username and email are unique
            Query.create("SELECT uuid FROM users WHERE username = $1 OR email = $2", [
                processed.username, 
                processed.email 
            ]).then(({ rowCount }) => {
                if (rowCount) {
                    this.respond(response, Status.CONFLICT, Conflict.IN_USE_ERROR);
                } else {
                    // Stores the date for normalized results
                    const date = new Date();
                    // Inserts a new user entry with a new token and expiration date and returns it afterwards
                    Query.create<User>(`
                        INSERT INTO users 
                        (
                            username, 
                            password_hash, 
                            email, 
                            phone, 
                            postal_code, 
                            token, 
                            token_expiration
                        ) VALUES (
                            $1, 
                            $2, 
                            $3, 
                            $4, 
                            $5, 
                            $6, 
                            $7
                        )
                        RETURNING *
                    `, [
                        processed.username,
                        processed.password,
                        processed.email,
                        processed.phoneNumber,
                        processed.postalCode,
                        new Token(4).toString(),
                        new Date(date.setDate(date.getDate() + SETTINGS.get("api").token_days_valid))
                    ]).then(({ rows: [ user ] }) => this.respond<UserResponse>(response, Status.CREATED, {
                        uuid: user.uuid,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        postalCode: user.postal_code,
                        permLevel: user.perm_level,
                        renting: user.renting,
                        token: user.token,
                        tokenExpiration: new Date(user.token_expiration).getTime()
                    })).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
                }
            }).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
        } else {
            // Some fields aren't correct
            this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}