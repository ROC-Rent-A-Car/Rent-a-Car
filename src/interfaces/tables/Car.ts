import { TableBase } from "./TableBase";

export interface Car extends TableBase {
    license: string,
    brand: string,
    model: string,
    price: number | string,
    image: string,
    description: string | null,
    disabled: boolean
}