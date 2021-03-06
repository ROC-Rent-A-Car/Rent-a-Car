import { JSONPrimitive, Status, BetterObject, callback } from "std-node";
import { SETTINGS } from "..";
import { Conflict } from "../enums/Conflict";
import { RequestMethod } from "../enums/RequestMethod";
import { RentItemResponse } from "../interfaces/responses/RentItemResponse";
import { RentItem } from "../interfaces/tables/RentItem";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A rent item getter API controller which fetches all the rent items which apply to a specified filter
 * 
 * **URL:** `api/v{version}/items/:infoType/:uuid?`  
 * **Request method:** `GET`  
 * **Returns:** `RentItem[]` (populated)  
 * **Authorized:** `true`  
 * 
 * **URL fields:**
 * 
 * - `infoType`: The type of info which should be returned, this can be:
 *   - `pending`: All the rent items which are currently pending
 *   - `setup`: All the rent items which should be setup during that day
 *   - `overdue`: All the rent items which aren't returned yet
 *   - `user`: With optionally user UUID, Gets all rent items which were recently hired
 *   - `rent`: With rent UUID, Gets all rent items which are a foreign reference to the specified rent UUID
 *   - `car`: With car UUID, Gets all rent items which are a foreign reference to the specified car UUID
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class GetRentItems extends Controller {

    constructor() {
        super("/items/:infoType/:uuid?", RequestMethod.GET);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields
        if (userId && token) {
            // Get info about the current user token
            const tokenInfo = await this.getTokenInfo(request.ip, userId, token);

            // Check if there was a token match
            if (tokenInfo) {
                const normalInfoType = request.params.infoType?.toLowerCase();
                const { 
                    rent_history_permission, 
                    rent_administration_permission, 
                    max_pending 
                } = SETTINGS.get("api");
                const params: JSONPrimitive[] = [];
                const history: BetterObject<callback<string>> = {
                    user: () => {
                        // Gets all rent items from a user entry
                        params.push(request.params.uuid);

                        return "r_u.user = $1";
                    },
                    rent: () => {
                        // Gets all rent items from a rent entry
                        params.push(request.params.uuid);
                        
                        return "ri.rent = $1";
                    },
                    car: () => {
                        // Gets all rent items from a car entry
                        params.push(request.params.uuid);
                        
                        return "ri.car = $1";
                    }
                };
                const administrative: BetterObject<callback<string>> = {
                    pending: () => {
                        params.push(max_pending);
                        
                        // Gets all pending items which haven't expired
                        return "r_u.pending = true AND (r_u.pending_since::DATE + ($1)::INTEGER)::TIMESTAMP > now()";
                    },
                    setup: () => {
                        // Gets all items which should be set up on the current date
                        return "r_u.pending = false AND ri.setup = false AND ri.rent_from::DATE = CURRENT_DATE"
                    },
                    overdue: () => {
                        // Gets all items which should've been returned
                        return "r_u.pending = false AND (ri.rent_from::DATE + ri.days)::TIMESTAMP <= now() AND ri.returned = FALSE";
                    }
                };
                let additionalLogic: string | undefined;

                if (
                    request.params.uuid && 
                    normalInfoType in history && 
                    this.isAuthorized(tokenInfo.perm_level, rent_history_permission)
                ) {
                    additionalLogic = history[normalInfoType]();
                } else if (
                    normalInfoType in administrative && 
                    this.isAuthorized(tokenInfo.perm_level, rent_administration_permission)
                ) {
                    additionalLogic = administrative[normalInfoType]();
                } else {
                    switch (normalInfoType) {
                        case "pending": {
                            // Gets all pending items which haven't expired from the user
                            additionalLogic = `
                                r_u.user = $1 AND 
                                r_u.pending = true AND 
                                (r_u.pending_since::DATE + ($2)::INTEGER)::TIMESTAMP > now()
                            `;
                            params.push(userId, max_pending);
                            break;
                        }
                        case "rent": {
                            // Gets all rent items from a rent entry from the user which was used as well
                            if (request.params.uuid) {
                                additionalLogic = "r_u.pending = false AND r_u.user = $1 AND ri.rent = $2";
                                params.push(userId, request.params.uuid);
                            }
                            break;
                        }
                        case "user": {
                            additionalLogic = `
                                r_u.user = $1 AND (
                                    SELECT COUNT(uuid) FROM cars WHERE cars.uuid = ri.car AND cars.disabled = true
                                ) = 0
                            `;
                            params.push(userId);
                            break;
                        }
                    }
                }

                if (additionalLogic) {
                    Query.create<RentItem>(`
                        SELECT 
                            ri.*,
                            row_to_json(c.*) as "carObject",
                            row_to_json(r_u.*) as "rentObject"
                        FROM rent_items as ri
                        INNER JOIN cars as c
                            ON  ri.car = c.uuid
                        INNER JOIN (
                            SELECT 
                                r.*,
                                row_to_json(u.*) as "userObject"
                            FROM rents as r
                            INNER JOIN users as u
                                ON r.user = u.uuid 
                        ) as r_u
                            ON ri.rent = r_u.uuid
                        WHERE ${additionalLogic}
                        ORDER BY ri.rent_from DESC
                    `, params).then(({ rows }) => this.respond<RentItemResponse[]>(response, Status.OK, rows.map((item) => ({
                        uuid: item.uuid,
                        days: item.days,
                        rentFrom: new Date(item.rent_from).getTime(),
                        setup: item.setup,
                        price: Number(item.price),
                        rent: {
                            uuid: item.rentObject.uuid,
                            pending: item.rentObject.pending,
                            pendingSince: new Date(item.rentObject.pending_since).getTime(),
                            user: {
                                uuid: item.rentObject.userObject.uuid,
                                username: item.rentObject.userObject.username,
                                email: item.rentObject.userObject.email,
                                phone: item.rentObject.userObject.phone,
                                postalCode: item.rentObject.userObject.postal_code,
                                permLevel: item.rentObject.userObject.perm_level,
                                token: item.rentObject.userObject.token,
                                tokenExpiration: new Date(item.rentObject.userObject.token_expiration).getTime(),
                                houseNumber: item.rentObject.userObject.house_number
                            }
                        },
                        car: {
                            uuid: item.carObject.uuid,
                            license: item.carObject.license,
                            brand: item.carObject.brand,
                            model: item.carObject.model,
                            price: Number(item.carObject.price),
                            image: item.carObject.image,
                            description: item.carObject.description
                        }
                    })))).catch(() => this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS));
                } else {
                    // The logic wasn't set which means either an info type outside the permission level or an invalid type was requested
                    this.respond(response, Status.BAD_REQUEST, Conflict.INVALID_FIELDS);
                }
            } else {
                // The authorization wasn't valid
                this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
            }
        } else {
            // The authorization header was incorrect
            this.respond(response, Status.UNAUTHORIZED, Conflict.INVALID_AUTHORIZATION);
        }
    }
}