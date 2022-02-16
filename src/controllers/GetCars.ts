import { JSONPrimitive, Status } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { CarResponse } from "../interfaces/responses/CarResponse";
import { Car } from "../interfaces/tables/Car";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Authorize } from "../utils/Authorize";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A car getter API controller which fetches all the cars which apply to a specified filter
 * 
 * **URL:** `api/v{version}/cars/:infoType/:uuid?`  
 * **Request method:** `GET`  
 * **Returns:** `Car[]`  
 * **Authorized:** `false`  
 * 
 * **URL fields:**
 * 
 * - `infoType`: The type of info which should be returned, this can be:
 *   - `top`: All the cars ordered by most rented
 *   - `available`: The currently available cars
 *   - `cheapest`: All the cars ordered by cheapest price
 *   - `expensive`: All the cars ordered by the most expensive price
 *   - `all`: All the cars without order
 */
export class GetCars extends Controller {

    constructor() {
        super("/cars/:infoType/:uuid?", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        const apiSettings = SETTINGS.get("api");
        const params: JSONPrimitive[] = [];
        let queryLogic: string | undefined;

        // Setting the query conditions
        switch (request.params.infoType.toLowerCase()) {
            case "top": {
                // Joins a count of all foreign refs and then orders it in a descending order and puts all nulls at the end 
                queryLogic = `
                    LEFT JOIN (
                        SELECT COUNT(uuid), car FROM rent_items GROUP BY car
                    ) as refs 
                        ON refs.car = cars.uuid 
                    ORDER BY refs.count DESC NULLS LAST
                `;
                break;
            }
            case "available": {
                // TODO: Check if the rent is still pending
                queryLogic = `
                    WHERE (
                        SELECT COUNT(uuid) 
                        FROM rent_items 
                        WHERE 
                            car = cars.uuid AND 
                            rent_from <= now() AND 
                            (rent_from::DATE + days)::TIMESTAMP >= now()
                    ) = 0
                `;
                params.push();
                break;
            }
            case "cheapest": {
                queryLogic = "ORDER BY cars.price ASC";
                break;
            }
            case "expensive": {
                queryLogic = "ORDER BY cars.price DESC";
                break;
            }
            case "all": {
                // Just use the default
                queryLogic = "";
                break;
            }
            case "recent": {
                // Parse the authorization header query
                const { userId, token } = new QueryParser(request.headers.authorization || "");
                const tokenInfo = await Authorize.getTokenInfo(userId, token);

                if (tokenInfo) {
                    queryLogic = "WHERE ";
                    params.push(
                        request.params.uuid && 
                        Authorize.isAuthorized(tokenInfo.perm_level, apiSettings.rent_history_permission) ?
                        request.params.uuid :
                        userId
                    );
                } else {

                }

                if (!tokenInfo) {

                } else if (request.params.uuid && Authorize.isAuthorized(tokenInfo.perm_level, apiSettings.rent_history_permission)) {
                    queryLogic = "";
                    params.push(request.params.uuid);
                } else {
                    queryLogic = "";
                    params.push(userId);
                }

                break;
            }
        }

        if (queryLogic) {
            Query.create<Car>(`SELECT cars.* FROM cars ${queryLogic}`, params).then(
                (cars) => this.respond<CarResponse[]>(response, Status.OK, cars.rows.map((car) => ({
                    uuid: car.uuid,
                    license: car.license,
                    brand: car.brand,
                    model: car.model,
                    price: Number(car.uuid),
                    image: car.image,
                    description: car.description
                })))
            ).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
        } else {
            // Not a valid info type so throw a conflict status
        this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS);
        }
    }
}