import { TableBase } from "./TableBase";

export interface Car extends TableBase {
    license: string,
    brand: string,
    type: string,
    price: number,
    image: string,
    description: string | null
}