import { Status } from "std-node";
import { Conflict } from "../enums/Conflict";
import { PermLevel } from "../enums/PermLevel";
import { RequestMethod } from "../enums/RequestMethod";
import { RentItemResponse } from "../interfaces/responses/RentItemResponse";
import { Car } from "../interfaces/tables/Car";
import { Rent } from "../interfaces/tables/Rent";
import { RentItem } from "../interfaces/tables/RentItem";
import { User } from "../interfaces/tables/User";
import { Controller } from "../templates/Controller";
import { request } from "../types/request";
import { response } from "../types/response";
import { CheckItems } from "../utils/CheckItems";
import { Query } from "../utils/Query";
import { QueryParser } from "../utils/QueryParser";

/**
 * A register API controller which puts a rent item entry and returns the new rent item entry
 * 
 * **URL:** `api/v{version}/item`  
 * **Request method:** `PUT`  
 * **Returns:** `RentItem`  
 * **Authorized:** `true`  
 * 
 * **Form body:**
 * 
 * - `car`: The car UUID
 * - `days`: The amount of days the car should be rented
 * - `from`: The start timestamp of the rent
 * 
 * **Header fields:**
 * 
 * - `authorization`: The authorization query
 */
export class PutRentItem extends Controller {

    constructor() {
        super("/item", RequestMethod.PUT);
    }

    protected async request(request: request, response: response): Promise<void> {
        // Parse the authorization header query
        const { userId, token } = new QueryParser(request.headers.authorization || "");

        // Check if the authorization header has the required fields and has the correct permission level
        if (userId && token && this.isAuthorized(request.ip, userId, token, PermLevel.USER)) {
            const fromDate = new Date(request.body.from);
            const days = Number(request.body.days);
            
            if (
                request.body.car && 
                days > 0 && 
                !isNaN(+fromDate) &&
                CheckItems.isCarAvailable(
                    request.body.car, 
                    +fromDate, new Date(fromDate).setDate(fromDate.getDate() + days)
                )
            ) {
                Query.create<Rent>("INSERT INTO rents (\"user\") VALUES ($1) RETURNING *", [
                    userId
                ]).then(({ rows: [ rent ] }) => Query.create<Car>("SELECT * FROM cars WHERE uuid = $1", [ 
                    request.body.car 
                ]).then(({ rows: [ car ] }) => Query.create<RentItem>(`
                    INSERT INTO rent_items (
                        rent,
                        car,
                        days,
                        rent_from,
                        price
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    ) RETURNING *
                `, [
                    rent.uuid,
                    request.body.car,
                    days,
                    fromDate,
                    Number(car.price)
                ]).then(({ rows: [ item ] }) => Query.create<User>("SELECT * FROM users WHERE uuid = $1", [
                    userId
                ]).then(({ rows: [ user ] }) => this.respond<RentItemResponse>(response, Status.CREATED, {
                    uuid: item.uuid,
                    rent: {
                        uuid: rent.uuid,
                        pending: rent.pending,
                        pendingSince: new Date(rent.pending_since).getTime(),
                        user: {
                            uuid: user.uuid,
                            username: user.username,
                            email: user.email,
                            phone: user.phone,
                            postalCode: user.postal_code,
                            permLevel: user.perm_level,
                            token: user.token,
                            tokenExpiration: new Date(user.token_expiration).getTime(),
                            houseNumber: user.house_number,
                        }
                    },
                    car: {
                        ...car,
                        price: Number(car.price)
                    },
                    days: item.days,
                    setup: item.setup,
                    price: Number(item.price),
                    rentFrom: new Date(item.rent_from).getTime()
                })).catch(
                    () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
                )).catch(
                    () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
                )).catch(
                    () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
                )).catch(
                    () => this.respond(response, Status.CONFLICT, Conflict.INVALID_FIELDS)
                );
            }
        } else {
            // The authorization header was incorrect or the user didn't have the correct permission level
            this.respond(response, Status.CONFLICT, Conflict.INVALID_AUTHORIZATION);
        }
    }
}