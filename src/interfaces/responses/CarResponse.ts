import { TableBase } from "../tables/TableBase";

export interface CarResponse extends TableBase {
    license: string,
    brand: string,
    model: string,
    price: number,
    image: string,
    description: string | null
}