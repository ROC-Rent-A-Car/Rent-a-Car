import { JSONPrimitive, Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { CarResponse } from "../interfaces/responses/CarResponse";
import { Car } from "../interfaces/tables/Car";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Query } from "../utils/Query";

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
 *   - `unavailable`: The currently unavailable cars
 *   - `cheapest`: All the cars ordered by cheapest price
 *   - `expensive`: All the cars ordered by the most expensive price
 *   - `all`: All the cars without order
 *   - `specific`: A specific car by UUID
 * - `uuid`: The UUID of the car which should be returned
 * 
 * **Query fields:**
 * 
 * - `from`: only return cars which are available from this date
 * - `to`: only return cars which are available to this date
 */
export class GetCars extends Controller {

    constructor() {
        super("/cars/:infoType/:uuid?", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        const type = request.params.infoType.toLowerCase();
        const from = typeof request.query.from == "undefined" ? new Date() : new Date(Number(request.query.from));
        const to = new Date(Number(request.query.to));
        const hasTo = typeof request.query.to != "undefined";
        
        // Check if the query has valid date fields
        if (!isNaN(+from) && (!hasTo || (!isNaN(+to) && +to > +from))) {
            const params: (JSONPrimitive | Date)[] = [
                from,
                to
            ].slice(0, 1 + +hasTo);
            // Filters available cars in the specified time range
            const timeCondition = `cars.disabled = false AND (
                SELECT COUNT(uuid) 
                FROM rent_items
                WHERE rent_items.car = cars.uuid AND (
                    /* Starts in range */
                    (
                        (rent_items.rent_from::DATE - 3)::TIMESTAMP <= $1 AND
                        (rent_items.rent_from::DATE + rent_items.days + 1)::TIMESTAMP >= $1
                    /* Ends in range */
                    ) ${hasTo ? `OR (
                        (rent_items.rent_from::DATE - 3)::TIMESTAMP <= $2 AND
                        (rent_items.rent_from::DATE + rent_items.days + 1)::TIMESTAMP >= $2
                    /* Overlaps range */
                    ) OR (
                        (rent_items.rent_from::DATE - 3)::TIMESTAMP >= $1 AND
                        (rent_items.rent_from::DATE - 3)::TIMESTAMP <= $2
                    )` : ""}
                )
            ) = 0`;
            let queryLogic: string | undefined;

            // Setting the query conditions
            switch (type) {
                case "top": {
                    // Joins a count of all foreign refs and then orders it in a descending order and puts all nulls at the end 
                    queryLogic = `
                        LEFT JOIN (
                            SELECT COUNT(uuid), car FROM rent_items GROUP BY car
                        ) as refs 
                        ON refs.car = cars.uuid
                        WHERE ${timeCondition}
                        ORDER BY refs.count DESC NULLS LAST
                    `;
                    break;
                }
                case "available": {
                    queryLogic = `
                        WHERE ${timeCondition}
                    `;
                    break;
                }
                case "cheapest": {
                    queryLogic = `WHERE ${timeCondition} ORDER BY cars.price ASC`;
                    break;
                }
                case "expensive": {
                    queryLogic = `WHERE ${timeCondition} ORDER BY cars.price DESC`;
                    break;
                }
                case "all": {
                    // Just use the default
                    queryLogic = "WHERE cars.disabled = false";
                    params.splice(0, params.length);
                    break;
                }
                case "specific": {
                    params.splice(0, params.length);
                    params.push(request.params.uuid);
                    queryLogic = `WHERE cars.uuid = $1`;
                    break;
                }
            }

            if (typeof queryLogic != "undefined") {
                Query.create<Car>(`SELECT cars.* FROM cars ${queryLogic}`, params).then(
                    (cars) => this.respond<CarResponse[]>(response, Status.OK, cars.rows.map((car) => ({
                        uuid: car.uuid,
                        license: car.license,
                        brand: car.brand,
                        model: car.model,
                        price: Number(car.price),
                        image: car.image,
                        description: car.description
                    })))
                ).catch(() => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS));
            } else {
                // Not a valid info type so throw a bad request status
                this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
            }
        } else {
            this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
        }
    }
}