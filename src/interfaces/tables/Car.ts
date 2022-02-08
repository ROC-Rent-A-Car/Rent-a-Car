import { TableBase } from "./TableBase";

export interface Car extends TableBase {
    license: string,
    brand: string,
    model: string,
    price: number,
    image: string,
    description: string | null
}