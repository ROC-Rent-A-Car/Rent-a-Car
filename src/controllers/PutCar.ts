import { Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { CarResponse } from "../interfaces/responses/CarResponse";
import { Car } from "../interfaces/tables/Car";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A register API controller which puts a car entry and returns the new car entry
 * 
 * **URL:** `api/v{version}/car`  
 * **Request method:** `PUT`  
 * **Returns:** `Car`  
 * **Authorized:** `true`  
 * 
 * **Form body:**
 * 
 * - `license`: The license string
 * - `brand`: The car brand string
 * - `model`: The car model string
 * - `price`: The price double
 * - `image`: The preview image url
 * - `description`: The description text
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class PutCar extends Controller {

    constructor() {
        super("/car", RequestMethod.PUT);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields and has the correct permission level
        if (userId && token && this.isAuthorized(request.ip, userId, token, SETTINGS.get("api").car_creation_permission)) {
            if (
                request.body.license && 
                request.body.brand && 
                request.body.model && 
                Number(request.body.price) && 
                request.body.image && 
                request.body.description
            ) {
                Query.create<Car>(`
                    INSERT INTO cars (
                        license,
                        brand,
                        model,
                        price,
                        image,
                        description
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    ) RETURNING *
                `, [
                    request.body.license,
                    request.body.brand,
                    request.body.model,
                    request.body.price,
                    request.body.image,
                    request.body.description
                ]).then(({ rows: [ car ] }) => this.respond<CarResponse>(response, Status.CREATED, {
                    uuid: car.uuid,
                    license: car.license,
                    brand: car.brand,
                    model: car.model,
                    price: Number(car.price),
                    image: car.image,
                    description: car.description
                }));
            } else {
                // Missing some fields
                this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
            }
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}