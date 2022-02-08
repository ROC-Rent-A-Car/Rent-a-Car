import { Status } from "std-node";
import { DB } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * A car getter API controller which fetches all the cars which apply to a specified filter
 * 
 * **URL:** `api/v{version}/cars/:infoType`  
 * **Request method:** `GET`  
 * **Returns:** `Car[]`  
 * **Authorized:** partially `true`  
 * 
 * **URL fields:**
 * 
 * - `infoType`: The type of info which should be returned, this can be:
 *   - `top`: All the cars ordered by most rented
 *   - `available`: The currently available cars
 *   - `all`: All the cars without order
 *   - `cheapest`: All the cars ordered by cheapest price
 *   - `expensive`: All the cars ordered by the most expensive price
 *   - `setup` (authorized): All cars which should be setup that day
 *   - `recent` (authorized): All the recent rents from the user
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization token, not required on unauthorized info types
 */
export class GetCars extends Controller {

    constructor() {
        super("/cars/:infoType", RequestMethod.GET);
    }

    protected request(request: request, response: response): void {
        let queryLogic: string;

        // Setting the query conditions
        switch (request.params.infoType.toLowerCase()) {
            case "top":
                // Joins a count of all foreign refs and then orders it in a descending order and puts all nulls at the end 
                queryLogic = "LEFT JOIN (SELECT COUNT(uuid), car FROM rent_items GROUP BY car) as refs ON refs.car = cars.uuid ORDER BY refs.count DESC NULLS LAST";
                break;
            case "available":
                // TODO: Check if the rent is still pending
                queryLogic = "WHERE (SELECT COUNT(uuid) FROM rent_items WHERE car = cars.uuid AND rent_from <= now() AND (rent_from::DATE + days)::TIMESTAMP >= now()) = 0";
                break;
            case "all":
                // Just use the default
                break;
            default:
                // Not a valid info type so throw a conflict status
                return this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }

        DB.connect(async (error, client, release) => {
            if (error) {
                this.respond(response, Status.INTERNAL_SERVER_ERROR);

                throw error;
            } else {
                // Adding queryLogic behind it since it's not a user input and contains executable SQL
                this.respond(response, Status.OK, (await client.query("SELECT cars.* FROM cars " + (queryLogic || ""))).rows);
            }

            release();
        });
    }
}