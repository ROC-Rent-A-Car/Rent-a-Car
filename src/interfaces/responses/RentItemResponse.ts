import { TableBase } from "../tables/TableBase";
import { CarResponse } from "./CarResponse";
import { RentResponse } from "./RentResponse";

export interface RentItemResponse extends TableBase {
    rent: RentResponse,
    car: CarResponse,
    days: number,
    rentFrom: number,
    setup: boolean,
    price: number
}