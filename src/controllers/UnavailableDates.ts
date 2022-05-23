import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { DateRangeResponse } from "../interfaces/responses/DateRangeResponse";
import { RentItem } from "../interfaces/tables/RentItem";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Query } from "../utils/Query";

/**
 * Gets all unavailable date ranges for a specified car
 * 
 * **URL:** `api/v{version}/unavailable/:uuid`  
 * **Request method:** `GET`  
 * **Returns:** `DateRange[]`  
 * **Authorized:** `false`  
 * 
 * **URL fields:**
 * 
 * - `uuid`: The UUID of the car which should be checked
 */
export class UnavailableDates extends Controller {

    constructor() {
        super("/unavailable/:uuid", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        Query.create<RentItem>(`
            SELECT * 
            FROM rent_items 
            WHERE car = $1 AND (rent_from > now() OR (rent_from::DATE + days)::TIMESTAMP > now())
        `, [
            request.params.uuid
        ]).then(({ rows }) => {
            this.respond<DateRangeResponse[]>(response, Status.OK, rows.map((row) => {
                const date = new Date(row.rent_from);

                return {
                    from: +date,
                    to: date.setDate(date.getDate() + row.days)
                };
            }));
        }).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
    }
}