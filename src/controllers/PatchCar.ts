import { BetterObject, Status } from "std-node";
import { DB } from "..";
import { Conflict } from "../enums/Conflict";
import { PermLevel } from "../enums/PermLevel";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { QueryParser } from "../utils/QueryParser";

/**
 * A car update API controller which updates the specified fields in the car entry
 * 
 * **URL:** `api/v{version}/car/:carId`  
 * **Request method:** `Patch`  
 * **Returns:** `Car`  
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

    protected request(request: request, response: response): void {
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        if (userId && token && Authorize.isAuthorized(userId, token, PermLevel.MANAGER)) {
            const entries = BetterObject.entries({
                license: request.body.license,
                brand: request.body.brand,
                model: request.body.model,
                price: request.body.price,
                image: request.body.image,
                description: request.body.description,
            }).filter(([ _, value ]) => value == undefined);

            if (entries.length) {
                DB.connect(async (error, client, release) => {
                    if (error) {
                        this.respond(response, Status.INTERNAL_SERVER_ERROR);

                        throw error;
                    } else {
                        client.query(`
                            UPDATE cars 
                            SET ${entries.map(([ key ], index) => `${key} = $${index + 2}`)} 
                            WHERE uuid = $1
                        `, [ request.params.carId, ...entries.map(([ _, value ]) => value) ]);
                    }

                    release();
                });
            } else {
                this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
            }
        } else {
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}