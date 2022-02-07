import { TableBase } from "./TableBase";

export interface Rent extends TableBase {
    user: string,
    pending: boolean,
    pending_since: Date
}