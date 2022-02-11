import { Car } from "./Car";
import { Rent } from "./Rent";
import { TableBase } from "./TableBase";

export interface RentItem extends TableBase {
    rent: string,
    rentObject: Rent,
    car: string,
    carObject: Car,
    days: number,
    rent_from: Date | string,
    setup: boolean,
    price: number | string
}