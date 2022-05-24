import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { DateRangeResponse } from "../interfaces/responses/DateRangeResponse";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { CheckItems } from "../utils/CheckItems";

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
export class GetUnavailableDates extends Controller {

    constructor() {
        super("/unavailable/:uuid", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        CheckItems.getCarHiredDateRanges(request.params.uuid).then(
            (ranges) => this.respond<DateRangeResponse[]>(response, Status.OK, ranges)
        ).catch(() => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS));
    }
}