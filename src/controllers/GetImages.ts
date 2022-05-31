import { readdirSync } from "fs";
import { join } from "path";
import { Status } from "std-node";
import { RequestMethod } from "../enums/RequestMethod";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";

/**
 * An image getter API controller which fetches all the stored images
 * 
 * **URL:** `api/v{version}/images`  
 * **Request method:** `GET`  
 * **Returns:** `string[]`  
 */
export class GetImages extends Controller {

    constructor() {
        super("/images", RequestMethod.GET);
    }

    protected async request(_: request, response: response): Promise<void> {
        // Sends all the images located in /static/resources
        this.respond<string[]>(response, Status.OK, readdirSync(
            join(__dirname, "../../static/resources")
        ));
    }
}