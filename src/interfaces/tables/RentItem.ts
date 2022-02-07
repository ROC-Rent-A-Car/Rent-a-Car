import { TableBase } from "./TableBase";

export interface RentItem extends TableBase {
    rent: string,
    car: string,
    days: number,
    rent_from: Date,
    setup: boolean,
    price: number
}